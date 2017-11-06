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

var tacStatus = false;

function updateInitialStatus() {
    browser.storage.sync.get('tac')
        .then((res) => {
            tacStatus = res.tac;
        });
}

browser.storage.onChanged.addListener(logStorageChange);

function logStorageChange(changes, area) {
    var changedItems = Object.keys(changes);
 
    for (var item of changedItems) {
        if (item == "tac") tacStatus = changes[item].newValue;
    }
}
