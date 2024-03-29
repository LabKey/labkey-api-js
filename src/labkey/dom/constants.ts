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
import { LabKey } from '../constants';

export interface LabKeyDOM extends LabKey {
    $: any;
    requiresExt4ClientAPI: Function;
}

declare const LABKEY: LabKeyDOM;

declare const jQuery: any;

if (typeof jQuery !== 'undefined') {
    LABKEY.$ = jQuery;
} else {
    LABKEY.$ = () => {
        throw new Error(
            'jQuery not available. When using the DOM version of the LabKey API jQuery is expected to be available.'
        );
    };
}

export function loadDOMContext(): LabKeyDOM {
    return LABKEY;
}
