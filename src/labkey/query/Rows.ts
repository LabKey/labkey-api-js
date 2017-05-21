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
import { request, RequestOptions } from '../Ajax'
import { Filter } from '../filter/Filter'
import { buildURL } from '../ActionURL'
import { getCallbackWrapper, getOnFailure, getOnSuccess, isArray } from '../Utils'
import { buildQueryParams, getMethod, getSuccessCallbackWrapper } from './Utils'

/**
 * Delete rows.
 * @param options
 * @returns {XMLHttpRequest}
 */
export function deleteRows(options: IQueryRequestOptions) {

    if (arguments.length > 1)
        options = queryArguments(arguments);
    options.action = 'deleteRows.api';
    return sendRequest(options);
}

/**
 * Insert rows.
 * @param options
 * @returns {XMLHttpRequest}
 */
export function insertRows(options: IQueryRequestOptions) {

    if (arguments.length > 1)
        options = queryArguments(arguments);
    options.action = 'insertRows.api';
    return sendRequest(options);
}

interface IQueryArguments {
    failure: Function
    queryName: string
    rows: Array<any>
    schemaName: string
    success: Function
}

function queryArguments(args: any): IQueryArguments {

    return {
        schemaName: args[0],
        queryName: args[1],
        rows: args[2],
        success: args[3],
        failure: args[4]
    }
}

interface ICommand {
    command: 'delete' | 'insert' | 'update',
    extraContext?: any
    rows: Array<any>
}

interface ISaveRowsOptions {
    apiVersion?: string | number
    commands?: Array<ICommand>
    containerPath?: string
    extraContext?: any
    failure?: Function
    scope?: any
    success?: Function
    timeout?: number
    transacted?: boolean
    validateOnly?: boolean
}

/**
 * Save inserts, updates, and/or deletes to potentially multiple tables with a single request.
 */
export function saveRows(options: ISaveRowsOptions): XMLHttpRequest {

    if (arguments.length > 1) {
        options = queryArguments(arguments);
    }

    return request({
        url: buildURL('query', 'saveRows.api', options.containerPath),
        method: 'POST',
        jsonData: {
            apiVersion: options.apiVersion,
            commands: options.commands,
            containerPath: options.containerPath,
            extraContext: options.extraContext,
            transacted: options.transacted === true,
            validateOnly: options.validateOnly === true
        },
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true /* isErrorCallback */),
        timeout: options.timeout
    });
}

interface ISelectDistinctResult {
    queryName: string
    schemaName: string
    values: Array<any>
}

interface ISelectDistinctOptions {
    column: string
    containerFilter?: string
    containerPath?: string
    dataRegionName?: string
    failure?: (error?: any, request?: XMLHttpRequest, options?: RequestOptions) => any
    filterArray?: Array<Filter>
    ignoreFilter?: boolean
    maxRows?: number
    method?: string
    parameters?: any
    queryName: string
    schemaName: string
    scope?: any
    sort?: string
    success?: (result?: ISelectDistinctResult, options?: RequestOptions, request?: XMLHttpRequest) => any
    viewName?: string
}

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
        success: getSuccessCallbackWrapper(getOnSuccess(options), false /* stripHiddenColumns */, options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true /* isErrorCallback */),
        params: buildSelectDistinctParams(options)
    });
}

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
function selectRowArguments(args: any): ISelectRowsOptions {
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
        options = selectRowArguments(arguments);
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

interface IQueryRequestOptions {
    action?: string // TODO: 'action' is actually required by sendRequest but not from the user, type it this way
    containerPath?: string
    extraContext?: any
    failure?: Function
    queryName: string
    rowDataArray?: Array<any>
    rows?: any
    schemaName: string
    scope?: any
    success?: Function
    timeout?: number
    transacted?: boolean
}

function sendRequest(options: IQueryRequestOptions): XMLHttpRequest {

    return request({
        url: buildURL('query', options.action, options.containerPath),
        method: 'POST',
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true /* isErrorCallback */),
        jsonData: {
            schemaName: options.schemaName,
            queryName: options.queryName,
            rows: options.rows || options.rowDataArray,
            transacted: options.transacted,
            extraContext: options.extraContext
        },
        timeout: options.timeout
    });
}

/**
 * Update rows.
 * @param options
 * @returns {XMLHttpRequest}
 */
export function updateRows(options: IQueryRequestOptions): XMLHttpRequest {

    if (arguments.length > 1) {
        options = queryArguments(arguments);
    }
    options.action = 'updateRows.api';
    return sendRequest(options);
}