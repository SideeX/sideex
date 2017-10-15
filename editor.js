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

/* recording */
var selfWindowId = -1;
var contentWindowId;
var notificationCount = 0;

var recorder = new BackgroundRecorder();

/* flags */
var isRecording = false;
var isPlaying = false;
var initialSetFlag = true;

class Editor {

}

function handleMessage(message, sender, sendResponse) {
    if (message.selectTarget) {

        var target = message.target;
        // show first locator by default
        var locatorString = target[0][0];

        var locatorList = document.createElement("datalist");
        for (var m = 0; m < message.target.length; ++m) {
            var option = document.createElement("option");
            option.appendChild(document.createTextNode(message.target[m][0]));
            option.innerText = message.target[m][0];
            locatorList.appendChild(option);
        }

        var selectedRecordId = getSelectedRecord();

        // If selecting a command, change the target inside.
        if (selectedRecordId != "") {
            var selectedRecord = document.getElementById(selectedRecordId);
            var originalLocatorlist = selectedRecord.getElementsByTagName("td")[1].getElementsByTagName("datalist")[0];

            // Update locator data list
            originalLocatorlist.innerHTML = escapeHTML(locatorList.innerHTML);

            // Update target view, show first locator by default
            var adjustedString = adjustTooLongStr(locatorString, getTdShowValueNode(selectedRecord, 1));
            var node = getTdShowValueNode(selectedRecord, 1);
            if (node.childNodes && node.childNodes[0])
                node.removeChild(node.childNodes[0]);
            node.appendChild(document.createTextNode(adjustedString));

            // Update hidden actual locator value
            node = getTdRealValueNode(selectedRecord, 1);
            if (node.childNodes && node.childNodes[0])
                node.removeChild(node.childNodes[0]);
            node.appendChild(document.createTextNode(locatorString));

        } else if (document.getElementsByClassName("record-bottom active").length > 0) {
            // If selecting a blank command;
            addCommandAuto("", target, "");
        }

        // Update toolbar
        document.getElementById("command-target").value = unescapeHtml(locatorString);
        document.getElementById("target-dropdown").innerHTML = unescapeHtml(locatorList.innerHTML);
        document.getElementById("command-target-list").innerHTML = escapeHTML(locatorList.innerHTML);

        return;
    }
    if (message.cancelSelectTarget) {
        var button = document.getElementById("selectElementButton");
        isSelecting = false; 
        button.textContent = "Select";
        browser.tabs.sendMessage(sender.tab.id, {selectMode: true, selecting: false});
        return;
    }

    if (message.attachRecorderRequest) {
        if (isRecording && !isPlaying &&
            (recorder.openedTabIds[sender.tab.id] || getRecordsArray().length == 0)) {
            browser.tabs.sendMessage(sender.tab.id, {attachRecorder: true});
        }
        return;
    }
}

browser.runtime.onMessage.addListener(handleMessage);

browser.runtime.onMessage.addListener(function contentWindowIdListener(message) {
    if (message.selfWindowId != undefined && message.commWindowId != undefined) {
        selfWindowId = message.selfWindowId;
        contentWindowId = message.commWindowId;
        extCommand.setContentWindowId(contentWindowId);
        recorder.setOpenedWindow(contentWindowId);
        recorder.setSelfWindowId(selfWindowId);
        browser.runtime.onMessage.removeListener(contentWindowIdListener);
    }
})

function notification(command, target, value) {
    let tempCount = String(notificationCount);
    notificationCount++;
    // In Chrome, notification.create must have "iconUrl" key in notificationOptions
    browser.notifications.create(tempCount, {
        "type": "basic",
        "iconUrl": "/icons/icons-48.png",
        "title": "Record command!",
        "message": "command: " + String(command) + "\ntarget: " + String(target[0][0]) + "\nvalue: " + String(value) 
    });

    setTimeout(function() {
        browser.notifications.clear(tempCount);
    }, 1500);
}
