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

    /** <b>Experimental:</b> Optional extra context object passed into the transformation/validation script environment. */
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
     * <b>Experimental:</b> Optional extra context object passed into the transformation/validation script environment.
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
     *   * <strong>result</strong>: an array of parsed response data ({@link LABKEY.Query.ModifyRowsResults}) (one for each command in the request)
     *   * <strong>errorCount</strong>: an integer, with the total number of errors encountered during the operation
     *   * <strong>committed</strong>: a boolean, indicating if the changes were actually committed to the database
     * * the XMLHttpRequest object
     * * (optionally) the "options" object ({@link LABKEY.Query.ModifyRowsOptions})
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
 * Save inserts, updates, and/or deletes to potentially multiple tables with a single request.
 * @see LABKEY.Query.ModifyRowsResults
 * @see LABKEY.Query.ModifyRowsOptions
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