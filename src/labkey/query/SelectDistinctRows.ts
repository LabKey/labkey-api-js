/*
 * Copyright (c) 2017-2020 LabKey Corporation
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
import { request } from '../Ajax';
import { buildURL } from '../ActionURL';
import { getCallbackWrapper, getOnFailure, getOnSuccess, RequestCallbackOptions } from '../Utils'
import { IFilter } from '../filter/Filter';

import { buildQueryParams, ContainerFilter, getMethod, getSuccessCallbackWrapper } from './Utils';

export interface SelectDistinctResponse {
    queryName: string
    schemaName: string
    values: any[]
}

export interface ISelectDistinctOptions extends RequestCallbackOptions<SelectDistinctResponse> {
    /**
     * A single column for which the distinct results will be requested.
     * This column must exist within the specified query.
     */
    column: string
    /**
     * One of the values of [[ContainerFilter]] that sets
     * the scope of this query. Defaults to ContainerFilter.current, and is interpreted relative to
     * config.containerPath.
     */
    containerFilter?: ContainerFilter
    /**
     * The container path in which the changes are to be performed.
     * If not supplied, the current container path will be used.
     */
    containerPath?: string
    /** Prefix for query parameters (e.g. filters, sorts, etc) in this request. Defaults to "query". */
    dataRegionName?: string
    /** Array of objects created by Filter.create. */
    filterArray?: IFilter[]
    /** If true, the command will ignore any filter that may be part of the chosen view. */
    ignoreFilter?: boolean
    /**
     * The maximum number of rows to return from the server (defaults to 100000).
     * If you want to return all possible rows, set this config property to -1.
     */
    maxRows?: number
    /** Specify the HTTP method to use when making the request. Defaults to GET. */
    method?: 'GET' | 'POST'
    /**
     * Map of name (string)/value pairs for the values of parameters if the SQL
     * references underlying queries that are parameterized. For example, the following passes
     * two parameters to the query: {'Gender': 'M', 'CD4': '400'}. The parameters are written to the
     * request URL as follows: query.param.Gender=M&query.param.CD4=400.
     * For details on parameterized SQL queries,
     * see [Parameterized SQL Queries](https://www.labkey.org/Documentation/wiki-page.view?name=paramsql).
     */
    parameters?: any
    /**
     * Name of a query table associated with the chosen schema.
     * See also: [How To Find schemaName, queryName & viewName](https://www.labkey.org/Documentation/wiki-page.view?name=findNames).
     */
    queryName: string
    /**
     * Name of a schema defined within the target container.
     * See also: [How To Find schemaName, queryName & viewName](https://www.labkey.org/Documentation/wiki-page.view?name=findNames).
     */
    schemaName: string
    /**
     * String description of the sort. It includes the column names listed in the URL of a sorted data region
     * (with an optional minus prefix to indicate descending order). In the case of a multi-column sort,
     * up to three column names can be included, separated by commas.
     */
    sort?: string
    /** Name of a view to use. This is potentially important if this view contains filters on the data. */
    viewName?: string
}

/**
 * @hidden
 * @private
 */
function buildSelectDistinctParams(options: ISelectDistinctOptions): any {
    let params = buildQueryParams(
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
        for (let propName in options.parameters) {
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

/**
 * Select Distinct Rows
 */
export function selectDistinctRows(options: ISelectDistinctOptions): XMLHttpRequest {
    if (!options.schemaName)
        throw 'You must specify a schemaName!';
    if (!options.queryName)
        throw 'You must specify a queryName!';
    if (!options.column)
        throw 'You must specify a column!';

    return request({
        url: buildURL('query', 'selectDistinct.api', options.containerPath),
        method: getMethod(options.method),
        success: getSuccessCallbackWrapper(getOnSuccess(options), false, options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        params: buildSelectDistinctParams(options)
    });
}