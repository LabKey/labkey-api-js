/*
 * Copyright (c) 2016 LabKey Corporation
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
import { AjaxHandler } from '../Ajax'
import { appendFilterParams, Filter } from '../filter/Filter'
import { ensureRegionName, getCallbackWrapper } from '../Utils'

import { Response } from './Response'

// Would have liked to use an enum but TypeScript's enums are number-based (as of 1.8)
// https://basarat.gitbooks.io/typescript/content/docs/tips/stringEnums.html
//
// Additionally, cannot use 'type' here as we want to actually return a resolvable object
// e.g. LABKEY.Query.containerFilter.current; // "current"
export const containerFilter = {
    current: 'current',
    currentAndFirstChildren: 'currentAndFirstChildren',
    currentAndSubfolders: 'currentAndSubfolders',
    currentPlusProject: 'currentPlusProject',
    currentAndParents: 'currentAndParents',
    currentPlusProjectAndShared: 'currentPlusProjectAndShared',
    allFolders: 'allFolders'
};

export function buildQueryParams(schemaName: string, queryName: string, filterArray: Array<Filter>, sort: string, dataRegionName?: string): any {

    const regionName = ensureRegionName(dataRegionName);

    var params: any = {
        regionName,
        [regionName + '.queryName']: queryName,
        schemaName
    };

    if (sort) {
        params[regionName + '.sort'] = sort;
    }

    return appendFilterParams(params, filterArray, regionName);
}

export function getMethod(value: string): string {
    if (value && (value.toUpperCase() === 'GET' || value.toUpperCase() === 'POST'))
        return value.toUpperCase();
    return 'GET';
}

export function getSuccessCallbackWrapper(fn: Function, stripHiddenCols?: boolean, scope?: any, requiredVersion?: string | number): AjaxHandler {
    if (requiredVersion) {
        var versionString = requiredVersion.toString();
        if (versionString === '13.2' || versionString === '16.2') {
            return getCallbackWrapper((data: any, response: any, options: any) => {
                if (data && fn) {
                    fn.call(scope || this, new Response(data), response, options);
                }
            }, this);
        }
    }

    return getCallbackWrapper((data: any, response: any, options: any) => {
        if (data && data.rows && stripHiddenCols) {
            // TODO: stripHiddenColData
        }
        if (fn) {
            fn.call(scope || this, data, options, response);
        }
    }, this);
}