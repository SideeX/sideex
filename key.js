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