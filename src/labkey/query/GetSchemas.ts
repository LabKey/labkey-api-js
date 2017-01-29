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

interface IGetSchemasOptions {
    apiVersion?: string | number
    containerPath?: string
    schemaName?: string
    scope?: any
}

/**
 * Returns the set of schemas available in the specified container.
 * @param options
 * @returns {XMLHttpRequest}
 */
export function getSchemas(options: IGetSchemasOptions): XMLHttpRequest {

    let params: any = {};
    if (options.apiVersion) {
        params.apiVersion = options.apiVersion;
    }
    if (options.schemaName) {
        params.schemaName = options.schemaName;
    }

    return request({
        url: buildURL('query', 'getSchemas.api', options.containerPath),
        method: 'GET',
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true /* isErrorCallback */),
        params
    });
}