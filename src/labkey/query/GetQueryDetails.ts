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
import { request } from '../Ajax'
import { buildURL } from '../ActionURL'
import { getCallbackWrapper, getOnFailure, getOnSuccess } from '../Utils'

export interface IGetQueryDetailsOptions {
    containerPath?: string
    failure?: Function
    fields?: any
    fk?: any
    initializeMissingView?: boolean
    queryName?: string
    schemaName?: string
    scope?: any
    success?: Function
    viewName?: string
}

function buildParams(options: IGetQueryDetailsOptions): IGetQueryDetailsOptions {
    let params: IGetQueryDetailsOptions = {};

    if (options.schemaName) {
        params.schemaName = options.schemaName;
    }

    if (options.queryName) {
        params.queryName = options.queryName;
    }

    if (options.viewName != undefined) {
        params.viewName = options.viewName;
    }

    if (options.fields) {
        params.fields = options.fields;
    }

    if (options.fk) {
        params.fk = options.fk;
    }

    if (options.initializeMissingView) {
        params.initializeMissingView = options.initializeMissingView;
    }

    return params;
}

export function getQueryDetails(options: IGetQueryDetailsOptions): XMLHttpRequest {

    return request({
        url: buildURL('query', 'getQueryDetails.api', options.containerPath),
        method: 'GET',
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        params: buildParams(options)
    });
}