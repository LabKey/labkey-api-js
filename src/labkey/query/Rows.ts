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
import { request } from '../Ajax';
import { buildURL } from '../ActionURL';
import { getCallbackWrapper, getOnFailure, getOnSuccess, RequestCallbackOptions } from '../Utils';
import { AuditBehaviorTypes } from '../constants';

export interface QueryRequestOptions extends RequestCallbackOptions {
    apiVersion?: number | string;
    /** Can be used to override the audit behavior for the table the query is acting on. See [[AuditBehaviorTypes]]. */
    auditBehavior?: AuditBehaviorTypes;
    /** Can be used to provide a comment from the user that will be attached to certain detailed audit log records. */
    auditUserComment?: string;
    /**
     * Flag that specifies if row data should be parsed and transformed into FormData when File data is present.
     * Defaults to false.
     * This is useful for endpoints that support File data. The client-side supports parsing and transforming
     * the request payload into FormData for handling File data.
     */
    autoFormFileData?: boolean;
    /**
     * The container path in which the schema and query name are defined.
     * If not supplied, the current container path will be used.
     */
    containerPath?: string;
    /** **Experimental:** Optional extra context object passed into the transformation/validation script environment. */
    extraContext?: any;
    /**
     * FormData or Object consumable by FormData that can be used to POST key/value pairs of form information.
     * For more information, see <a href="https://developer.mozilla.org/en-US/docs/Web/API/FormData">FormData documentation</a>.
     * Note that if both form and rows are provided, the form object will be used.
     */
    form?: FormData | HTMLFormElement;
    /**
     * Name of a query table associated with the chosen schema.
     * See also: [How To Find schemaName, queryName & viewName](https://www.labkey.org/Documentation/wiki-page.view?name=findNames).
     */
    queryName: string;
    rowDataArray?: any[];
    /**
     * Array of record objects in which each object has a property for each field.
     * The row data array needs to include only the primary key column value, not all columns.
     * Note that if both form and rows are provided, the form object will be used.
     */
    rows?: any[];
    /**
     * Name of a schema defined within the current container.
     * See also: [How To Find schemaName, queryName & viewName](https://www.labkey.org/Documentation/wiki-page.view?name=findNames).
     */
    schemaName: string;
    /**
     * The maximum number of milliseconds to allow for this operation before
     * generating a timeout error (defaults to 30000).
     */
    timeout?: number;
    /**
     * Whether all of the deletes should be done in a single transaction, so they all succeed or all fail.
     * Defaults to true.
     */
    transacted?: boolean;
}

/**
 * @hidden
 * @private
 */
function applyArguments(options: QueryRequestOptions, args: IArguments, action: string): SendRequestOptions {
    return args && args.length > 1
        ? {
              ...queryArguments(args),
              action,
          }
        : {
              ...options,
              action,
          };
}

/**
 * Delete specific rows in a table.
 *
 * @returns In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request. In server-side scripts,
 * this method will return the JSON response object (first parameter of the success or failure callbacks).
 */
export function deleteRows(options: QueryRequestOptions): XMLHttpRequest {
    return sendRequest(applyArguments(options, arguments, 'deleteRows.api'));
}

/**
 * Insert rows.
 * #### Examples
 * ```js
 * // This snippet inserts data from the ReagentReqForm into a list.
 * // Upon success, it moves the user to the confirmation page and
 * // passes the current user's ID to that page.
 * LABKEY.Query.insertRows({
 *     containerPath: '/home/Study/demo/guestaccess',
 *     schemaName: 'lists',
 *     queryName: 'Reagent Requests',
 *     rows: [{
 *        "Name":  ReagentReqForm.DisplayName.value,
 *        "Email": ReagentReqForm.Email.value,
 *        "UserID": ReagentReqForm.UserID.value,
 *        "Reagent": ReagentReqForm.Reagent.value,
 *        "Quantity": parseInt(ReagentReqForm.Quantity.value),
 *        "Date": new Date(),
 *        "Comments": ReagentReqForm.Comments.value,
 *        "Fulfilled": 'false'
 *     }],
 *     success: function(data) {
 *         window.location =
 *            '/home/Study/demo/wiki-page.view?name=confirmation&userid='
 *            + LABKEY.Security.currentUser.id;
 *     },
 * });
 * ```
 *
 * @returns In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request. In server-side scripts,
 * this method will return the JSON response object (first parameter of the success or failure callbacks).
 */
export function insertRows(options: QueryRequestOptions): XMLHttpRequest {
    return sendRequest(applyArguments(options, arguments, 'insertRows.api'), true);
}

// previously configFromArgs
/**
 * @hidden
 * @private
 */
function queryArguments(args: IArguments): QueryRequestOptions {
    return {
        schemaName: args[0],
        queryName: args[1],
        rows: args[2],
        success: args[3],
        failure: args[4],
    };
}

export type CommandType = 'delete' | 'insert' | 'update';

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
 * ```js
 * {
 *  "schemaName": "lists",
 *  "queryName": "API Test List",
 *  "rowsAffected": 1,
 *  "command": "insert",
 *  "errors": [],
 *  "rows": [{ Key: 3, StringField: 'NewValue'}]
 * }
 * ```
 */
export interface ModifyRowsResults {
    /** Will be "update", "insert", or "delete" depending on the API called. */
    command: CommandType;
    /**
     * Objects will contain the properties 'id' (the field to which the error is related, if any),
     * and 'msg' (the error message itself).
     */
    errors: any[];
    field?: string;
    /** Contains the same queryName the client passed to the calling function. */
    queryName: string;
    /**
     * Array of rows with field values for the rows updated, inserted,
     * or deleted, in the same order as the rows supplied in the request. For insert, the
     * new key value for an auto-increment key will be in the returned row's field values.
     * For insert or update, the other field values may also be different than those supplied
     * as a result of database default expressions, triggers, or LabKey's automatic tracking
     * feature, which automatically adjusts columns of certain names (e.g., Created, CreatedBy,
     * Modified, ModifiedBy, etc.).
     */
    rows: any[];
    /**
     * Indicates the number of rows affected by the API action.
     * This will typically be the same number of rows passed in to the calling function.
     */
    rowsAffected: number;
    /** Contains the same schemaName the client passed to the calling function. */
    schemaName: string;
}

export interface Command {
    /** Name of the command to be performed. Must be one of "insert", "update", or "delete". */
    command: CommandType;
    /** **Experimental:** Optional extra context object passed into the transformation/validation script environment. */
    extraContext?: any;
    /**
     * Name of a query table associated with the chosen schema.
     * See also: [How To Find schemaName, queryName & viewName](https://www.labkey.org/Documentation/wiki-page.view?name=findNames).
     */
    queryName: string;
    /**
     * An array of data for each row to be changed. See [[insertRows]],
     * [[updateRows]], or [[deleteRows]] for requirements of what data must be included for each row.
     */
    rows: any[];
    /**
     * Name of a schema defined within the current container.
     * See also: [How To Find schemaName, queryName & viewName](https://www.labkey.org/Documentation/wiki-page.view?name=findNames).
     */
    schemaName: string;
}

export interface SaveRowsResponse {
    /** Indicates if the changes were actually committed to the database. */
    committed: boolean;
    /** The total number of errors encountered during the operation. */
    errorCount: number;
    /** An array of parsed response data (one for each command in the request). */
    result: ModifyRowsResults[];
}

export interface SaveRowsOptions extends RequestCallbackOptions<SaveRowsResponse> {
    /**
     * Version of the API. If this is 13.2 or higher, a request that fails
     * validation will be returned as a successful response. Use the 'errorCount' and 'committed' properties in the
     * response to tell if it committed or not. If this is 13.1 or lower (or unspecified), the failure callback
     * will be invoked instead in the event of a validation failure.
     */
    apiVersion?: string | number;
    /** An array of all of the update/insert/delete operations to be performed. */
    commands: Command[];
    /**
     * The container path in which the changes are to be performed.
     * If not supplied, the current container path will be used.
     */
    containerPath?: string;
    /**
     * **Experimental:** Optional extra context object passed into the transformation/validation script environment.
     * The extraContext at the command-level will be merged with the extraContext at the top-level of the config.
     */
    extraContext?: any;
    /**
     * The maximum number of milliseconds to allow for this operation before generating a timeout error
     * (defaults to 30000).
     */
    timeout?: number;
    /**
     * Whether all of the row changes for all of the tables
     * should be done in a single transaction, so they all succeed or all fail. Defaults to true.
     */
    transacted?: boolean;
    /**
     * Whether or not the server should attempt proceed through all of the
     * commands, but not actually commit them to the database. Useful for scenarios like giving incremental
     * validation feedback as a user fills out a UI form, but not actually save anything until they explicitly request
     * a save.
     */
    validateOnly?: boolean;
}

/**
 * Save inserts, updates, and/or deletes to potentially multiple tables with a single request.
 *
 * @returns In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request. In server-side scripts,
 * this method will return the JSON response object (first parameter of the success or failure callbacks).
 */
export function saveRows(options: SaveRowsOptions): XMLHttpRequest {
    // Nick: I've elected to comment this out as saveRows never supported the same argument
    // pattern as other endpoints due to the different nature of it's arguments (e.g. doesn't take a
    // schema/query but rather commands, etc). As a result, the object would not match what is expected.
    // if (arguments.length > 1) {
    //     options = queryArguments(arguments);
    // }

    return request({
        url: buildURL('query', 'saveRows.api', options.containerPath),
        method: 'POST',
        jsonData: {
            apiVersion: options.apiVersion,
            commands: options.commands,
            containerPath: options.containerPath,
            extraContext: options.extraContext,
            transacted: options.transacted,
            validateOnly: options.validateOnly,
        },
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        timeout: options.timeout,
    });
}

interface SendRequestOptions extends QueryRequestOptions {
    action: string;
}

// Exported for unit testing
export function bindFormData(jsonData: { rows?: any[] }, options: SendRequestOptions, supportsFiles = false): FormData {
    let form: FormData;
    // if the caller has provided a FormData object, put the config props into the form as a json string
    if (options.form instanceof FormData) {
        if (!options.form.has('json')) {
            options.form.append('json', JSON.stringify(jsonData));
        }
        form = options.form;
    } else if (supportsFiles && options.autoFormFileData) {
        // A form was not explicitly provided, however, this endpoint supports File data in the rows payload.
        const hasFileData = jsonData.rows?.find(row => {
            return !!row && Object.values(row).find(value => value instanceof File);
        });

        if (hasFileData) {
            form = new FormData();

            // Process and extract File data with row offsets
            const rows: Array<Record<string, any>> = [];

            jsonData.rows.forEach((row, i) => {
                if (row) {
                    const _row: Record<string, any> = {};

                    Object.keys(row).forEach(k => {
                        // Extract File values from the row
                        if (row[k] instanceof File) {
                            form.append(`${k}::${i}`, row[k]);
                        } else {
                            _row[k] = row[k];
                        }
                    });

                    rows.push(_row);
                } else {
                    rows.push(row);
                }
            });

            form.append('json', JSON.stringify({ ...jsonData, rows }));
        }
    }

    return form;
}

// Formerly sendJsonQueryRequest
/**
 * @hidden
 * @private
 */
function sendRequest(options: SendRequestOptions, supportsFiles?: boolean): XMLHttpRequest {
    const jsonData = {
        schemaName: options.schemaName,
        queryName: options.queryName,
        rows: options.rows || options.rowDataArray,
        transacted: options.transacted,
        extraContext: options.extraContext,
        auditBehavior: options.auditBehavior,
        auditUserComment: options.auditUserComment,
    };

    const form = bindFormData(jsonData, options, supportsFiles);

    return request({
        url: buildURL('query', options.action, options.containerPath),
        method: 'POST',
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        ...(form ? { form } : { jsonData }),
        timeout: options.timeout,
    });
}

/**
 * Delete all rows in a table.
 *
 * @returns In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request. In server-side scripts,
 * this method will return the JSON response object (first parameter of the success or failure callbacks).
 */
export function truncateTable(options: QueryRequestOptions): XMLHttpRequest {
    return sendRequest(applyArguments(options, undefined, 'truncateTable.api'));
}

/**
 * Update rows.
 *
 * @returns In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request. In server-side scripts,
 * this method will return the JSON response object (first parameter of the success or failure callbacks).
 */
export function updateRows(options: QueryRequestOptions): XMLHttpRequest {
    return sendRequest(applyArguments(options, arguments, 'updateRows.api'), true);
}
