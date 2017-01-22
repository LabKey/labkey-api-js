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
import { Filter } from '../filter/Filter'
import { buildURL } from '../ActionURL'
import { getCallbackWrapper, getOnFailure, getOnSuccess, isArray } from '../Utils'
import { buildQueryParams, getMethod, getSuccessCallbackWrapper } from './Utils'

type ShowRows = 'all' | 'none' | 'paginated' | 'selected' | 'unselected';

interface ISelectRowsOptions {
    // Required
    queryName: string
    schemaName: string

    // Optional
    columns?: string | Array<string>
    containerFilter?: string
    containerPath?: string
    dataRegionName?: string
    failure?: () => any
    filterArray?: Array<Filter>
    ignoreFilter?: boolean
    includeDetailsColumn?: boolean
    includeStyle?: boolean
    includeTotalCount?: boolean
    includeUpdateColumn?: boolean
    maxRows?: number
    method?: string
    offset?: number
    parameters?: any
    requiredVersion?: number | string
    scope?: any
    selectionKey?: string
    showRows?: ShowRows
    sort?: string
    stripHiddenColumns?: boolean
    success?: (result: ISelectRowsResults) => any
    timeout?: number
    viewName?: string
}

// TODO: Model ISelectRowsResults for each API version 8.3, 9.1, 13.2, 16.2, etc
interface ISelectRowsResults {
}

function buildParams(options: ISelectRowsOptions): any {

    let params = buildQueryParams(
        options.schemaName,
        options.queryName,
        options.filterArray,
        options.sort,
        options.dataRegionName
    );

    const dataRegionName = params.dataRegionName;

    if (!options.showRows || options.showRows === 'paginated') {
        if (options.offset) {
            params[dataRegionName + '.offset'] = options.offset;
        }

        if (options.maxRows != undefined) {
            if (options.maxRows < 0) {
                params[dataRegionName + '.showRows'] = 'all';
            }
            else {
                params[dataRegionName + '.maxRows'] = options.maxRows;
            }
        }
    }
    else if (['all', 'selected', 'unselected', 'none'].indexOf(options.showRows) !== -1) {
        params[dataRegionName + '.showRows'] = options.showRows;
    }

    if (options.viewName)
        params[dataRegionName + '.viewName'] = options.viewName;

    if (options.columns)
        params[dataRegionName + '.columns'] = isArray(options.columns) ? (options.columns as Array<string>).join(',') : options.columns;

    if (options.selectionKey)
        params[dataRegionName + '.selectionKey'] = options.selectionKey;

    if (options.ignoreFilter)
        params[dataRegionName + '.ignoreFilter'] = 1;

    if (options.parameters) {
        for (let propName in options.parameters) {
            if (options.parameters.hasOwnProperty(propName)) {
                params[dataRegionName + '.param.' + propName] = options.parameters[propName];
            }
        }
    }

    if (options.requiredVersion)
        params.apiVersion = options.requiredVersion;

    if (options.containerFilter)
        params.containerFilter = options.containerFilter;

    if (options.includeTotalCount)
        params.includeTotalCount = options.includeTotalCount;

    if (options.includeDetailsColumn)
        params.includeDetailsColumn = options.includeDetailsColumn;

    if (options.includeUpdateColumn)
        params.includeUpdateColumn = options.includeUpdateColumn;

    if (options.includeStyle)
        params.includeStyle = options.includeStyle;

    return params;
}

/**
 * Provides backwards compatibility with pre-1.0 selectRows() argument configuration.
 * @param args
 * @returns {ISelectRowsOptions} options
 */
function mapArguments(args: any): ISelectRowsOptions {
    return {
        schemaName: args[0],
        queryName: args[1],
        success: args[2],
        failure: args[3],
        filterArray: args[4],
        sort: args[5],
        viewName: args[6]
    }
}

export function selectRows(options: ISelectRowsOptions): XMLHttpRequest {

    if (arguments.length > 1) {
        options = mapArguments(arguments);
    }

    if (!options.schemaName) {
        throw 'You must specify a schemaName!';
    }
    if (!options.queryName) {
        throw 'You must specify a queryName!';
    }

    return request({
        url: buildURL('query', 'getQuery.api', options.containerPath),
        method: getMethod(options.method),
        success: getSuccessCallbackWrapper(getOnSuccess(options), options.stripHiddenColumns, options.scope, options.requiredVersion),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true /* isErrorCallback */),
        params: buildParams(options),
        timeout: options.timeout
    });
}