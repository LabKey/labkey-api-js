/*
 * Copyright (c) 2016-2018 LabKey Corporation
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
import { AjaxHandler, request, RequestOptions } from '../Ajax'
import { appendFilterParams, IFilter } from '../filter/Filter'
import {
    applyTranslated,
    ensureRegionName, ExtendedXMLHttpRequest,
    getCallbackWrapper,
    getOnFailure,
    getOnSuccess,
    parseDateString,
    RequestCallbackOptions,
    RequestFailure,
} from '../Utils'

import { Response } from './Response'
import { QueryColumn } from './types'

/**
 * An enumeration of the various container filters available. Note that not all
 * data types and queries can contain that spans multiple containers. In those cases,
 * all values will behave the same as current and show only data in the current container.
 */
export enum ContainerFilter {

    /** Include all folders for which the user has read permission. */
    allFolders = 'AllFolders',

    /** Include the current folder only. */
    current = 'Current',

    /** Include the current folder and all first children, excluding workbooks. */
    currentAndFirstChildren = 'CurrentAndFirstChildren',

    /** Include the current folder and its parent folders. */
    currentAndParents = 'CurrentAndParents',

    /** Include the current folder and all subfolders. */
    currentAndSubfolders = 'CurrentAndSubfolders',

    /** Include the current folder, all subfolders of the current folder, and the Shared folder. */
    currentAndSubfoldersPlusShared = 'CurrentAndSubfoldersPlusShared',

    /** Include the current folder and the project that contains it. */
    currentPlusProject = 'CurrentPlusProject',

    /** Include the current folder plus its project plus any shared folders. */
    currentPlusProjectAndShared = 'CurrentPlusProjectAndShared',
}

/**
 * @deprecated Backwards compatible reference to [[ContainerFilter]].
 */
export const containerFilter = ContainerFilter;

export const URL_COLUMN_PREFIX = '_labkeyurl_';

/**
 * Build and return an object suitable for passing to the Ajax request 'params' configuration property.
 * @param schemaName
 * @param queryName
 * @param filterArray
 * @param sort
 * @param dataRegionName
 * @returns {any}
 */
export function buildQueryParams(
    schemaName: string,
    queryName: string,
    filterArray: IFilter[],
    sort: string,
    dataRegionName?: string
): any {
    const regionName = ensureRegionName(dataRegionName);

    let params: any = {
        dataRegionName: regionName,
        [regionName + '.queryName']: queryName,
        schemaName
    };

    if (sort) {
        params[regionName + '.sort'] = sort;
    }

    return appendFilterParams(params, filterArray, regionName);
}

export interface DeleteQueryViewOptions extends RequestCallbackOptions {
    containerPath?: string
    queryName: string
    revert?: boolean
    schemaName: string
    viewName?: string
}

export interface DeleteQueryViewPayload {
    complete: boolean
    queryName: string
    schemaName: string
    viewName: string
}

export function deleteQueryView(options: DeleteQueryViewOptions): XMLHttpRequest {

    if (!options) {
        throw 'You must specify a configuration!';
    }
    if (!options.schemaName) {
        throw 'You must specify a schemaName!';
    }
    if (!options.queryName) {
        throw 'You must specify a queryName!';
    }

    let jsonData: Partial<DeleteQueryViewPayload> = {
        schemaName: options.schemaName,
        queryName: options.queryName
    };

    if (options.viewName) {
        jsonData.viewName = options.viewName;
    }

    if (options.revert !== undefined) {
        jsonData.complete = options.revert !== true;
    }

    return request({
        url: buildURL('query', 'deleteView.api', options.containerPath),
        method: 'POST',
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        jsonData
    });
}

export type IDataTypes = 'datasets' | 'queries' | 'reports';

export interface IBrowseDataPayload {
    dataTypes?: IDataTypes[]
    includeData?: boolean
    includeMetadata?: boolean
}

export interface GetDataViewsOptions {
    containerPath?: string
    dataTypes?: IDataTypes[]
    failure?: RequestFailure
    scope?: any
    // Unfortunately, this flips options/response from what getCallbackWrapper normally does.
    // getCallbackWrapper -> (data, response, options)
    // getDataViews -> (data, options, response)
    success?: (data?: any, options?: RequestOptions, request?: ExtendedXMLHttpRequest) => any
    timeout?: number
}

/**
 * Returns a list of reports, views and/or datasets in a container
 * @param {GetDataViewsOptions} options
 * @returns {XMLHttpRequest}
 */
export function getDataViews(options: GetDataViewsOptions): XMLHttpRequest {
    let jsonData: IBrowseDataPayload = {
        includeData: true,
        includeMetadata: false
    };

    if (options.dataTypes) {
        jsonData.dataTypes = options.dataTypes;
    }

    const onSuccess = getOnSuccess(options);
    const success = getCallbackWrapper(function(data: any, response: any, options: any) {
        if (onSuccess) {
            onSuccess.call(options.scope || this, data.data, options, response);
        }
    }, this);

    return request({
        url: buildURL('reports', 'browseData.api', options.containerPath),
        method: 'POST',
        success,
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        jsonData
    });
}

export function getMethod(value: string): string {
    if (value && (value.toUpperCase() === 'GET' || value.toUpperCase() === 'POST'))
        return value.toUpperCase();
    return 'GET';
}

// TODO: This interface should overlap more closely with getQueryDetails or at least be a strict subset
// of getQueryDetails properties for any given query.
export interface GetQueryResponse {
    canEdit: boolean
    canEditSharedViews: boolean
    /**
     * Columns for the query.
     * Note, if the "queryDetailColumns" option is false then these columns will only include
     * the "caption", "name", and "shortCaption" properties.
     */
    columns: QueryColumn[]
    description: string
    hidden: boolean
    inherit: boolean
    isInherited: boolean
    isMetadataOverrideable: boolean
    isUserDefined: boolean
    name: string
    snapshot: boolean
    title: string
    viewDataUrl: string
}

export interface GetQueriesResponse {
    queries: GetQueryResponse[]
    schemaName: string
}

export interface GetQueriesOptions extends RequestCallbackOptions<GetQueriesResponse> {
    /**
     * A container path in which to execute this command. If not supplied,
     * the current container will be used.
     */
    containerPath?: string
    /**
     * If set to false, information about the available columns in this query will not be included
     * in the results. Default is true.
     */
    includeColumns?: boolean
    /** If set to false, user-defined queries will not be included in the results. Default is true. */
    includeUserQueries?: boolean
    /** If set to false, system-defined queries will not be included in the results. Default is true. */
    includeSystemQueries?: boolean
    /**
     * If set to true, and includeColumns is set to true, information about the available columns
     * will be the same details as specified by [[getQueryDetails]] for columns.
     * Defaults to false.
     */
    queryDetailColumns?: boolean
    /** The name of the schema. */
    schemaName: string
}

/**
 * Returns the set of queries available in a given schema.
 */
export function getQueries(options: GetQueriesOptions): XMLHttpRequest {

    let params = {};

    // Only pass the parameters that the server supports, and exclude ones like successCallback
    applyTranslated(params, options, {
        schemaName: 'schemaName',
        includeColumns: 'includeColumns',
        includeUserQueries: 'includeUserQueries',
        includeSystemQueries: 'includeSystemQueries',
        queryDetailColumns: 'queryDetailColumns'
    }, false, false);

    return request({
        url: buildURL('query', 'getQueries.api', options.containerPath),
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        params
    });
}

export interface GetQueryViewsOptions extends RequestCallbackOptions {
    containerPath?: string
    metadata?: any
    queryName?: string
    schemaName?: string
    viewName?: string
    excludeSessionView?: boolean
}

/**
 * Returns the set of views available for a given query in a given schema.
 */
export function getQueryViews(options: GetQueryViewsOptions): XMLHttpRequest {

    let params: any = {};

    if (options.schemaName) {
        params.schemaName = options.schemaName;
    }
    if (options.queryName) {
        params.queryName = options.queryName;
    }
    if (options.viewName != undefined) {
        params.viewName = options.viewName;
    }
    if (options.metadata) {
        params.metadata = options.metadata;
    }

    if (options.excludeSessionView) {
        params.excludeSessionView = true;
    }

    return request({
        url: buildURL('query', 'getQueryViews.api', options.containerPath),
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        params
    });
}

export interface GetSchemasOptions extends RequestCallbackOptions {
    apiVersion?: string | number
    containerPath?: string
    includeHidden?: boolean
    schemaName?: string
}

interface GetSchemasParameters {
    apiVersion: string | number
    includeHidden: boolean
    schemaName: string
}

/**
 * Returns the set of schemas available in the specified container.
 */
export function getSchemas(options: GetSchemasOptions): XMLHttpRequest {

    let params: Partial<GetSchemasParameters> = {};
    if (options.apiVersion) {
        params.apiVersion = options.apiVersion;
    }
    if (options.schemaName) {
        params.schemaName = options.schemaName;
    }
    if (options.includeHidden !== undefined) {
        params.includeHidden = options.includeHidden;
    }

    return request({
        url: buildURL('query', 'getSchemas.api', options.containerPath),
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        params
    });
}

/**
 * Returns the current date/time on the LabKey server.

 * @returns In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request. In server-side scripts,
 * this method will return the JSON response object (first parameter of the success or failure callbacks).
 */
export function getServerDate(options: RequestCallbackOptions<Date>): XMLHttpRequest {
    const onSuccess = getOnSuccess(options);

    return request({
        url: buildURL('query', 'getServerDate.api'),
        success: getCallbackWrapper(
            onSuccess,
            options.scope,
            false,
            (json: any) => {
                if (json && json.date && onSuccess) {
                    return parseDateString(json.date);
                }
            }
        ),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}

// TODO: Support for requiredVersion on the client-side needs to be improved.
// We effectively support string | number, however, the user will receive different
// response processing depending on if they used string | number (e.g. 17.1 vs "17.1" will be processed differently).
const SUPPORTED_VERSIONS = [13.2, '13.2', 16.2, 17.1];

export function getSuccessCallbackWrapper(
    onSuccess: Function,
    stripHiddenCols?: boolean,
    scope?: any,
    requiredVersion?: number | string
): AjaxHandler {
    if (SUPPORTED_VERSIONS.indexOf(requiredVersion) > -1) {
        return getCallbackWrapper(function(data: any, response: ExtendedXMLHttpRequest, options: RequestOptions) {
            if (data && onSuccess) {
                onSuccess.call(scope || this, new Response(data), response, options);
            }
        }, this);
    }

    return getCallbackWrapper(function(data: any, response: ExtendedXMLHttpRequest, options: RequestOptions) {
        if (onSuccess) {
            if (data && data.rows && stripHiddenCols) {
                stripHiddenColData(data);
            }
            onSuccess.call(scope || this, data, options, response);
        }
    }, this);
}

export interface SaveQueryViewsOptions extends RequestCallbackOptions {
    containerPath?: string
    metadata?: any
    queryName?: string
    schemaName?: string
    views?: any
    shared?: boolean
    session?: boolean
    hidden?: boolean
}

/**
 * Creates or updates a custom view or views for a given query in a given schema.
 * The options object matches the viewInfos parameter of the getQueryViews.successCallback.
 */
export function saveQueryViews(options: SaveQueryViewsOptions): XMLHttpRequest {

    let jsonData: any = {};
    if (options.schemaName) {
        jsonData.schemaName = options.schemaName;
    }
    if (options.queryName) {
        jsonData.queryName = options.queryName;
    }
    if (options.views) {
        jsonData.views = options.views;
    }
    if (options.shared) {
        jsonData.shared = true;
    }
    if (options.session) {
        jsonData.session = true;
    }
    if (options.hidden) {
        jsonData.hidden = true;
    }

    return request({
        url: buildURL('query', 'saveQueryViews.api', options.containerPath),
        method: 'POST',
        jsonData,
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}

export interface SaveSessionViewOptions extends RequestCallbackOptions {
    containerPath?: string
    queryName?: string
    schemaName?: string
    viewName?: string
    newName?: string
    shared?: boolean
    inherit?: boolean
}

/**
 * Save session view with a new name as non session view.
 */
export function saveSessionView(options: SaveSessionViewOptions): XMLHttpRequest {

    let jsonData: any = {};
    if (options.schemaName) {
        jsonData.schemaName = options.schemaName;
    }
    if (options.queryName) {
        jsonData['query.queryName'] = options.queryName;
    }
    if (options.viewName) {
        jsonData['query.viewName'] = options.viewName;
    }
    if (options.newName) {
        jsonData.newName = options.newName;
    }
    if (options.shared) {
        jsonData.shared = true;
    }
    if (options.inherit) {
        jsonData.inherit = true;
    }

    return request({
        url: buildURL('query', 'saveSessionView.api', options.containerPath),
        method: 'POST',
        jsonData,
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}

/**
 * Converts a JavaScript date into a format suitable for using in a LabKey SQL query, does not include time.
 * @param date JavaScript date
 * @returns {String} a date literal formatted to be used in a LabKey query
 */
export function sqlDateLiteral(date: Date): string {

    if (date === undefined || date === null || !date) {
        return "NULL";
    }
    if (typeof date == 'string') {
        try { date = new Date(date); } catch (x) { }
    }
    if (typeof date == 'object' && typeof date.toISOString == 'function') {
        const fmt2 = (a: number) => (a >= 10 ? '' + a : '0' + a);

        return (
            "{d '" +
            date.getFullYear() + "-" + fmt2(date.getMonth() + 1) + "-" + fmt2(date.getDate()) +
            "'}"
        );
    }

    return "{d '" + sqlStringLiteral(date.toString()) + "'}";
}

/**
 * Converts a javascript date into a format suitable for using in a LabKey SQL query, includes time but not milliseconds.
 * @param date JavaScript Date
 * @param withMS include milliseconds
 * @returns {String} a date and time literal formatted to be used in a LabKey query
 */
export function sqlDateTimeLiteral(date: Date, withMS: boolean): string {
    if (date === undefined || date === null || !date) {
        return 'NULL';
    }
    if (typeof date == 'string') {
        try { date = new Date(date); } catch (x) { }
    }
    if (typeof date == 'object' && typeof date.toISOString == 'function') {
        const fmt2 = (a: number) => (a >= 10  ? '' + a : '0' + a);
        const fmt3 = (a: number) => (a >= 100 ? '' + a : '0' + fmt2(a));

        return "{ts '" +
            date.getFullYear() + "-" +
            fmt2(date.getMonth()+1) + "-" +
            fmt2(date.getDate()) + " " +
            fmt2(date.getHours()) + ":" +
            fmt2(date.getMinutes()) + ":" +
            fmt2(date.getSeconds()) +
            (withMS ? "." + fmt3(date.getMilliseconds()) : "")
            + "'}";
    }

    return "{ts '" + this.sqlStringLiteral(date) + "'}";
}

/**
 * Converts a JavaScript string into a format suitable for using in a LabKey SQL query.
 * It will properly escape single quote characters.
 *
 * @param str String to use in query
 * @returns The value formatted for use in a LabKey query.
 */
export function sqlStringLiteral(str: string): string {
    if (str === undefined || str === null || str == '') {
        return 'NULL';
    }
    return "'" + str.toString().replace("'", "''") + "'";
}

function stripHiddenColData(data: any): void {
    // gather the set of hidden columns
    let hiddenCols = [];
    let newColModel = [];
    let newMetaFields = [];
    let colModel = data.columnModel;
    for (let i = 0; i < colModel.length; ++i) {
        if (colModel[i].hidden) {
            hiddenCols.push(colModel[i].dataIndex);
        }
        else {
            newColModel.push(colModel[i]);
            newMetaFields.push(data.metaData.fields[i]);
        }
    }

    // reset the columnModel and metaData.fields to include only the non-hidden items
    data.columnModel = newColModel;
    data.metaData.fields = newMetaFields;

    // delete column values for any columns in the hiddenCols array
    for (let i = 0; i < data.rows.length; ++i) {
        let row = data.rows[i];
        for (let h = 0; h < hiddenCols.length; ++h) {
            delete row[hiddenCols[h]];
            delete row[URL_COLUMN_PREFIX + hiddenCols[h]];
        }
    }
}

export interface ValidateQueryOptions extends RequestCallbackOptions<{valid: boolean}> {
    /**
     * A container path in which to execute this command. If not supplied,
     * the current container will be used.
     */
    containerPath?: string
    /** If true, the query metadata and custom views will also be validated. */
    validateQueryMetadata?: boolean
}

/**
 * Validates the specified query by ensuring that it parses and executes without an exception.

 * @returns In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request. In server-side scripts,
 * this method will return the JSON response object (first parameter of the success or failure callbacks).
 */
export function validateQuery(options: ValidateQueryOptions): XMLHttpRequest {

    const action = options.validateQueryMetadata ? 'validateQueryMetadata.api' : 'validateQuery.api';

    let params = {};

    applyTranslated(params, options, {
        successCallback: false,
        errorCallback: false,
        scope: false
    });

    return request({
        url: buildURL('query', action, options.containerPath),
        params,
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}
