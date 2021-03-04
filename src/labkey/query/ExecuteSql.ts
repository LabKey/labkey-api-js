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
import { getCallbackWrapper, getOnFailure, getOnSuccess, RequestCallbackOptions, wafEncode } from '../Utils';

import { ContainerFilter, getSuccessCallbackWrapper } from './Utils';

export interface ExecuteSqlOptions extends RequestCallbackOptions {
    /**
     * One of the values of {@link ContainerFilter} that sets
     * the scope of this query. Defaults to ContainerFilter.current, and is interpreted relative to
     * config.containerPath.
     */
    containerFilter?: ContainerFilter;
    /**
     * The path to the container in which the schema and query are defined,
     * if different than the current container. If not supplied, the current container's path will be used.
     */
    containerPath?: string;
    /** Include metadata for the selected columns. Defaults to true. */
    includeMetadata?: boolean;
    includeStyle?: boolean;
    /**
     * Include the total number of rows available (defaults to true).
     * If false totalCount will equal number of rows returned (equal to maxRows unless maxRows == 0).
     */
    includeTotalCount?: boolean;
    /** The maximum number of rows to return from the server (defaults to returning 100,000 rows). */
    maxRows?: number;
    /**
     * The index of the first row to return from the server (defaults to 0).
     * Use this along with the maxRows config property to request pages of data.
     */
    offset?: number;
    /**
     * Map of name (string)/value pairs for the values of parameters if the SQL
     * references underlying queries that are parameterized. For example, the following passes
     * two parameters to the query: `{'Gender': 'M', 'CD4': '400'}`.
     * The parameters are written to the request URL as follows: query.param.Gender=M&query.param.CD4=400.
     * For details on parameterized SQL queries, see [Parameterized SQL Queries](https://www.labkey.org/Documentation/wiki-page.view?name=paramsql).
     */
    parameters?: any;
    /**
     * If not set, or set to "8.3", the success handler will be passed a `SelectRowsResults` object.
     * If set to "9.1" the success handler will be passed an `ExtendedSelectRowsResults` object.
     * If greater than 13.2 the success handler will be passed a {@link Response} object.
     * The main difference between SelectRowsResults and ExtendedSelectRowsResults is that each column in each row
     * will be another object (not just a scalar value) with a "value" property as well as other related properties
     * (url, mvValue, mvIndicator, etc.). In the {@link Response} format each row will be an instance of
     * {@link Row}.
     *
     * In the "16.2" format, multi-value columns will be returned as an array of values, each of which may have a value, displayValue, and url.
     * In the "17.1" format, "formattedValue" may be included in the response as the display column's value formatted with the display column's format or folder format settings.
     */
    requiredVersion?: number | string;
    /**
     * Whether or not the definition of this query should be stored for reuse during the current session.
     * If true, all information required to recreate the query will be stored on the server and a unique query name will be passed to the
     * success callback.  This temporary query name can be used by all other API methods, including Query Web Part creation, for as long
     * as the current user's session remains active.
     */
    saveInSession?: boolean;
    /** Name of the schema to query. */
    schemaName: string;
    /**
     * A sort specification to apply over the rows returned by the SQL. In general, you should either include an
     * ORDER BY clause in your SQL, or specific a sort specification in this config property, but not both. The value
     * of this property should be a comma-delimited list of column names you want to sort by. Use a - prefix to sort
     * a column in descending order (e.g., 'LastName,-Age' to sort first by LastName, then by Age descending).
     */
    sort?: string;
    /** The LabKey SQL to execute. */
    sql: string;
    /**
     * If true, removes columns marked as "hidden" in response as well as data associated with that column.
     * This is done in client-side post-processing.
     */
    stripHiddenColumns?: boolean;
    /**
     * The maximum number of milliseconds to allow for this operation before
     * generating a timeout error (defaults to 30000).
     */
    timeout?: number;
}

function buildParams(options: ExecuteSqlOptions): any {
    const jsonData: any = {
        schemaName: options.schemaName,
        sql: wafEncode(options.sql),
    };

    if (options.saveInSession !== undefined && options.saveInSession !== null) {
        jsonData.saveInSession = options.saveInSession;
    }

    if (options.maxRows !== undefined && options.maxRows >= 0) {
        jsonData.maxRows = options.maxRows;
    }
    if (options.offset && options.offset > 0) {
        jsonData.offset = options.offset;
    }
    if (options.includeTotalCount !== undefined) {
        jsonData.includeTotalCount = options.includeTotalCount;
    }

    if (options.containerFilter) {
        jsonData.containerFilter = options.containerFilter;
    }

    if (options.requiredVersion) {
        jsonData.apiVersion = options.requiredVersion;
    }

    if (options.includeStyle) {
        jsonData.includeStyle = options.includeStyle;
    }

    if (options.includeMetadata !== undefined) {
        jsonData.includeMetadata = options.includeMetadata;
    }

    return jsonData;
}

function buildURLParams(options: ExecuteSqlOptions): any {
    const urlParams: any = {};

    if (options.sort) {
        // TODO: This should be changed to use a dataRegionName
        urlParams['query.sort'] = options.sort;
    }

    if (options.parameters) {
        for (const propName in options.parameters) {
            if (options.parameters.hasOwnProperty(propName)) {
                // TODO: This should be changed to use a dataRegionName
                urlParams['query.param.' + propName] = options.parameters[propName];
            }
        }
    }

    return urlParams;
}

/**
 * Execute arbitrary LabKey SQL. For more information, see the
 * [LabKey SQL Reference](https://www.labkey.org/Documentation/wiki-page.view?name=labkeySql).
 * #### Examples
 * Example, from the Reagent Request Confirmation [Tutorial](https://www.labkey.org/Documentation/wiki-page.view?name=reagentRequestConfirmation)
 * and [Demo](https://www.labkey.org/home/Study/demo/wiki-page.view?name=Confirmation):
 *
 * ```js
 * // This snippet extracts a table of UserID, TotalRequests and
 * // TotalQuantity from the "Reagent Requests" list.
 * // Upon success, the writeTotals function (not included here) uses the
 * // returned data object to display total requests and total quantities.
 *
 * LABKEY.Query.executeSql({
 *     containerPath: 'home/Study/demo/guestaccess',
 *     schemaName: 'lists',
 *     sql: 'SELECT "Reagent Requests".UserID AS UserID, \
 *         Count("Reagent Requests".UserID) AS TotalRequests, \
 *         Sum("Reagent Requests".Quantity) AS TotalQuantity \
 *         FROM "Reagent Requests" Group BY "Reagent Requests".UserID',
 *     success: writeTotals
 * });
 * ```

 * @returns In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request. In server-side scripts,
 * this method will return the JSON response object (first parameter of the success or failure callbacks).
 */
export function executeSql(options: ExecuteSqlOptions): XMLHttpRequest {
    return request({
        url: buildURL('query', 'executeSql.api', options.containerPath, buildURLParams(options)),
        method: 'POST',
        success: getSuccessCallbackWrapper(
            getOnSuccess(options),
            options.stripHiddenColumns,
            options.scope,
            options.requiredVersion
        ),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        jsonData: buildParams(options),
        timeout: options.timeout,
    });
}
