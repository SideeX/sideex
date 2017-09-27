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

class ExtCommand {

    constructor(contentWindowId) {
        this.playingTabNames = {};
        this.playingTabIds = {};
        this.playingTabStatus = {};
        this.playingFrameLocations = {};
        this.playingTabCount = 1;
        this.currentPlayingTabId = -1;
        this.contentWindowId = contentWindowId ? contentWindowId : -1;
        this.currentPlayingFrameLocation = 'root';
        // TODO: flexible wait
        this.waitInterval = 500;
        this.waitTimes = 60;

        this.attached = false;

        // Use ES6 arrow function to bind correct this
        this.tabsOnUpdatedHandler = (tabId, changeInfo, tabInfo) => {
            if (changeInfo.status) {
                if (changeInfo.status == "loading") {
                    this.setLoading(tabId);
                } else {
                    this.setComplete(tabId);
                }
            }
        }
    }

    init() {
        this.attach();
        this.playingTabNames = {};
        this.playingTabIds = {};
        this.playingTabStatus = {};
        this.playingFrameLocations = {};
        this.playingTabCount = 1;
        this.currentPlayingWindowId = this.contentWindowId;
        let self = this;
        this.currentPlayingFrameLocation = "root";
        return this.queryActiveTab(this.currentPlayingWindowId)
               .then(function setFirstTab(tab) {
                   self.currentPlayingTabId = tab.id;
                   self.playingTabNames["win_ser_local"] = self.currentPlayingTabId;
                   self.playingTabIds[self.currentPlayingTabId] = "win_ser_local";
                   self.playingFrameLocations[self.currentPlayingTabId] = {};
                   self.playingFrameLocations[self.currentPlayingTabId]["root"] = 0;
                   // we assume that there has an "open" command
                   // select Frame directly will cause failed
                   self.playingTabStatus[self.currentPlayingTabId] = true;
               }).catch(function createNewWindow(e){
                   console.log(e);
                   // : TODO: create a new window if not exist
               });
    }

    clear() {
        this.detach();
        this.playingTabNames = {};
        this.playingTabIds = {};
        this.playingTabStatus = {};
        this.playingFrameLocations = {};
        this.playingTabCount = 1;
        this.currentPlayingWindowId = undefined;
    }

    attach() {
        if(this.attached) {
            return;
        }
        this.attached = true;
        browser.tabs.onUpdated.addListener(this.tabsOnUpdatedHandler);
    }

    detach() {
        if(!this.attached) {
            return;
        }
        this.attached = false;
        browser.tabs.onUpdated.removeListener(this.tabsOnUpdatedHandler);
    }

    setContentWindowId(contentWindowId) {
        this.contentWindowId = contentWindowId;
    }

    getContentWindowId() {
        return this.contentWindowId;
    }

    getCurrentPlayingTabId() {
        return this.currentPlayingTabId;
    }

    getCurrentPlayingFrameLocation() {
        return this.currentPlayingFrameLocation;
    }

    getFrameId(tabId) {
        if (tabId >= 0) {
            return this.playingFrameLocations[tabId][this.currentPlayingFrameLocation];
        } else {
            return this.playingFrameLocations[this.currentPlayingTabId][this.currentPlayingFrameLocation];
        }
    }

    getCurrentPlayingFrameId() {
        return this.getFrameId(this.currentPlayingTabId);
    }

    getPageStatus() {
        return this.playingTabStatus[this.getCurrentPlayingTabId()];
    }

    queryActiveTab(windowId) {
        return browser.tabs.query({windowId: windowId, active: true, url: "<all_urls>"})
           .then(function(tabs) {
               if (!tabs.length)
                   return Promise.reject("No matched Tab");
               return tabs[0];
           });
    }

    sendCommand(command, target, value, top) {
        let tabId = this.getCurrentPlayingTabId();
        let frameId = this.getCurrentPlayingFrameId();
        return browser.tabs.sendMessage(tabId, {
            commands: command,
            target: target,
            value: value
        }, { frameId: top ? 0 : frameId });
    }

    setLoading(tabId) {
        // Does clearing the object will cause some problem(e.g. missing the frameId)?
        // Ans: Yes, but I don't know why
        this.initTabInfo(tabId);
        // this.initTabInfo(tabId, true); (failed)
        this.playingTabStatus[tabId] = false;
    }

    setComplete(tabId) {
        this.initTabInfo(tabId);
        this.playingTabStatus[tabId] = true;
    }

    initTabInfo(tabId, forced) {
        if (!this.playingFrameLocations[tabId] | forced) {
            this.playingFrameLocations[tabId] = {};
            this.playingFrameLocations[tabId]["root"] = 0;
        }
    }

    setFrame(tabId, frameLocation, frameId) {
        this.playingFrameLocations[tabId][frameLocation] = frameId;
    }

    hasTab(tabId) {
        return this.playingTabIds[tabId];
    }

    setNewTab(tabId) {
        this.playingTabNames["win_ser_" + this.playingTabCount] = tabId;
        this.playingTabIds[tabId] = "win_ser_" + this.playingTabCount;
        this.playingTabCount++;
    }

    doOpen(url) {
        return browser.tabs.update(this.currentPlayingTabId, {
            url: url
        })
    }

    doPause(ignored, milliseconds) {
        return new Promise(function(resolve) {
            setTimeout(resolve, milliseconds);
        });
    }

    doSelectFrame(frameLocation) {
        let result = frameLocation.match(/(index|relative) *= *([\d]+|parent)/i);
        if (result && result[2]) {
            let position = result[2];
            if (position == "parent") {
                this.currentPlayingFrameLocation = this.currentPlayingFrameLocation.slice(0, this.currentPlayingFrameLocation.lastIndexOf(':'));
            } else {
                this.currentPlayingFrameLocation += ":" + position;
            }
            return this.wait("playingFrameLocations", this.currentPlayingTabId, this.currentPlayingFrameLocation);
        } else {
            return Promise.reject("Invalid argument");
        }
    }

    doSelectWindow(serialNumber) {
        let self = this;
        return this.wait("playingTabNames", serialNumber)
               .then(function() {
                   self.currentPlayingTabId = self.playingTabNames[serialNumber];
                   browser.tabs.update(self.currentPlayingTabId, {active: true});
               })
    }

    doClose() {
        let removingTabId = this.currentPlayingTabId;
        this.currentPlayingTabId = -1;
        delete this.playingFrameLocations[removingTabId];
        return browser.tabs.remove(removingTabId);
    }

    wait(...properties) {
        if (!properties.length)
            return Promise.reject("No arguments");
        let self = this;
        let ref = this;
        let inspecting = properties[properties.length - 1];
        for (let i = 0; i < properties.length - 1; i++) {
            if (!ref[properties[i]] | !(ref[properties[i]] instanceof Array | ref[properties[i]] instanceof Object))
                return Promise.reject("Invalid Argument");
            ref = ref[properties[i]];
        }
        return new Promise(function(resolve, reject) {
            let counter = 0;
            let interval = setInterval(function() {
                if (ref[inspecting] == undefined) {
                    counter++;
                    if (counter > self.waitTimes) {
                        reject("Timeout");
                        clearInterval(interval);
                    }
                } else {
                    resolve();
                    clearInterval(interval);
                }
            }, self.waitInterval);
        })
    }

}

function isExtCommand(command) {
    switch(command) {
        case "pause":
        //case "open":
        case "selectFrame":
        case "selectWindow":
        case "close":
            return true;
        default:
            return false;
    }
}
