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


var commandTd=["addSelection","answerOnNextPrompt","assertAlert","assertConfirmation","assertPrompt","assertText","assertTitle","chooseCancelOnNextConfirmation","chooseCancelOnNextPrompt","chooseOkOnNextConfirmation","clickAt","close" ,"dragAndDropToObject","doubleClickAt","echo","editContent","mouseDownAt","mouseMoveAt","mouseOut","mouseOver","mouseUpAt","open","pause","removeSelection","runScript","select","selectFrame","selectWindow","sendKeys","store","storeText","storeTitle","submit","type","verifyText","verifyTitle"];


var targetTd=["A locator of a multi-select box","The string to be set to the next prompt pop-up","The expected alert message","The expected confirmation message",
"The expected prompt message","A locator","The expected string of the title (Exact matching).Variable declared in the storeXXX commands can be used in the string. For example: \"Hello ${var_usr}\"","X","X",
"X","A locator","Auto-generated","The locator of the element to be dragged","A locator","X","A locator","A locator","A locator","A locator","A locator","A locator",
"A URL","X","A locator of a multi-select box","The Javascript code to be run","A locator of a drop-down menu","\"index=0\" (Select the first frame of index 0)\"relative=parent\" (Select the parent frame)\"relative=top\" (Select the top frame)",
"Auto-generated","A locator","A string","A locator","The title auto-generated","A locator for the form to be submitted","A locator","A locator","The expected string of the title (Exact matching). The next command will still be run even if the text verification fails.Variable declared in the storeXXX commands can be used in the string. For example: \"Hello ${var_usr}\""];


var valueTd=["An option locator of the element to be added. For example: \"label=Option1\"","X","X","X",
"X","The expected string of the target element (Exact matching).Variable declared in the storeXXX commands can be used in the string. For example: \"Hello ${var_usr}\"","X","X",
"X","X","x,y position of the mouse event relative to the target element. For example: \"10,10\". The value can left blank to denote a simple click.","X","The locator of the element on which the target element is dropped",
"x,y position of the mouse event relative to the target element. For example: \"10,10\". The value can left blank to denote a simple click.","The string to be printed in the log console. Variable declared in the storeXXX commands can be used in the string. For example: \"Hello ${var_usr}\"","The string to be set to the content of the target element with attribute contenteditable=\"true\"","x,y position of the mouse event relative to the target element. For example: \"10,10\"",
"x,y position of the mouse event relative to the target element. For example: \"10,10\"","X","X","x,y position of the mouse event relative to the target element. For example: \"10,10\"",
"X","The amount of time to sleep in millisecond. For example: \"5000\" means sleep for 5 seconds.","An option locator of the element to be removed. For example: \"label=Option1\"","X",
"An option locator. For example: \"label=Option1\"","X","X","A character. For example: \"${KEY_DOWN}\"",
"The name of the variable storing the string. For example: \"var_usr\"","The name of the variable storing the text of the target element. For example: \"var_ele_txt\"","The name of the variable storing the title. For example: \"var_title\"","X","The string to be set to an input field.","The expected string of the target element (Exact matching). The next command will still be run even if the text verification fails.Variable declared in the storeXXX commands can be used in the string. For example: \"Hello ${var_usr}\"","X"];




function searchCommand(word,command){
   var index=0; 
    for(index;index<command.length;index++){
        if(word==command[index]){
            return index;
        }
    }
    //Not found
    return -1;
}
function scrape(word){
    
            

    wordPosition=searchCommand(word,commandTd);
        document.getElementById("refercontainer").innerHTML = "";
       
        if(wordPosition!=-1){
            if(targetTd[wordPosition]=="X")
                targetTd[wordPosition]="Left blank";
            if(valueTd[wordPosition]=="X")
                valueTd[wordPosition]="Left blank";
            sideex_log.help("Command: "+word);
            sideex_log.help("Target: "+targetTd[wordPosition]);
            sideex_log.help("Value: " +valueTd[wordPosition]);
        }
        else{
            sideex_log.help("Command not found");
        }        


}
