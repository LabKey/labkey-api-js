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
import { AjaxHandler, request } from '../Ajax'
import { appendFilterParams, Filter } from '../filter/Filter'
import { applyTranslated, ensureRegionName, getCallbackWrapper, getOnFailure, getOnSuccess } from '../Utils'

import { Response } from './Response'

// Would have liked to use an enum but TypeScript's enums are number-based (as of 1.8)
// https://basarat.gitbooks.io/typescript/content/docs/tips/stringEnums.html
//
// Additionally, cannot use 'type' here as we want to actually return a resolvable object
// e.g. LABKEY.Query.containerFilter.current; // "current"
export const containerFilter = {
    current: 'current',
    currentAndFirstChildren: 'currentAndFirstChildren',
    currentAndSubfolders: 'currentAndSubfolders',
    currentPlusProject: 'currentPlusProject',
    currentAndParents: 'currentAndParents',
    currentPlusProjectAndShared: 'currentPlusProjectAndShared',
    allFolders: 'allFolders'
};

export const URL_COLUMN_PREFIX = '_labkeyurl_';

export function buildQueryParams(schemaName: string, queryName: string, filterArray: Array<Filter>, sort: string, dataRegionName?: string): any {

    const regionName = ensureRegionName(dataRegionName);

    let params: any = {
        regionName,
        [regionName + '.queryName']: queryName,
        schemaName
    };

    if (sort) {
        params[regionName + '.sort'] = sort;
    }

    return appendFilterParams(params, filterArray, regionName);
}

export function getMethod(value: string): string {
    if (value && (value.toUpperCase() === 'GET' || value.toUpperCase() === 'POST'))
        return value.toUpperCase();
    return 'GET';
}

interface IGetServerDateOptions {
    failure?: () => any
    scope?: any
    success?: () => any
}

/**
 * Returns the current date/time on the LabKey server.
 * @param options An object that contains the following configuration parameters
 * @param {function} options.success The function to call when the function finishes successfully.
 * This function will be called with a single parameter of type Date.
 * @param {function} [options.failure] The function to call if this function encounters an error.
 * This function will be called with the following parameters:
 * <ul>
 * <li><b>errorInfo:</b> An object with a property called "exception," which contains the error message.</li>
 * </ul>
 * @returns In client-side scripts, this method will return a transaction id
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
        if (versionString === '13.2' || versionString === '16.2') {
            return getCallbackWrapper((data: any, response: any, options: any) => {
                if (data && fn) {
                    fn.call(scope || this, new Response(data), response, options);
                }
            }, this);
        }
    }

    return getCallbackWrapper((data: any, response: any, options: any) => {
        if (data && data.rows && stripHiddenCols) {
            // TODO: stripHiddenColData
        }
        if (fn) {
            fn.call(scope || this, data, options, response);
        }
    }, this);
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
        const fmt2 = function(a: number) {return (a >= 10 ? a : "0" + a);};

        return (
            "{d '" +
            date.getFullYear() + "-" + fmt2(date.getMonth() + 1) + "-" + fmt2(date.getDate()) +
            "'}"
        );
    }

    return "{d '" + sqlStringLiteral(date.toString()) + "'}";
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

interface IValidateQueryOptions {
    containerPath?: string
    failure?: () => any
    scope?: any
    success?: () => any
    validateQueryMetadata?: boolean
}

/**
 * Validates the specified query by ensuring that it parses and executes without an exception.
 * @param options An object that contains the following configuration parameters
 * @param {String} options.schemaName The name of the schema.
 * @param {String} options.queryName the name of the query.
 * @param {Boolean} options.includeAllColumns If set to false, only the columns in the user's default view
 * of the specific query will be tested (defaults to true).
 * @param {Boolean} options.validateQueryMetadata If true, the query metadata and custom views will also be validated.
 * @param {function} options.success The function to call when the function finishes successfully.
 * This function will be called with a simple object with one property named "valid" set to true.
 * @param {function} [options.failure] The function to call if this function encounters an error.
 * This function will be called with the following parameters:
 * <ul>
 * <li><b>errorInfo:</b> An object with a property called "exception," which contains the error message. If validateQueryMetadata was used, this will also hae a property called 'errors', which is an array of objects describing each error.</li>
 * </ul>
 * @param {String} [options.containerPath] A container path in which to execute this command. If not supplied,
 * the current container will be used.
 * @param {Object} [options.scope] A scope for the callback functions. Defaults to "this"
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
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
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true /* isErrorCallback */)
    });
}