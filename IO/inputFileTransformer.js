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

