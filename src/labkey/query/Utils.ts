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
import { AjaxHandler, request } from '../Ajax'
import { appendFilterParams, IFilter } from '../filter/Filter'
import { applyTranslated, ensureRegionName, getCallbackWrapper, getOnFailure, getOnSuccess } from '../Utils'

import { Response } from './Response'

// Would have liked to use an enum but TypeScript's enums are number-based (as of 1.8)
// https://basarat.gitbooks.io/typescript/content/docs/tips/stringEnums.html
//
// Additionally, cannot use 'type' here as we want to actually return a resolvable object
// e.g. LABKEY.Query.containerFilter.current; // "current"
// @deprecated please switch to enum version: ContainerFilter
export const containerFilter = {
    current: 'current',
    currentAndFirstChildren: 'currentAndFirstChildren',
    currentAndSubfolders: 'currentAndSubfolders',
    currentPlusProject: 'currentPlusProject',
    currentAndParents: 'currentAndParents',
    currentPlusProjectAndShared: 'currentPlusProjectAndShared',
    allFolders: 'allFolders'
};

export enum ContainerFilter {
    Current = 'Current',
    CurrentAndFirstChildren = 'CurrentAndFirstChildren',
    CurrentAndSubfolders = 'CurrentAndSubfolders',
    CurrentPlusProject = 'CurrentPlusProject',
    CurrentAndParents = 'CurrentAndParents',
    CurrentPlusProjectAndShared = 'CurrentPlusProjectAndShared',
    AllFolders = 'AllFolders'
}

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
export function buildQueryParams(schemaName: string, queryName: string, filterArray: Array<IFilter>, sort: string, dataRegionName?: string): any {

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

export interface IDeleteQueryViewOptions {
    containerPath?: string
    failure?: Function
    queryName: string
    revert?: boolean
    schemaName: string
    scope?: any
    success?: Function
    viewName?: string
}

export interface IDeleteQueryViewPayload {
    complete?: boolean
    queryName: string
    schemaName: string
    viewName?: string
}

export function deleteQueryView(options: IDeleteQueryViewOptions): XMLHttpRequest {

    if (!options) {
        throw 'You must specify a configuration!';
    }
    if (!options.schemaName) {
        throw 'You must specify a schemaName!';
    }
    if (!options.queryName) {
        throw 'You must specify a queryName!';
    }

    let jsonData: IDeleteQueryViewPayload = {
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
    dataTypes?: Array<IDataTypes>
    includeData?: boolean
    includeMetadata?: boolean
}

export interface IGetDataViewsOptions {
    containerPath?: string
    dataTypes?: Array<IDataTypes>
    failure?: Function
    scope?: any
    success?: Function
    timeout?: number
}

/**
 * Returns a list of reports, views and/or datasets in a container
 * @param {IGetDataViewsOptions} options
 * @returns {XMLHttpRequest}
 */
export function getDataViews(options: IGetDataViewsOptions): XMLHttpRequest {
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

export interface IGetQueriesOptions {
    containerPath?: string
    failure?: Function
    includeColumns?: boolean
    includeUserQueries?: boolean
    includeSystemQueries?: boolean
    queryDetailColumns?: boolean
    schemaName: string
    scope?: any
    success?: Function
}

/**
 * Returns the set of queries available in a given schema.
 * @param {IGetQueriesOptions} options
 * @returns {XMLHttpRequest}
 */
export function getQueries(options: IGetQueriesOptions): XMLHttpRequest {

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
        method: 'GET',
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        params
    });
}

export interface IGetQueryViewsOptions {
    containerPath?: string
    failure?: Function
    metadata?: any
    queryName?: string
    schemaName?: string
    scope?: any
    success?: Function
    viewName?: string
}

/**
 * Returns the set of views available for a given query in a given schema.
 * @param {IGetQueryViewsOptions} options
 * @returns {XMLHttpRequest}
 */
export function getQueryViews(options: IGetQueryViewsOptions): XMLHttpRequest {

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

    return request({
        url: buildURL('query', 'getQueryViews.api', options.containerPath),
        method: 'GET',
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        params
    });
}

export interface IGetSchemasOptions {
    apiVersion?: string | number
    containerPath?: string
    failure?: Function
    includeHidden?: boolean
    schemaName?: string
    scope?: any
    success?: Function
}

interface IGetSchemasParameters {
    apiVersion?: string | number
    includeHidden?: boolean
    schemaName?: string
}

/**
 * Returns the set of schemas available in the specified container.
 * @param {IGetSchemasOptions} options
 * @returns {XMLHttpRequest}
 */
export function getSchemas(options: IGetSchemasOptions): XMLHttpRequest {

    let params: IGetSchemasParameters = {};
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
        method: 'GET',
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        params
    });
}

export interface IGetServerDateOptions {
    /**
     * The function to call if this function encounters an error.
     * This function will be called with the following parameters:
     * * **errorInfo:** An object with a property called "exception," which contains the error message.
     */
    failure?: Function
    scope?: any

    /**
     * The function to call when the function finishes successfully.
     * This function will be called with a single parameter of type Date.
     */
    success?: Function
}

/**
 * Returns the current date/time on the LabKey server.
 * @param {IGetServerDateOptions} options
 * @returns {XMLHttpRequest} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request
 * (see <a href="http://dev.sencha.com/deploy/dev/docs/?class=Ext.data.Connection&member=abort" target="_blank">Ext.data.Connection.abort</a>).
 * In server-side scripts, this method will return the JSON response object (first parameter of the success or failure callbacks.)
 */
export function getServerDate(options: IGetServerDateOptions): XMLHttpRequest {

    return request({
        url: buildURL('query', 'getServerDate.api'),
        success: getCallbackWrapper((json: any) => {
            const onSuccess = getOnSuccess(options);
            if (json && json.date && onSuccess) {
                onSuccess(new Date(json.date));
            }
        }, this),
        // TODO: Possible bug, this should indicate "isErrorCallback".
        failure: getCallbackWrapper(getOnFailure(options), options.scope)
    });
}

export function getSuccessCallbackWrapper(fn: Function, stripHiddenCols?: boolean, scope?: any, requiredVersion?: string | number): AjaxHandler {
    if (requiredVersion) {
        const versionString = requiredVersion.toString();
        if (versionString === '13.2' || versionString === '16.2' || versionString === '17.1') {
            return getCallbackWrapper((data: any, response: any, options: any) => {
                if (data && fn) {
                    fn.call(scope || this, new Response(data), response, options);
                }
            }, this);
        }
    }

    return getCallbackWrapper((data: any, response: any, options: any) => {
        if (fn) {
            if (data && data.rows && stripHiddenCols) {
                stripHiddenColData(data);
            }
            fn.call(scope || this, data, options, response);
        }
    }, this);
}

export interface ISaveQueryViewsOptions {
    containerPath?: string
    failure?: Function
    metadata?: any
    queryName?: string
    schemaName?: string
    scope?: any
    success?: Function
    views?: string
}

/**
 * Creates or updates a custom view or views for a given query in a given schema.
 * The options object matches the viewInfos parameter of the getQueryViews.successCallback.
 * @param {ISaveQueryViewsOptions} options
 * @returns {XMLHttpRequest}
 */
export function saveQueryViews(options: ISaveQueryViewsOptions): XMLHttpRequest {

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

    return request({
        url: buildURL('query', 'saveQueryViews.api', options.containerPath),
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
            date.getFullYear() + "-" + fmt2(date.getMonth()+1) + "-" + fmt2(date.getDate()) + " " + fmt2(date.getHours()) + ":" + fmt2(date.getMinutes()) + ":" + fmt2(date.getSeconds()) +
            (withMS ? "." + fmt3(date.getMilliseconds()) : "")
            + "'}";
    }

    return "{ts '" + this.sqlStringLiteral(date) + "'}";
}

/**
 * Converts a JavaScript string into a format suitable for using in a LabKey SQL query.
 * @param str String to use in query
 * @returns {String} value formatted for use in a LabKey query.  Will properly escape single quote characters.
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

export interface IValidateQueryOptions {
    /**
     * A container path in which to execute this command. If not supplied,
     * the current container will be used.
     */
    containerPath?: string

    /**
     * The function to call if this function encounters an error.
     * This function will be called with the following parameters:
     * * **errorInfo:** An object with a property called "exception," which contains the error message.
     * If validateQueryMetadata was used, this will also hae a property called 'errors', which is an array of objects describing each error.
     */
    failure?: Function

    /** A scope for the callback functions. Defaults to "this". */
    scope?: any

    /**
     * The function to call when the function finishes successfully.
     * This function will be called with a simple object with one property named "valid" set to true.
     */
    success?: Function

    /** If true, the query metadata and custom views will also be validated. */
    validateQueryMetadata?: boolean
}

/**
 * Validates the specified query by ensuring that it parses and executes without an exception.
 * @param {IValidateQueryOptions} options
 * @returns {XMLHttpRequest} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request
 * (see <a href="http://dev.sencha.com/deploy/dev/docs/?class=Ext.data.Connection&member=abort" target="_blank">Ext.data.Connection.abort</a>).
 * In server-side scripts, this method will return the JSON response object (first parameter of the success or failure callbacks.)
 */
export function validateQuery(options: IValidateQueryOptions): XMLHttpRequest {

    const action = options.validateQueryMetadata ? 'validateQueryMetadata.api' : 'validateQuery.api';

    let params = {};

    applyTranslated(params, options, {
        successCallback: false,
        errorCallback: false,
        scope: false
    });

    return request({
        url: buildURL('query', action, options.containerPath),
        method: 'GET',
        params,
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}