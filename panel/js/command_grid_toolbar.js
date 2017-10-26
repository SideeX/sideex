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

 var tempCommand = [];

function getSelectedCase() {
    if (document.getElementById("testCase-grid").getElementsByClassName("selectedCase")) {
        return document.getElementById("testCase-grid").getElementsByClassName("selectedCase")[0];
    } else {
        return null;
    }
}

function getSelectedRecord() {
    var selectedNode = document.getElementById("records-grid")
        .getElementsByClassName("selectedRecord");
    if (selectedNode.length) {
        return selectedNode[0].id;
    } else {
        return "";
    }
}

function getSelectedRecords() {
    var selectedNode = document.getElementById("records-grid").getElementsByClassName("selectedRecord");
    if (selectedNode.length) {
        return selectedNode;
    } else {
        return "";
    }
    
}

function getStringLengthInPx(str) {
    var d = document.createElement("div");
    d.appendChild(document.createTextNode(str));
    d.style = "position:absolute;visibility:hidden;";
    d.id = "d_getpx";
    document.body.appendChild(d);
    var px = document.getElementById("d_getpx").clientWidth;
    document.body.removeChild(document.getElementById("d_getpx"));
    return px;
}

function adjustTooLongStr(str, node) {
    var l = str.length;

    while (getStringLengthInPx(str) + 12 > node.clientWidth) {
        str = str.slice(0, -1);
    }
    if (str.length < l) {
        str = str + "..........";
    }
    return str;
}

function addCommand(command_name, command_target_array, command_value, auto, insertCommand) {
    // create default test suite and case if necessary
    var s_suite = getSelectedSuite(),
        s_case = getSelectedCase();
    if (!s_suite || !s_case) {
        var id = "case" + sideex_testCase.count;
        sideex_testCase.count++;
        addTestCase("Untitled Test Case", id);
    }

    // mark modified
    modifyCaseSuite();
    closeConfirm(true);
    
    // create tr node     
    var new_record = document.createElement("tr");
    new_record.setAttribute("class", "");
    new_record.setAttribute("style", "");
    new_record.appendChild(document.createTextNode("\n    "));

    // create td node
    for (var i = 0; i < 3; ++i) {
        var td = document.createElement("td");
        var div_show = document.createElement("div");
        var div_hidden = document.createElement("div");
        div_show.style = "overflow:hidden;height:15px;";
        div_hidden.style = "display:none;";
        new_record.appendChild(td);
        if (i == 0) {
            div_hidden.appendChild(document.createTextNode(command_name));
            new_record.appendChild(document.createTextNode("\n    "));
        } else if (i == 1) {
            // use textNode to avoid tac's tag problem (textNode's content will be pure text, does not be parsed as html)
            div_hidden.appendChild(document.createTextNode(command_target_array[0][0]));
            new_record.appendChild(document.createTextNode("\n    "));
        } else {
            div_hidden.appendChild(document.createTextNode(command_value));
            new_record.appendChild(document.createTextNode("\n"));
        }
        td.appendChild(div_hidden);
        td.appendChild(div_show);
    }

    // append datalist to target
    var targets = document.createElement("datalist");
    for (var m = 0; m < command_target_array.length; ++m) {
        var option = document.createElement("option");
        // use textNode to avoid tac's tag problem (textNode's content will be pure text, does not be parsed as html)
        option.appendChild(document.createTextNode(command_target_array[m][0]));
        option.text=command_target_array[m][0];
        targets.appendChild(option);
    }
    new_record.getElementsByTagName("td")[1].appendChild(targets);

    // var selected_ID = getSelectedRecord();
    // NOTE: change new API for get selected records
    var selectedRecords = getSelectedRecords();
    var selected_ID;
    if (selectedRecords.length > 0) {
         selected_ID = selectedRecords[selectedRecords.length-1].id;
    }

    var count = parseInt(getRecordsNum()) + 1;
    document.getElementById("records-count").value = count;
    if (count != 1) {
        // remove green line
        // document.getElementById("records-" + (count - 1)).style = "";
    }
    if (selected_ID) {
        if (auto) {
            document.getElementById(selected_ID).parentNode.insertBefore(new_record, document.getElementById(selected_ID));
            selected_ID = parseInt(selected_ID.split("-")[1]);
        } else {
            document.getElementById(selected_ID).parentNode.insertBefore(new_record, document.getElementById(selected_ID).nextSibling);
            selected_ID = parseInt(selected_ID.split("-")[1]) + 1;
        }
        reAssignId("records-" + selected_ID, "records-" + count);
        attachEvent(selected_ID, selected_ID);
        if (auto) {
            selected_ID = "#records-" + (selected_ID + 1);
            $(selected_ID).addClass('selectedRecord');
        }
    } else {
        if (insertCommand) {
            document.getElementById("records-grid").insertBefore(new_record, getRecordsArray()[getRecordsNum()-2]);
        } else {
            document.getElementById("records-grid").appendChild(new_record);
        }
        reAssignId("records-1", "records-" + count);
        attachEvent(1, count);

        // focus on new element
        document.getElementById("records-" + count).scrollIntoView(false);
    }
    if (auto) {
        new_record.parentNode.insertBefore(document.createTextNode("\n"), new_record.nextSibling);
    } else {
        new_record.parentNode.insertBefore(document.createTextNode("\n"), new_record);
    }

    // set div_show's innerHTML here, because we need div's clientWidth 
    for (var k = 0; k < 3; ++k) {
        var tooLongStr;
        if (k == 0) {
            tooLongStr = command_name;
        } else if (k == 1) {
            tooLongStr = command_target_array[0][0];
        } else {
            tooLongStr = command_value;
        }
        var adjust = adjustTooLongStr(tooLongStr, getTdShowValueNode(new_record, k));
        getTdShowValueNode(new_record, k).appendChild(document.createTextNode(adjust));
    }

    // store command grid to testCase
    var s_case = getSelectedCase();
    if (s_case) {
        sideex_testCase[s_case.id].records = document.getElementById("records-grid").innerHTML;
    }
}

// add command manually (append downward)
function addCommandManu(command_name, command_target_array, command_value) {
    addCommand(command_name, command_target_array, command_value, 0, false);
}

// add command before last command (append upward)
function addCommandBeforeLastCommand(command_name, command_target_array, command_value) {
    addCommand(command_name, command_target_array, command_value, 0, true);
}

// add command automatically (append upward)
function addCommandAuto(command_name, command_target_array, command_value) {
    addCommand(command_name, command_target_array, command_value, 1, false);
}

$("#command-command").on("input", function(event) {
    var temp = getSelectedRecord();
    if (temp) {
        var div = getTdRealValueNode(document.getElementById(temp), 0);
        // set innerHTML = ""
        if (div.childNodes && div.childNodes[0]) {
            div.removeChild(div.childNodes[0]);
        }
        div.appendChild(document.createTextNode(event.target.value));

        var command_command = event.target.value;
        div = getTdShowValueNode(document.getElementById(temp), 0);
        var command_command_adjust = adjustTooLongStr(command_command, div);
        if (div.childNodes && div.childNodes[0]) {
            div.removeChild(div.childNodes[0]);
        }
        div.appendChild(document.createTextNode(command_command_adjust));

        // store command grid to testCase
        var s_case = getSelectedCase();
        if (s_case) {
            sideex_testCase[s_case.id].records = document.getElementById("records-grid").innerHTML;
			modifyCaseSuite();		
        }
    }
});

$("#command-target").on("input", function(event) {
    var temp = getSelectedRecord();
    if (temp) {
        var div = getTdRealValueNode(document.getElementById(temp), 1);
        // set innerHTML = ""
        if (div.childNodes && div.childNodes[0]) {
            div.removeChild(div.childNodes[0]);
        }
        div.appendChild(document.createTextNode(event.target.value));

        var command_target = event.target.value;
        div = getTdShowValueNode(document.getElementById(temp), 1);
        var command_target_adjust = adjustTooLongStr(command_target, div);
        if (div.childNodes && div.childNodes[0]) {
            div.removeChild(div.childNodes[0]);
        }
        div.appendChild(document.createTextNode(command_target_adjust));

        // store command grid to testCase
        var s_case = getSelectedCase();
        if (s_case) {
            sideex_testCase[s_case.id].records = document.getElementById("records-grid").innerHTML;
			modifyCaseSuite();		
        }
    }
});
$("#command-value").on("input", function(event) {
    var temp = getSelectedRecord();
    if (temp) {
        var div = getTdRealValueNode(document.getElementById(temp), 2);
        // set innerHTML = ""
        if (div.childNodes && div.childNodes[0]) {
            div.removeChild(div.childNodes[0]);
        }
        div.appendChild(document.createTextNode(event.target.value));

        var command_value = event.target.value;
        div = getTdShowValueNode(document.getElementById(temp), 2);
        var command_value_adjust = adjustTooLongStr(command_value, div);
        if (div.childNodes && div.childNodes[0]) {
            div.removeChild(div.childNodes[0]);
        }
        div.appendChild(document.createTextNode(command_value_adjust));

        // store command grid to testCase
        var s_case = getSelectedCase();
        if (s_case) {
            sideex_testCase[s_case.id].records = document.getElementById("records-grid").innerHTML;
			modifyCaseSuite();
        }
    }
});

document.getElementById("grid-add").addEventListener("click", function() {
    // target is 2-D array
    addCommandManu("", [
        [""]
    ], "");
}, false);

// "delete" command is different from add and reorder
function reAssignIdForDelete(delete_ID, count) {
    var records = getRecordsArray();
    for (var i = delete_ID - 1; i < count; ++i) {
        records[i].id = "records-" + (i + 1);
    }
    classifyRecords(delete_ID, count);
}

document.getElementById("grid-deleteAll").addEventListener("click", function() {
    var selectedNode = document.getElementById("records-grid").getElementsByTagName("TR");
    for(var i=selectedNode.length;i>0;i--){
        deleteCommand("records-" + i);
    }
}, false);

document.getElementById("grid-delete").addEventListener("click", function() {
    deleteCommand(getSelectedRecord());
}, false);

document.getElementById("grid-copy").addEventListener("click", function(event) {
    copyCommand();
}, false);

document.getElementById("grid-paste").addEventListener("click", function() {
    /*if (tempCommand != undefined) {
        addCommandManu(tempCommand["command"], tempCommand["target"], tempCommand["value"]);
        // addCommandManu(tempCommand["command"], [[tempCommand["test"]]], tempCommand["value"]);
    }*/
    pasteCommand();
}, false);

// Hot key setting
document.addEventListener("keydown", function(event) {
    var keyNum;
    if(window.event) { // IE
        keyNum = event.keyCode;
    } else if(event.which) { // Netscape/Firefox/Opera
        keyNum = event.which;
    }

    if (keyNum == 123) {
        return;
    } else if (event.target.tagName.toLowerCase() == "input") {
        // to avoid typing in input
        if (event.ctrlKey || keyNum == 116) {
            if (keyNum == 65 || keyNum == 67 || keyNum == 86 || keyNum == 88) {
                // enable Ctrl + A, C, V, X
                return;
            }
            // NOTE: lock the browser default shortcuts
            // and this should be careful
            event.preventDefault();
            event.stopPropagation();
        }
    } else {
        // NOTE: lock the browser default shortcuts
        // and this should be careful
        event.preventDefault();
        event.stopPropagation();
    }

    // Hot key
    if(keyNum == 46){ // Hot key: del
        let selectedTr = getSelectedRecords();
        for (let i=selectedTr.length-1 ; i>=0 ; i--) {
            deleteCommand(selectedTr[i].id);
        }
    } else if (keyNum == 38) { // Hot key: up arrow
        selectForeRecord();
    } else if (keyNum == 40) { // Hot key: down arrow
        selectNextRecord();
    }

    // hot keys: Ctrl + [KEY]
    if (event.ctrlKey) {
        if (keyNum == 67) { // Ctrl + C
            copyCommand();
        } else if (keyNum == 86) { // Ctrl + V
            pasteCommand();
        } else if (keyNum == 83) { // Ctrl + S
            $("#save-testSuite").click();
        } else if (keyNum == 65) { // Ctrl + A
            var recordNode = document.getElementById("records-grid").getElementsByTagName("TR");
            for (let i=0 ; i<recordNode.length ; i++) {
                recordNode[i].classList.add("selectedRecord");
            }
        } else if (keyNum == 80) { // Ctrl + P
            $("#playback").click();
        } else if (keyNum === 66) { // Ctrl + T
            setBreakpoint(getSelectedRecord());
        } else if (keyNum == 73) { // Ctrl + I
            $("#grid-add").click();
        } else if (keyNum == 88) { // Ctrl + X
            copyCommand();
            let selectedRecords = getSelectedRecords();
            for(let i=selectedRecords.length-1 ; i>=0 ; i--){
                deleteCommand(selectedRecords[i].id);
            }
        } else if (keyNum == 79) { // Ctrl + O
            $('#load-testSuite-hidden').click();
        }
    }
}, false);

function deleteCommand(selected_ID) {
    if (selected_ID) {
	
	    modifyCaseSuite();
	
        var delete_node = document.getElementById(selected_ID);
        // do not forget to remove textNode
        if (delete_node.previousSibling.nodeType == 3) {
            delete_node.parentNode.removeChild(delete_node.previousSibling);
        }
        delete_node.parentNode.removeChild(delete_node);

        var count = parseInt(getRecordsNum()) - 1;
        document.getElementById("records-count").value = count;
        selected_ID = parseInt(selected_ID.split("-")[1]);

        // delete last one
        if (selected_ID - 1 != count) {
            reAssignIdForDelete(selected_ID, count);
        } else {
            // if (count != 0) {
            //     document.getElementById("records-" + count).style.borderBottom = "green solid 2px";
            // }
        }

        // store command grid to testCase
        var s_case = getSelectedCase();
        if (s_case) {
            sideex_testCase[s_case.id].records = document.getElementById("records-grid").innerHTML;
        }
    }
}

function copyCommand() {
    // clear tempCommand
    tempCommand = [];
    let ref = getSelectedRecords();
    let targetOptions;
    for (let i=0 ; i<ref.length ; i++) {
        targetOptions = ref[i].getElementsByTagName("td")[1]
            .getElementsByTagName("datalist")[0]
            .getElementsByTagName("option");
        let targetElements = [];
        for (let j=0 ; j<targetOptions.length ; j++) {
            targetElements.push([targetOptions[j].text]);
        }
        tempCommand[i] = {
            "command": getCommandName(ref[i]),
            "test": getCommandTarget(ref[i]),
            "target": targetElements,
            "value": getCommandValue(ref[i])
        };
    }
}

function pasteCommand() {
    if (tempCommand.length > 0) {
        if (getSelectedRecords().length == 0) {
            // NOTE: because there is no selected record.
            // Therefore, index i is form 0 to length-1.
            for (let i=0 ; i<tempCommand.length ; i++) {
                addCommandManu(tempCommand[i]["command"], tempCommand[i]["target"], tempCommand[i]["value"]);
            }
            return;
        }

        // NOTE: because addCommandManu is add command on this below.
        // Therefore, index i is form length-1 to 0
        for (let i=tempCommand.length-1 ; i>=0 ; i--) {
            addCommandManu(tempCommand[i]["command"], tempCommand[i]["target"], tempCommand[i]["value"]);
        }
    }
}

function selectForeRecord() {
    pressArrowKey(38);
}

function selectNextRecord() {
    pressArrowKey(40);
}

function pressArrowKey(direction) {
    let selectedRecords = getSelectedRecords();
    if (selectedRecords.length == 0) {
        return;
    }
    let lastRecordId = selectedRecords[selectedRecords.length - 1].id;
    let recordNum = parseInt(lastRecordId.substring(lastRecordId.indexOf("-") + 1));
    $("#records-grid .selectedRecord").removeClass("selectedRecord");
    if (direction == 38) { // press up arrow
        if (recordNum == 1) {
            $("#records-1").addClass("selectedRecord");
            $("#records-1").click();
        } else {
            $("#records-" + (recordNum - 1)).addClass("selectedRecord");
            $("#records-" + (recordNum - 1)).click();
        }
    } else if (direction == 40) { // press down arrow
        if (recordNum == getRecordsNum()) {
            $("#records-" + recordNum).addClass("selectedRecord");
            $("#records-" + recordNum).click();
        } else {
            $("#records-" + (recordNum + 1)).addClass("selectedRecord");
            $("#records-" + (recordNum + 1)).click();
        }
    }
}

document.getElementById("grid-breakpoint").addEventListener("click",function() {
    setBreakpoint(getSelectedRecord());
}, false)

function setBreakpoint(selected_ID) {
    if (selected_ID) {
        var current_node = document.getElementById(selected_ID).getElementsByTagName("td")[0];
        if (!current_node.classList.contains("break")) {
            current_node.classList.add("break");
        } else {
            current_node.classList.remove("break");
        }
    }
}

function modifyCaseSuite() {
    getSelectedCase().classList.add("modified");
    getSelectedSuite().getElementsByTagName("strong")[0].classList.add("modified");
}