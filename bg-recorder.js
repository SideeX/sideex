/*
 * Copyright 2017 SideeX committers
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

// TODO: seperate UI

class BackgroundRecorder {
    constructor() {
        this.currentRecordingTabId = -1;
        this.currentRecordingWindowId = -1;
        this.currentRecordingFrameLocation = "root";
        this.openedTabNames = {};
        this.openedTabIds = {};
        this.openedWindowIds = {};
        this.openedTabCount = 1;
        this.contentWindowId = -1;
        this.selfWindowId = -1;
        this.attached = false;
        this.rebind();
    }

    // TODO: rename method
    tabsOnActivatedHandler(activeInfo) {
        if (this.currentRecordingTabId === activeInfo.tabId && this.currentRecordingWindowId === activeInfo.windowId)
            return;
        // If no command has been recorded, ignore selectWindow command
        // until the user has select a starting page to record the commands
        if (getRecordsArray().length === 0)
            return;
        // Ignore all unknown tabs, the activated tab may not derived from
        // other opened tabs, or it may managed by other SideeX panels
        if (!this.openedTabIds[activeInfo.tabId])
            return;
        // Tab information has existed, add selectWindow command
        this.currentRecordingTabId = activeInfo.tabId;
        this.currentRecordingWindowId = activeInfo.windowId;
        this.currentRecordingFrameLocation = "root";

        // Because event listener is so fast that selectWindow command is added
        // before other commands like clicking a link to browse in new tab.
        // Delay a little time to add command in order.
        setTimeout(addCommandAuto, 150,
            "selectWindow", [[this.openedTabIds[activeInfo.tabId]]], "");
    }

    windowsOnFocusChangedHandler(windowId) {

        if (this.windowId === browser.windows.WINDOW_ID_NONE) {
            // In some Linux window managers, WINDOW_ID_NONE will be listened before switching
            // See MDN reference :
            // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/windows/onFocusChanged
            return;
        }

        // If the activated window is the same as the last, just do nothing
        // selectWindow command will be handled by tabs.onActivated listener
        // if there also has a event of switching a activated tab
        if (this.currentRecordingWindowId === windowId)
            return;

        let self = this;

        browser.tabs.query({
            windowId: windowId,
            active: true
        }).then(function(tabs) {
            if(tabs.length === 0 || self.isPrivilegedPage(tabs[0].url)) {
                return;
            }

            // The activated tab is not the same as the last
            if (tabs[0].id !== self.currentRecordingTabId) {
                // If no command has been recorded, ignore selectWindow command
                // until the user has select a starting page to record commands
                if (getRecordsArray().length === 0)
                    return;

                // Ignore all unknown tabs, the activated tab may not derived from
                // other opened tabs, or it may managed by other SideeX panels
                if (!self.openedTabIds[tabs[0].id])
                    return;

                // Tab information has existed, add selectWindow command
                self.currentRecordingWindowId = windowId;
                self.currentRecordingTabId = tabs[0].id;
                self.currentRecordingFrameLocation = "root";
                addCommandAuto("selectWindow", [[self.openedTabIds[tabs[0].id]]], "");
            }
        });
    }

    tabsOnRemovedHandler(tabId, removeInfo) {
        if (this.openedTabIds[tabId]) {
            if (this.currentRecordingTabId !== tabId) {
                addCommandAuto("selectWindow", [
                    [this.openedTabIds[tabId]]
                ], "");
                addCommandAuto("close", [
                    [this.openedTabIds[tabId]]
                ], "");
                addCommandAuto("selectWindow", [
                    [this.openedTabIds[this.currentRecordingTabId]]
                ]);
            } else {
                addCommandAuto("close", [
                    [this.openedTabIds[tabId]]
                ], "");
            }
            delete this.openedTabNames[openedTabIds[tabId]];
            delete this.openedTabIds[tabId];
            this.currentRecordingFrameLocation = "root";
        }
    }

    webNavigationOnCreatedNavigationTargetHandler(details) {
        if (this.openedTabIds[details.sourceTabId]) {
            this.openedTabNames["win_ser_" + this.openedTabCount] = details.tabId;
            this.openedTabIds[details.tabId] = "win_ser_" + this.openedTabCount;
            this.setOpenedWindow(details.windowId);
            this.openedTabCount++;
        }
    };

    addCommandMessageHandler(message, sender, sendRequest) {
        if (!message.command || !this.openedWindowIds[sender.tab.windowId])
            return;

        if (getRecordsArray().length === 0) {
            this.currentRecordingTabId = sender.tab.id;
            this.currentRecordingWindowId = sender.tab.windowId;
            this.openedTabNames["win_ser_local"] = sender.tab.id;
            this.openedTabIds[sender.tab.id] = "win_ser_local";
            addCommandAuto("open", [
                [sender.tab.url]
            ], "");

            browser.tabs.query({windowId: sender.tab.windowId, url: "<all_urls>"})
            .then(function(tabs) {
                for(let tab of tabs) {
                    if (tab.id != sender.tab.id) {
                        browser.tabs.sendMessage(tab.id, {detachRecorder: true});
                    }
                }
            });
        }

        if (!this.openedTabIds[sender.tab.id])
            return;

        if (message.frameLocation !== this.currentRecordingFrameLocation) {
            let newFrameLevels = message.frameLocation.split(':');
            let oldFrameLevels = this.currentRecordingFrameLocation.split(':');
            while (oldFrameLevels.length > newFrameLevels.length) {
                addCommandAuto("selectFrame", [
                    ["relative=parent"]
                ], "");
                oldFrameLevels.pop();
            }
            while (oldFrameLevels.length != 0 && oldFrameLevels[oldFrameLevels.length - 1] != newFrameLevels[oldFrameLevels.length - 1]) {
                addCommandAuto("selectFrame", [
                    ["relative=parent"]
                ], "");
                oldFrameLevels.pop();
            }
            while (oldFrameLevels.length < newFrameLevels.length) {
                addCommandAuto("selectFrame", [
                    ["index=" + newFrameLevels[oldFrameLevels.length]]
                ], "");
                oldFrameLevels.push(newFrameLevels[oldFrameLevels.length]);
            }
            this.currentRecordingFrameLocation = message.frameLocation;
        }

        //Record: doubleClickAt
        if (message.command == "doubleClickAt") {
            var command = getRecordsArray();
            var select = getSelectedRecord();
            var length = (select == "") ? getRecordsNum() : select.split("-")[1] - 1;
            var equaln = getCommandName(command[length - 1]) == getCommandName(command[length - 2]);
            var equalt = getCommandTarget(command[length - 1]) == getCommandTarget(command[length - 2]);
            var equalv = getCommandValue(command[length - 1]) == getCommandValue(command[length - 2]);
            if (getCommandName(command[length - 1]) == "clickAt" && equaln && equalt && equalv) {
                deleteCommand(command[length - 1].id);
                deleteCommand(command[length - 2].id);
                if (select != "") {
                    var current = document.getElementById(command[length - 2].id)
                    current.className += ' selected';
                }
            }
        } else if (message.command.includes("store")) {
            // In Google Chrome, window.prompt() must be triggered in
            // an actived tabs of front window, so we let panel window been focused
            browser.windows.update(this.selfWindowId, {focused: true})
            .then(function() {
                // Even if window has been focused, window.prompt() still failed.
                // Delay a little time to ensure that status has been updated 
                setTimeout(function() {
                    message.value = prompt("Enter the name of the variable");
                    if (message.insertBeforeLastCommand) {
                        addCommandBeforeLastCommand(message.command, message.target, message.value);
                    } else {
                        notification(message.command, message.target, message.value);
                        addCommandAuto(message.command, message.target, message.value);
                    }
                }, 100);
            })
            return;
        }

        //handle choose ok/cancel confirm
        if (message.insertBeforeLastCommand) {
            addCommandBeforeLastCommand(message.command, message.target, message.value);
        } else {
            notification(message.command, message.target, message.value);
            addCommandAuto(message.command, message.target, message.value);
        }
    }

    isPrivilegedPage (url) {
        if (url.substr(0, 13) == 'moz-extension' ||
            url.substr(0, 16) == 'chrome-extension') {
            return true;
        }
        return false;
    }

    rebind() {
        this.tabsOnActivatedHandler = this.tabsOnActivatedHandler.bind(this);
        this.windowsOnFocusChangedHandler = this.windowsOnFocusChangedHandler.bind(this);
        this.tabsOnRemovedHandler = this.tabsOnRemovedHandler.bind(this);
        this.webNavigationOnCreatedNavigationTargetHandler = this.webNavigationOnCreatedNavigationTargetHandler.bind(this);
        this.addCommandMessageHandler = this.addCommandMessageHandler.bind(this);
    }

    attach() {
        if (this.attached) {
            return;
        }
        this.attached = true;
        browser.tabs.onActivated.addListener(this.tabsOnActivatedHandler);
        browser.windows.onFocusChanged.addListener(this.windowsOnFocusChangedHandler);
        browser.tabs.onRemoved.addListener(this.tabsOnRemovedHandler);
        browser.webNavigation.onCreatedNavigationTarget.addListener(this.webNavigationOnCreatedNavigationTargetHandler);
        browser.runtime.onMessage.addListener(this.addCommandMessageHandler);
    }

    detach() {
        if (!this.attached) {
            return;
        }
        this.attached = false;
        browser.tabs.onActivated.removeListener(this.tabsOnActivatedHandler);
        browser.windows.onFocusChanged.removeListener(this.windowsOnFocusChangedHandler);
        browser.tabs.onRemoved.removeListener(this.tabsOnRemovedHandler);
        browser.webNavigation.onCreatedNavigationTarget.removeListener(this.webNavigationOnCreatedNavigationTargetHandler);
        browser.runtime.onMessage.removeListener(this.addCommandMessageHandler);
    }

    setOpenedWindow(windowId) {
        this.openedWindowIds[windowId] = true;
    }

    setSelfWindowId(windowId) {
        this.selfWindowId = windowId;
    }
}
