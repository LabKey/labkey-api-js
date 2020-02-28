/*
 * Copyright (c) 2017-2018 LabKey Corporation
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

function mapArguments(args: any): ISaveRowsOptions {
    return {
        // These don't make any sense...
        // schemaName: args[0],
        // queryName: args[1],
        // rows: args[2],
        success: args[3],
        failure: args[4]
    };
}

export interface ICommand {
    /** Name of the command to be performed. Must be one of "insert", "update", or "delete". */
    command: 'delete' | 'insert' | 'update',

    /** **Experimental:** Optional extra context object passed into the transformation/validation script environment. */
    extraContext?: any

    /**
     * An array of data for each row to be changed. See [[insertRows]],
     * [[updateRows]], or [[deleteRows]] for requirements of what data must be included for each row.
     */
    rows: Array<any>
}

export interface ISaveRowsOptions {
    /**
     * Version of the API. If this is 13.2 or higher, a request that fails
     * validation will be returned as a successful response. Use the 'errorCount' and 'committed' properties in the
     * response to tell if it committed or not. If this is 13.1 or lower (or unspecified), the failure callback
     * will be invoked instead in the event of a validation failure.
     */
    apiVersion?: string | number

    /** An array of all of the update/insert/delete operations to be performed. */
    commands?: Array<ICommand>

    /**
     * The container path in which the changes are to be performed.
     * If not supplied, the current container path will be used.
     */
    containerPath?: string

    /**
     * **Experimental:** Optional extra context object passed into the transformation/validation script environment.
     * The extraContext at the command-level will be merged with the extraContext at the top-level of the config.
     */
    extraContext?: any

    /**
     * Function called if execution of the "saveRows" function fails.
     * See [[selectRows]] for more information on the parameters passed to this function.
     */
    failure?: Function

    /** A scope for the callback functions. Defaults to "this". */
    scope?: any

    /**
     * Function called when the "saveRows" function executes successfully.
     * Called with arguments:
     * * an object with the following properties:
     *   * <strong>result</strong>: an array of parsed response data [[ModifyRowsResults]] (one for each command in the request)
     *   * <strong>errorCount</strong>: an integer, with the total number of errors encountered during the operation
     *   * <strong>committed</strong>: a boolean, indicating if the changes were actually committed to the database
     * * the XMLHttpRequest object
     * * (optionally) the "options" object [[ModifyRowsOptions]]
     */
    success?: Function

    /** The maximum number of milliseconds to allow for this operation before generating a timeout error (defaults to 30000). */
    timeout?: number

    /**
     * Whether all of the row changes for all of the tables
     * should be done in a single transaction, so they all succeed or all fail. Defaults to true.
     */
    transacted?: boolean

    /**
     * Whether or not the server should attempt proceed through all of the
     * commands, but not actually commit them to the database. Useful for scenarios like giving incremental
     * validation feedback as a user fills out a UI form, but not actually save anything until they explicitly request
     * a save.
     */
    validateOnly?: boolean
}

/**
 * Interface to describe the first object passed to the successCallback function
 * by [[updateRows]], [[insertRows]] or [[deleteRows]]. This object's properties are useful for
 * matching requests to responses, as HTTP requests are typically
 * processed asynchronously.
 * Additional Documentation:
 * - [How to find schemaName, queryName and viewName](https://www.labkey.org/Documentation/wiki-page.view?name=findNames)
 * - [LabKey Javascript tutorial](https://www.labkey.org/Documentation/wiki-page.view?name=javascriptTutorial)
 * - [Demo](https://www.labkey.org/home/Study/demo/wiki-page.view?name=reagentRequest)
 *
 * ```
 * {"schemaName": "lists",
 *  "queryName": "API Test List",
 *  "rowsAffected": 1,
 *  "command": "insert",
 *  "errors": [],
 *  "rows": [{ Key: 3, StringField: 'NewValue'}]
 *  }
 * ```
 */
export interface ModifyRowsResults {

    field? : string
    /** Contains the same schemaName the client passed to the calling function. */
    schemaName : string
    /** Contains the same queryName the client passed to the calling function. */
    queryName : string
    /** Will be "update", "insert", or "delete" depending on the API called. */
    command : string
    /**
     * Objects will contain the properties 'id' (the field to which the error is related, if any),
     * and 'msg' (the error message itself).
     */
    errors : Array<any>
    /**
     * Indicates the number of rows affected by the API action.
     * This will typically be the same number of rows passed in to the calling function.
     */
    rowsAffected : number
    /**
     * Array of rows with field values for the rows updated, inserted,
     * or deleted, in the same order as the rows supplied in the request. For insert, the
     * new key value for an auto-increment key will be in the returned row's field values.
     * For insert or update, the other field values may also be different than those supplied
     * as a result of database default expressions, triggers, or LabKey's automatic tracking
     * feature, which automatically adjusts columns of certain names (e.g., Created, CreatedBy,
     * Modified, ModifiedBy, etc.).
     */
    rows : Array<any>
}

/**
 * Interface to describe the third object passed to the successCallback function
 * by [[updateRows]], [[insertRows]] or [[deleteRows]]. This object's properties are useful for
 * matching requests to responses, as HTTP requests are typically
 * processed asynchronously.
 * Additional Documentation:
 * - [How to find schemaName, queryName and viewName](https://www.labkey.org/Documentation/wiki-page.view?name=findNames)
 */
export interface ModifyRowsOptions {
    field : string
    /** An object containing one property for each HTTP header sent to the server. */
    headers : Object
    /** The HTTP method used for the request (typically 'GET' or 'POST'). */
    method : string
    /** The URL that was requested. */
    url : string
    /**
     * The data object sent to the server. This will contain the following properties:
     * - schemaName: String. The schema name being modified.  This is the same schemaName
     * the client passed to the calling function.
     * - queryName: String. The query name being modified. This is the same queryName
     * the client passed to the calling function.
     * - rows: Object[]. Array of row objects that map the names of the row fields to their values.
     * The fields required for inclusion for each row depend on the which LABKEY.Query method you are
     * using (updateRows, insertRows or deleteRows).
     *
     * An example of a ModifyRowsOptions object for the 'updateRows' successCallback:
     * ```
     * {"schemaName": "lists",
     *  "queryName": "API Test List",
     *  "rows": [{
     *      "Key": 1,
     *      "FirstName": "Z",
     *      "Age": "100"
     *  }]
     * ```
     *
     *  For the 'insertRows' method, the fields of the rows should look the same as
     *  they do for the 'updateRows' method, except that primary key values for new rows
     *  need not be supplied if the primary key columns are auto-increment.
     *  An example of a ModifyRowsOptions object for the 'insertRows' successCallback:
     *
     *  ```
     * {"schemaName": "lists",
     *  "queryName": "API Test List",
     *  "rows": [{
     *      "FirstName": "C",
     *      "Age": "30"
     *  }]
     *  ```
     *
     * For the 'deleteRows' method, the fields of the rows should look the
     * same as they do for the 'updateRows' method, except that the 'deleteRows'
     * method needs to supply only the primary key values for the rows. All
     * other row data will be ignored.
     *  An example of a ModifyRowsOptions object for the 'deleteRows' successCallback:
     *
     *  ```
     * {"schemaName": "lists",
     *  "queryName": "API Test List",
     *  "rows": [{
     *      "Key": 3
     *  }]
     *  ```
     */
    jsonData : Object
}

/**
 * Save inserts, updates, and/or deletes to potentially multiple tables with a single request.
 * @see [[ModifyRowsResults]]
 * @see [[ModifyRowsOptions]]
 * @param {ISaveRowsOptions} options
 * @returns {XMLHttpRequest} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request
 * (see <a href="http://dev.sencha.com/deploy/dev/docs/?class=Ext.data.Connection&member=abort" target="_blank">Ext.data.Connection.abort</a>).
 * In server-side scripts, this method will return the JSON response object (first parameter of the success or failure callbacks.)
 */
export function saveRows(options: ISaveRowsOptions): XMLHttpRequest {

    if (arguments.length > 1) {
        options = mapArguments(arguments);
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