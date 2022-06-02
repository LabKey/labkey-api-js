/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { loadDOMContext } from './constants';

const { requiresExt4ClientAPI, requiresScript } = loadDOMContext();

declare const Ext4: any;

function display(componentName: string) {
    requiresExt4ClientAPI(function () {
        requiresScript('Impersonate.js', function () {
            Ext4.onReady(function () {
                Ext4.create(componentName).show();
            });
        });
    });
}

export namespace Impersonation {
    export function showImpersonateUser() {
        display('LABKEY.Security.ImpersonateUser');
    }
    export function showImpersonateGroup() {
        display('LABKEY.Security.ImpersonateGroup');
    }
    export function showImpersonateRole() {
        display('LABKEY.Security.ImpersonateRoles');
    }
}
