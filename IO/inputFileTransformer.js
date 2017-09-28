// coding: utf-8
var olderTestCaseFiles = undefined;

function transformVersion(input) {
    let component = splitTbody(input);
    component[1] = addDatalistTag(component[1]);
    component[0] = addMeta(component[0]);
    console.log("after: ", component[0] + component[1] + component[2]);
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
    console.log("before");
    let testCaseName = "";
    testCaseName += ("\"" + href[0] + "\"");
    for (let i=1 ; i<href.length ; i++) {
        testCaseName += (", \"" + href[i] + "\"");
    }
    var answer = confirm("Please load " + testCaseName );
    if (answer) {
        document.getElementById('load-older-testSuite').click();
    } else {
        ;
    }
    
    console.log("after");
    return str;
}

document.getElementById("load-older-testSuite").addEventListener("change", afterLoadOlderTestCase, false);
function afterLoadOlderTestCase(event) {
    event.stopPropagation();
    /*
    var p = new Promise((resolve, reject) => {
        for (let i=0 ; i<this.files.length ; i++) {
            console.log("i: ", i);
            readOlderTestCase(this.files[i], i, this.files.length);
        }
    });
    */
    olderTestCaseFiles = this.files;
    readOlderTestCase(this.files[0], 0, this.files.length);
}

function readOlderTestCase(file, index, filesLength) {
    var reader = new FileReader();
    console.log("file name: ", file.name);
    reader.onload = function(event) {
        console.log("read case: ", event.target.result);
        let result = event.target.result;

        olderTestSuiteResult = appendOlderTestCase(event.target.result);
        console.log("index: ", index);
        console.log("length: ", filesLength);
        if(index == filesLength-1) {
            appendTestSuite(olderTestSuiteFile, olderTestSuiteResult);
        } else {
            index += 1;
            readOlderTestCase(olderTestCaseFiles[index], index, filesLength);
        }
    };
    reader.onerror = function(e) {
        console.log("Error", e);
    };
    reader.readAsText(file);
}

function appendOlderTestCase(str) {
    let preindex = olderTestSuiteResult.indexOf("<table");
    let postindex = olderTestSuiteResult.indexOf("</body>");
    let fore = olderTestSuiteResult.substring(0, postindex);
    let back = olderTestSuiteResult.substring(postindex);
    fore += addDatalistTag(splitTag(str, "table"));
    console.log("fore: ", fore);
    console.log("back: ", back);
    return fore + back;
}

function appendTestSuite(suiteFile, suiteResult) {
    console.log("finish");
    console.log("suiteResult: ", suiteResult);
    // append on test grid
    var id = "suite" + sideex_testSuite.count;
    sideex_testSuite.count++;
    addTestSuite(suiteFile.name.substring(0, suiteFile.name.lastIndexOf(".")), id);
    // name is used for download
    sideex_testSuite[id] = {
        file_name: suiteFile.name,
        title: suiteFile.name.substring(0, suiteFile.name.lastIndexOf("."))
    };

    test_case = suiteResult.match(/<table[\s\S]*?<\/table>/gi);
    if (test_case) {
        for (var i = 0; i < test_case.length; ++i) {
            readCase(test_case[i]);
        }
    }

    setSelectedSuite(id);
    clean_panel();
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
    console.log("str: ", str);
    var tempFore = "";
    console.log("index: ", str.search("<table"));
    if (str.search("<table") >= 0) {
        var tbodyIndex = str.indexOf("<tbody>");
        tempFore = str.substring(0, tbodyIndex);
        str = str.substring(tbodyIndex);
    }
    console.log("str2: ", str);
    let preindex = str.indexOf("<td>");
    let postindex = str.indexOf("</td>");
    
    let count = 0;
    while (preindex>=0 && postindex>=0) {
        console.log("count: ", count);
        console.log("test: ", str.substring(preindex, postindex));
        if (count == 1) {
            let fore = str.substring(0, postindex);
            let back = str.substring(postindex);
            let insert = "<datalist>" + addOption(str.substring(preindex, postindex)) + "</datalist>";
            str = fore + insert + back;
            console.log("process: ", str);
            postindex += insert.length;
        }

        preindex = str.indexOf("<td>", preindex+1);
        postindex = str.indexOf("</td>", postindex+1);
        count = (count+1)%3;
    }
    return tempFore + str;
}

function addOption(str) {
    return "<option>" + str.substring(4) + "</option>";
}

function addMeta(str) {
    let part = splitForeAndBack(str, "</head>");
    return part[0] + "<meta name=\"description\" content=\"SideeX2\">" + part[1];
}
