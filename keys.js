/* 
* Copyright 2017 SideeX committers 
* 
* Licensed under the Apache License, Version 2.0 (the "License"); 
* you may not use this file except in compliance with the License. 
* You may obtain a copy of the License at 
* 
* http://www.apache.org/licenses/LICENSE-2.0 
* 
* Unless required by applicable law or agreed to in writing, software 
* distributed under the License is distributed on an "AS IS" BASIS, 
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
* See the License for the specific language governing permissions and 
* limitations under the License. 
* 
*/

var triggerKeyEvent = function(element, eventType, keySequence, canBubble, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown) {
    var keycode = keySequence.code;
    var evt;
    evt = document.createEvent('Event');
    evt.initEvent(eventType, true, true);
    evt.view = window;
    evt.altKey = altKeyDown;
    evt.ctrlKey = controlKeyDown;
    evt.shiftKey = shiftKeyDown;
    evt.metaKey = metaKeyDown;
    evt.keyCode = keycode;
    evt.bubbles = true;
    element.dispatchEvent(evt);
};

var findElement = function(locator){
    switch(locator.type){
        case 'id':
            return document.querySelector('#' + locator.string);
            break;
        case 'link':
            var temp = document.getElementsByTagName("A");
            var i;
            for(i = 0; i < x.length; i++){
                if(temp[i].textContent == locator.string)
                    return temp[i];
            }
        case 'name':
            return document.getElementsByName(locator.string)[0];
        case 'css':
            return document.querySelector(locator.string);
            break;
        case 'implicit':
            return document.evaluate(locator.string, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            break;
        default:
    }
};

window.addEventListener("message", function(event) {
    if (event.source == window && event.data && event.data.direction == "from-sendkeys") {
        var element = findElement(event.data.element);
        triggerKeyEvent(element, 'keydown', event.data.keys);
        triggerKeyEvent(element, 'keypress', event.data.keys);
        triggerKeyEvent(element, 'keyup', event.data.keys);
    }
});