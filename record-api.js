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

var frameLocation = "";

class Recorder {
    constructor(window) {
        this.window = window;
        this.attached = false;
    }

    parseEventKey(eventKey) {
        if (eventKey.match(/^C_/)) {
            return { eventName: eventKey.substring(2), capture: true };
        } else {
            return { eventName: eventKey, capture: false };
        }
    }

    attach() {
        if (this.attached) {
            return;
        }
        this.attached = true;
        this.eventListeners = {};
        for (let eventKey in Recorder.eventHandlers) {
            var eventInfo = this.parseEventKey(eventKey);
            var eventName = eventInfo.eventName;
            var capture = eventInfo.capture;

            var handlers = Recorder.eventHandlers[eventKey];
            this.eventListeners[eventKey] = [];
            for (let i = 0 ; i < handlers.length ; i++) {
                this.window.document.addEventListener(eventName, handlers[i], capture);
                this.eventListeners[eventKey].push(handlers[i]);
            }
        }
    }

    detach() {
        if (!this.attached) {
            return;
        }
        this.attached = false;
        for (eventKey in this.eventListeners) {
            var eventInfo = this.parseEventKey(eventKey);
            var eventName = eventInfo.eventName;
            var capture = eventInfo.capture;
            for (let i = 0 ; i < this.eventListeners[eventKey].length ; i++) {
                this.window.document.removeEventListener(eventName, this.eventListeners[eventKey][i], capture)
            }
        }
        delete this.eventListeners;
    }
}

Recorder.eventHandlers = {};
Recorder.addEventHandler = function(handlerName, eventName, handler, options) {
    handler.handlerName = handlerName;
    if (!options) options = false;
    let key = options ? ('C_' + eventName) : eventName;
    if (!this.eventHandlers[key]) {
        this.eventHandlers[key] = [];
    }
    this.eventHandlers[key].push(handler);
}



var recorder = new Recorder(window);


// show element
function startShowElement(message, sender, sendResponse){
    if (message.showElement) {
        result = selenium["doShowElement"](message.targetValue);
        return Promise.resolve({result: result});
    }
}
browser.runtime.onMessage.addListener(startShowElement);

// set frame id
(function getframeLocation() {
    let currentWindow = window;
    let currentParentWindow;
    while (currentWindow !== window.top) {
        currentParentWindow = currentWindow.parent;
        for (let idx = 0; idx < currentParentWindow.frames.length; idx++)
            if (currentParentWindow.frames[idx] === currentWindow) {
                frameLocation = ":" + idx + frameLocation;
                currentWindow = currentParentWindow;
                break;
            }
    }
    frameLocation = "root" + frameLocation;
})();

browser.runtime.sendMessage({
    frameLocation: frameLocation
}).catch(function(reason) {
    // Failed silently if receiving end does not exist
});

/* record */
function record(command, target, value, insertBeforeLastCommand, actualFrameLocation) {
    browser.runtime.sendMessage({
        command: command,
        target: target,
        value: value,
        insertBeforeLastCommand: insertBeforeLastCommand,
        frameLocation: (actualFrameLocation != undefined ) ? actualFrameLocation : frameLocation,
    }).catch (function(reason) {
        // If receiving end does not exist, detach the recorder
        recorder.detach();
    });
}

