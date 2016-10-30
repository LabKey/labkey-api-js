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
import { buildURL } from '../ActionURL'
import { request } from '../Ajax'
import { Filter } from '../filter/Filter'
import { getCallbackWrapper, getOnFailure, getOnSuccess } from '../Utils'

import { buildQueryParams, getMethod, getSuccessCallbackWrapper } from './Utils'

interface SelectDistinctOptions {
    column: string
    containerFilter?: string
    dataRegionName?: string
    filterArray?: Array<Filter>
    ignoreFilter?: boolean
    maxRows?: number
    method?: string
    parameters?: any
    queryName: string
    schemaName: string
    scope?: any
    sort?: string
    viewName?: string
}

function buildParams(options: SelectDistinctOptions): any {

    var params = buildQueryParams(
        options.schemaName,
        options.queryName,
        options.filterArray,
        options.sort,
        options.dataRegionName
    );

    const dataRegionName = params.dataRegionName;

    params[dataRegionName + '.columns'] = options.column;

    if (options.viewName) {
        params[dataRegionName + '.viewName'] = options.viewName;
    }

    if (options.maxRows && options.maxRows >= 0) {
        params.maxRows = options.maxRows;
    }

    if (options.containerFilter) {
        params.containerFilter = options.containerFilter;
    }

    if (options.parameters) {
        for (var propName in options.parameters) {
            if (options.parameters.hasOwnProperty(propName)) {
                params[dataRegionName + '.param.' + propName] = options.parameters[propName];
            }
        }
    }

    if (options.ignoreFilter) {
        params[dataRegionName + '.ignoreFilter'] = true;
    }

    return params;
}

export function selectDistinctRows(options: SelectDistinctOptions): XMLHttpRequest {

    if (!options.schemaName)
        throw 'You must specify a schemaName!';
    if (!options.queryName)
        throw 'You must specify a queryName!';
    if (!options.column)
        throw 'You must specify a column!';

    return request({
        url: buildURL('query', 'selectDistinct.api'),
        method: getMethod(options.method),
        success: getSuccessCallbackWrapper(getOnSuccess(options), false /* stripHiddenColumns */, options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true /* isErrorCallback */),
        params: buildParams(options)
    });
}