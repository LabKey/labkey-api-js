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
import { request } from '../Ajax'
import { buildURL } from '../ActionURL'
import { getCallbackWrapper, getOnFailure, getOnSuccess } from '../Utils'

import { getSuccessCallbackWrapper } from './Utils'

interface ExecuteSqlOptions {
    containerFilter?: string
    containerPath?: string
    failure?: () => any
    includeStyle?: boolean
    includeTotalCount?: boolean
    maxRows?: number
    offset?: number
    parameters?: any
    requiredVersion?: number | string
    saveInSession?: boolean
    schemaName: string
    scope?: any
    sort?: string
    sql: string
    stripHiddenColumns?: boolean
    success: () => any
    timeout?: number
}

function buildParams(options: ExecuteSqlOptions): any {

    var jsonData: any = {
        schemaName: options.schemaName,
        sql: options.sql
    };

    // Work with Ext4.Ajax.request
    if (options.saveInSession !== undefined && options.saveInSession !== null) {
        jsonData.saveInSession = options.saveInSession;
    }

    if (options.maxRows !== undefined && options.maxRows >= 0) {
        jsonData.maxRows = options.maxRows;
    }
    if (options.offset && options.offset > 0) {
        jsonData.offset = options.offset;
    }
    if (options.includeTotalCount != undefined) {
        jsonData.includeTotalCount = options.includeTotalCount;
    }

    if (options.containerFilter) {
        jsonData.containerFilter = options.containerFilter;
    }

    if (options.requiredVersion) {
        jsonData.apiVersion = options.requiredVersion;
    }

    if (options.includeStyle) {
        jsonData.includeStyle = options.includeStyle;
    }

    if (options.parameters) {
        for (var propName in options.parameters) {
            if (options.parameters.hasOwnProperty(propName)) {
                jsonData['query.param.' + propName] = options.parameters[propName];
            }
        }
    }

    return jsonData;
}

function buildURLParams(options: ExecuteSqlOptions): any {
    var urlParams = {};

    if (options.sort) {
        urlParams['query.sort'] = options.sort;
    }

    return urlParams;
}

export function executeSql(options: ExecuteSqlOptions): XMLHttpRequest {

    return request({
        url: buildURL('query', 'executeSql.api', options.containerPath, buildURLParams(options)),
        method: 'POST',
        success: getSuccessCallbackWrapper(getOnSuccess(options), options.stripHiddenColumns, options.scope, options.requiredVersion),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true /* isErrorCallback */),
        jsonData: buildParams(options),
        timeout: options.timeout
    });
}