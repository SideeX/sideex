// coding: utf-8

function transformVersion(input) {
    let component = splitTbody(input);
    component[1] = addDatalistTag(component[1]);
    component[0] = addMeta(component[0]);
    return component[0] + component[1] + component[2];
}

function checkIsVersion2(input) {
    if (input.search("<meta name=\"description\" content=\"SideeX2\">") >= 0) {
        return true;
    }
    return false;
}

function checkIsTestSuite(input) {
    if (input.search("suiteTable") >= 0) {
        return true;
    }
    return false;
}

function transformTestSuiteVersion(str) {
    let component = splitTbody(str);
    caseResult = loadCaseIntoSuite(component[1]);
    return caseResult;
}

function loadCaseIntoSuite(str) {
    let href = [];
    let anchor = str.match(/<a href=\"([a-z]|[A-Z]|[0-9])*.html\">/g);
    for (let i=0 ; i<anchor.length ; i++) {
        let temp = anchor[i];
        href[i] = temp.substring(temp.indexOf("\"")+1, temp.lastIndexOf("\""));
        console.log("file: ", href[i]);
    }
    
    var testCase = [];
    /*
    $.get(href[0], function(data) {
        console.log("data: ", data);
    });
    */
    $.get("/hello.html", function(data) {
        alert("data2: " + data);
    });
    /*
    for (let i=0 ; i<inputFiles.length ; i++) {
        for (let j=0 ; j<inputFiles.length ; j++) {
            if (href[i] != inputFiles[j]["object"].name) {
                continue;
            }
            let reader = new FileReader();
            reader.readAsText(inputFiles[j]["object"]);
            testCase[i] = reader.result;
            console.log("testCase: ", testCase[i]);
            inputFiles["status"] = 1;
            break;
        }
    }
    */
    
    // let clickEvent = new Event("click");
    // document.getElementById("testSuiteOpener").dispatchEvent(clickEvent);
    /*function loadFile(file) {
        let reader = new FileReader();
        for (let i=0 ; i<file.length ; i++) {
            reader.readAsText(file[i]);
            testCase[i] = reader.result;
            console.log("testCase: ", testCase[i]);
        }
    }
    document.getElementById("testSuiteOpener").addEventListener("click", loadFile, false);
    
    $("#loadSuiteOfOlderVersion").dialog({
        autoOpen: false,
        modal: true,
        resizable: false,
        close: function(event, ui) {
            loadFile(event);
        },
        buttons: [
            {
                text: "close1",
                click: function () {
                    $("#loadSuiteOfOlderVersion").dialog('close');
                }
            },
            {
                text: "close2",
                click: function () {
                    $("#loadSuiteOfOlderVersion").dialog('close');
                }
            }
        ]
    });
    $("#loadSuiteOfOlderVersion").dialog("open");
    */
    // return "no"
    // console.log("href: ", href);
    let result = testCase;
    // result = loadFile(href);
    console.log("str: ", str);
    let preindex = str.indexOf("<table");
    let postindex = str.indexOf("</table>");
    let fore = str.substring(0, preindex);
    let back = str.substring(postindex + 8);
    for (let i=0 ; i<result.length ; i++) {
        fore += addDatalistTag(splitTag(result[i], "table"));
    }
    // document.getElementById("testSuiteOpener").removeEventListener("change", loadFile);
    console.log("fore: ", fore);
    console.log("back: ", back);
    return fore + back;
}



function splitTbody(str) {
    let preindex = str.indexOf("<tbody>");
    let postindex = str.indexOf("</tbody>");
    let tbody = str.substring(0, postindex+8).substring(preindex);

    let component = [];
    component[0] = str.substring(0, preindex);
    component[1] = tbody;
    component[2] = str.substring(postindex+8);
    
    // console.log("tbody: ", tbody);
    return component;
}

function splitForeAndBack(str, tag) {
    let postindex = str.indexOf(tag);
    let fore = str.substring(0, postindex);
    let back = str.substring(postindex);
    return [fore, back];
}

function splitTag(str, tag) {
    let preindex = str.indexOf("<" + tag);
    let postindex = str.indexOf("</" + tag + ">");
    return str.substring(preindex, postindex+3+tag.length);
}

function addDatalistTag(str) {
    let preindex = str.indexOf("<td>");
    let postindex = str.indexOf("</td>");
    let count = 0;
    while (preindex>=0 && postindex>=0) {

        if (count == 1) {
            let fore = str.substring(0, postindex);
            let back = str.substring(postindex);
            str = fore + "<datalist></datalist>" + back;
            postindex += 21;
        }

        preindex = str.indexOf("<td>", preindex+1);
        postindex = str.indexOf("</td>", postindex+1);
        count = (count+1)%3;
    }
    return str;
}

function addMeta(str) {
    let part = splitForeAndBack(str, "</head>");
    return part[0] + "<meta name=\"description\" content=\"SideeX2\">" + part[1];
}
