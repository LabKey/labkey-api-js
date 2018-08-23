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
    /**
     * A container path in which to execute this command. If not supplied,
     * the current container will be used.
     */
    containerPath?: string

    /**
     * The function to call if this function encounters an error.
     * This function will be called with the following parameters:
     * * <b>errorInfo:</b> An object with a property called "exception," which contains the error message.
     */
    failure?: Function

    /** A field key or Array of field keys to include in the metadata. */
    fields?: any

    fk?: any

    /** Initialize the view based on the default view iff the view doesn't yet exist. */
    initializeMissingView?: boolean

    /** The name of the query. */
    queryName?: string

    /** The name of the schema. */
    schemaName?: string

    /** A scope for the callback functions. Defaults to "this". */
    scope?: any

    /**
     * The function to call when the function finishes successfully.
     * This function will be called with the following parameters:
     * * <b>queryInfo:</b> An object with the following properties
     *   * <b>schemaName:</b> the name of the requested schema
     *   * <b>name:</b> the name of the requested query
     *   * <b>isUserDefined:</b> true if this is a user-defined query
     *   * <b>canEdit:</b> true if the current user can edit this query
     *   * <b>isMetadataOverrideable:</b> true if the current user may override the query's metadata
     *   * <b>moduleName:</b> the module that defines this query
     *   * <b>isInherited:</b> true if this query is defined in a different container.
     *   * <b>containerPath:</b> if <code>isInherited</code>, the container path where this query is defined.
     *   * <b>viewDataUrl:</b> The URL to navigate to for viewing the data returned from this query
     *   * <b>title:</b> If a value has been set, this is the label used when displaying this table
     *   * <b>description:</b> A description for this query (if provided)
     *   * <b>columns:</b> Information about all columns in this query. This is an array of LABKEY.Query.FieldMetaData objects.
     *   * <b>defaultView:</b> An array of column information for the columns in the current user's default view of this query.
     *      The shape of each column info is the same as in the columns array.
     *   * <b>views:</b> An array of view info (XXX: same as views.getQueryViews()
     * @see LABKEY.Query.FieldMetaData
     */
    success?: Function

    /**
     * A view name or Array of view names to include custom view details.
     * Use '*' to include all views for the query.
     */
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

/**
 * Returns details about a given query including detailed information about result columns
 * @param {IGetQueryDetailsOptions} options
 * @returns {XMLHttpRequest} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request
 * (see <a href="http://dev.sencha.com/deploy/dev/docs/?class=Ext.data.Connection&member=abort" target="_blank">Ext.data.Connection.abort</a>).
 * In server-side scripts, this method will return the JSON response object (first parameter of the success or failure callbacks.)
 */
export function getQueryDetails(options: IGetQueryDetailsOptions): XMLHttpRequest {

    return request({
        url: buildURL('query', 'getQueryDetails.api', options.containerPath),
        method: 'GET',
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        params: buildParams(options)
    });
}