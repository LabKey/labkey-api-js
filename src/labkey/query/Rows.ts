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
import { request, RequestOptions } from '../Ajax'
import { Filter } from '../filter/Filter'
import { buildURL } from '../ActionURL'
import { getCallbackWrapper, getOnFailure, getOnSuccess, isArray } from '../Utils'
import { buildQueryParams, getMethod, getSuccessCallbackWrapper } from './Utils'

/**
 * Delete rows.
 */
export function deleteRows(options: IQueryRequestOptions) {

    if (arguments.length > 1)
        options = queryArguments(arguments);
    options.action = 'deleteRows.api';
    return sendRequest(options);
}

/**
 * Insert rows.
 */
export function insertRows(options: IQueryRequestOptions) {

    if (arguments.length > 1)
        options = queryArguments(arguments);
    options.action = 'insertRows.api';
    return sendRequest(options);
}

export interface IQueryArguments {
    failure: Function
    queryName: string
    rows: Array<any>
    schemaName: string
    success: Function
}

/**
 * @private
 */
function queryArguments(args: any): IQueryArguments {

    return {
        schemaName: args[0],
        queryName: args[1],
        rows: args[2],
        success: args[3],
        failure: args[4]
    }
}

export interface ICommand {
    command: 'delete' | 'insert' | 'update',
    extraContext?: any
    rows: Array<any>
}

export interface ISaveRowsOptions {
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
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        timeout: options.timeout
    });
}

export interface ISelectDistinctResult {
    queryName: string
    schemaName: string
    values: Array<any>
}

export interface ISelectDistinctOptions {
    /**
     * A single column for which the distinct results will be requested.
     * This column must exist within the specified query.
     */
    column: string
    containerFilter?: string
    containerPath?: string
    dataRegionName?: string
    failure?: (error?: any, request?: XMLHttpRequest, options?: RequestOptions) => any

    /**
     *  Array of objects created by Filter.create
     */
    filterArray?: Array<Filter>

    ignoreFilter?: boolean
    maxRows?: number
    method?: string
    parameters?: any
    /**
     * Name of a query table associated with the chosen schema.
     * See also: <a class="link" href="https://www.labkey.org/Documentation/wiki-page.view?name=findNames">How To Find schemaName, queryName &amp; viewName</a>.
     */
    queryName: string

    /**
     * Name of a schema defined within the current container.
     * See also: <a class="link" href="https://www.labkey.org/Documentation/wiki-page.view?name=findNames">How To Find schemaName, queryName &amp; viewName</a>.
     */
    schemaName: string

    /**
     * A scope for the callback functions. Defaults to "this".
     */
    scope?: any

    sort?: string
    success?: (result?: ISelectDistinctResult, options?: RequestOptions, request?: XMLHttpRequest) => any

    /**
     * Name of a view to use. This is potentially important if this view contains filters on the data.
     */
    viewName?: string
}

/**
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
 * Select Distinct Rows.
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

export type ShowRows = 'all' | 'none' | 'paginated' | 'selected' | 'unselected';

export interface ISelectRowsOptions {
    /**
     * Name of a query table associated with the chosen schema.
     * See also: <a class="link" href="https://www.labkey.org/Documentation/wiki-page.view?name=findNames">How To Find schemaName, queryName &amp; viewName</a>.
     */
    queryName: string

    /**
     * Name of a schema defined within the current container.
     * See also: <a class="link" href="https://www.labkey.org/Documentation/wiki-page.view?name=findNames">How To Find schemaName, queryName &amp; viewName</a>.
     */
    schemaName: string

    /**
     * An Array of columns or a comma-delimited list of column names you wish to select from the specified query.
     * By default, selectRows will return the set of columns defined in the default value for this query, as defined
     * via the Customize View user interface on the server. You can override this by specifying a list of column
     * names in this parameter, separated by commas. The names can also include references to related tables
     * (e.g., 'RelatedPeptide/Peptide' where 'RelatedPeptide is the name of a foreign key column in the base query,
     * and 'Peptide' is the name of a column in the related table).
     */
    columns?: string | Array<string>
    containerFilter?: string

    /**
     * The path to the container in which the schema and query are defined, if different than the current container.
     * If not supplied, the current container's path will be used.
     */
    containerPath?: string
    dataRegionName?: string
    failure?: () => any

    /**
     * Array of objects created by Filter.create
     */
    filterArray?: Array<Filter>

    /**
     * If true, the command will ignore any filter that may be part of the chosen view.
     */
    ignoreFilter?: boolean

    /**
     * Include the Details link column in the set of columns (defaults to false). If included, the column will
     * have the name "~~Details~~". The underlying table/query must support details links or the column will
     * be omitted in the response.
     */
    includeDetailsColumn?: boolean
    includeStyle?: boolean

    /**
     * Include the total number of rows available (defaults to true). If false totalCount will equal
     * number of rows returned (equal to maxRows unless maxRows == 0).
     */
    includeTotalCount?: boolean

    /**
     * Include the Update (or edit) link column in the set of columns (defaults to false). If included, the column
     * will have the name "~~Update~~". The underlying table/query must support update links or the column
     * will be omitted in the response.
     */
    includeUpdateColumn?: boolean

    /**
     * The maximum number of rows to return from the server (defaults to 100000).
     * If you want to return all possible rows, set this config property to -1.
     */
    maxRows?: number
    method?: string

    /**
     * The index of the first row to return from the server (defaults to 0). Use this along with the
     * maxRows config property to request pages of data.
     */
    offset?: number
    parameters?: any
    requiredVersion?: number | string

    /**
     * A scope for the callback functions. Defaults to "this".
     */
    scope?: any

    /**
     * Unique string used by selection APIs as a key when storing or retrieving the selected items for a grid.
     * Not used unless "showRows" is 'selected' or 'unselected'.
     */
    selectionKey?: string
    showRows?: ShowRows

    /**
     * String description of the sort. It includes the column names listed in the URL of a sorted data region
     * (with an optional minus prefix to indicate descending order). In the case of a multi-column sort,
     * up to three column names can be included, separated by commas.
     */
    sort?: string
    stripHiddenColumns?: boolean
    success?: (result: ISelectRowsResults) => any

    /**
     * The maximum number of milliseconds to allow for this operation before a timeout error (defaults to 30000).
     */
    timeout?: number

    /**
     * The name of a custom view saved on the server for the specified query.
     */
    viewName?: string
}

// TODO: Model ISelectRowsResults for each API version 8.3, 9.1, 13.2, 16.2, etc
export interface ISelectRowsResults {
}

/**
 * @private
 */
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
 * @private
 * Provides backwards compatibility with pre-1.0 selectRows() argument configuration.
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

/**
 * Select rows.
 */
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
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        params: buildParams(options),
        timeout: options.timeout
    });
}

export interface IQueryRequestOptions {
    action?: string // TODO: 'action' is actually required by sendRequest but not from the user, type it this way
    apiVersion?: number | string
    containerPath?: string
    extraContext?: any
    failure?: Function

    /**
     * Name of a query table associated with the chosen schema.
     * See also: <a class="link" href="https://www.labkey.org/Documentation/wiki-page.view?name=findNames">How To Find schemaName, queryName &amp; viewName</a>.
     */
    queryName: string

    rowDataArray?: Array<any>
    rows?: any

    /**
     * Name of a schema defined within the current container.
     * See also: <a class="link" href="https://www.labkey.org/Documentation/wiki-page.view?name=findNames">How To Find schemaName, queryName &amp; viewName</a>.
     */
    schemaName: string

    scope?: any
    success?: Function
    timeout?: number
    transacted?: boolean
}

/**
 * @private
 */
function sendRequest(options: IQueryRequestOptions): XMLHttpRequest {

    return request({
        url: buildURL('query', options.action, options.containerPath),
        method: 'POST',
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
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
 */
export function updateRows(options: IQueryRequestOptions): XMLHttpRequest {

    if (arguments.length > 1) {
        options = queryArguments(arguments);
    }
    options.action = 'updateRows.api';
    return sendRequest(options);
}