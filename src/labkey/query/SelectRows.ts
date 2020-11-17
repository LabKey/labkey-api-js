/*
 * Copyright (c) 2017-2020 LabKey Corporation
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
import { getCallbackWrapper, getOnFailure, getOnSuccess, isArray, RequestCallbackOptions } from '../Utils';
import { IFilter } from '../filter/Filter';

import { buildQueryParams, ContainerFilter, getMethod, getSuccessCallbackWrapper } from './Utils';

export type ShowRows = 'all' | 'none' | 'paginated' | 'selected' | 'unselected';

export interface SelectRowsOptions extends RequestCallbackOptions {
    /**
     * An Array of columns or a comma-delimited list of column names you wish to select from the specified query.
     * By default, selectRows will return the set of columns defined in the default value for this query, as defined
     * via the Customize View user interface on the server. You can override this by specifying a list of column
     * names in this parameter, separated by commas. The names can also include references to related tables
     * (e.g., 'RelatedPeptide/Peptide' where 'RelatedPeptide is the name of a foreign key column in the base query,
     * and 'Peptide' is the name of a column in the related table).
     */
    columns?: string | string[];
    /**
     * One of the values of {@link ContainerFilter} that sets
     * the scope of this query. Defaults to ContainerFilter.current, and is interpreted relative to
     * config.containerPath.
     */
    containerFilter?: ContainerFilter;
    /**
     * The path to the container in which the schema and query are defined, if different than the current container.
     * If not supplied, the current container's path will be used.
     */
    containerPath?: string;
    /** Prefix for query parameters (e.g. filters, sorts, etc) in this request. Defaults to "query". */
    dataRegionName?: string;
    /** Array of objects created by Filter.create. */
    filterArray?: IFilter[];
    /** If true, the command will ignore any filter that may be part of the chosen view. */
    ignoreFilter?: boolean;
    /**
     * Include the Details link column in the set of columns (defaults to false). If included, the column will
     * have the name "~~Details~~". The underlying table/query must support details links or the column will
     * be omitted in the response.
     */
    includeDetailsColumn?: boolean;
    /** Include metadata for the selected columns. Defaults to true. */
    includeMetadata?: boolean;
    includeStyle?: boolean;
    /**
     * Include the total number of rows available (defaults to true). If false totalCount will equal
     * number of rows returned (equal to maxRows unless maxRows == 0).
     */
    includeTotalCount?: boolean;
    /**
     * Include the Update (or edit) link column in the set of columns (defaults to false). If included, the column
     * will have the name "~~Update~~". The underlying table/query must support update links or the column
     * will be omitted in the response.
     */
    includeUpdateColumn?: boolean;
    /**
     * The maximum number of rows to return from the server (defaults to 100000).
     * If you want to return all possible rows, set this config property to -1.
     */
    maxRows?: number;
    /** Specify the HTTP method to use when making the request. Defaults to GET. */
    method?: 'GET' | 'POST';
    /**
     * The index of the first row to return from the server (defaults to 0). Use this along with the
     * maxRows config property to request pages of data.
     */
    offset?: number;
    parameters?: any;
    /**
     * Name of a query table associated with the chosen schema.
     * See also: [How To Find schemaName, queryName & viewName](https://www.labkey.org/Documentation/wiki-page.view?name=findNames).
     */
    queryName: string;
    requiredVersion?: number | string;
    /**
     * Name of a schema defined within the targeted container.
     * See also: [How To Find schemaName, queryName & viewName](https://www.labkey.org/Documentation/wiki-page.view?name=findNames).
     */
    schemaName: string;
    /**
     * Unique string used by selection APIs as a key when storing or retrieving the selected items for a grid.
     * Not used unless "showRows" is 'selected' or 'unselected'.
     */
    selectionKey?: string;
    showRows?: ShowRows;
    /**
     * String description of the sort. It includes the column names listed in the URL of a sorted data region
     * (with an optional minus prefix to indicate descending order). In the case of a multi-column sort,
     * up to three column names can be included, separated by commas.
     */
    sort?: string;
    /**
     * If true, removes columns marked as "hidden" in response as well as data associated with that column.
     * This is done in client-side post-processing.
     */
    stripHiddenColumns?: boolean;
    /** The maximum number of milliseconds to allow for this operation before a timeout error (defaults to 30000). */
    timeout?: number;
    /** The name of a custom view saved on the server for the specified query. */
    viewName?: string;
}

/**
 * @hidden
 * @private
 */
function buildSelectRowsParams(options: SelectRowsOptions): any {
    const params = buildQueryParams(
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
            } else {
                params[dataRegionName + '.maxRows'] = options.maxRows;
            }
        }
    } else if (['all', 'selected', 'unselected', 'none'].indexOf(options.showRows) !== -1) {
        params[dataRegionName + '.showRows'] = options.showRows;
    }

    if (options.viewName) params[dataRegionName + '.viewName'] = options.viewName;

    if (options.columns)
        params[dataRegionName + '.columns'] = isArray(options.columns)
            ? (options.columns as string[]).join(',')
            : options.columns;

    if (options.selectionKey) params[dataRegionName + '.selectionKey'] = options.selectionKey;

    if (options.ignoreFilter) params[dataRegionName + '.ignoreFilter'] = 1;

    if (options.parameters) {
        for (const propName in options.parameters) {
            if (options.parameters.hasOwnProperty(propName)) {
                params[dataRegionName + '.param.' + propName] = options.parameters[propName];
            }
        }
    }

    if (options.requiredVersion) params.apiVersion = options.requiredVersion;

    if (options.containerFilter) params.containerFilter = options.containerFilter;

    if (options.includeTotalCount !== undefined) params.includeTotalCount = options.includeTotalCount;

    if (options.includeDetailsColumn) params.includeDetailsColumn = options.includeDetailsColumn;

    if (options.includeUpdateColumn) params.includeUpdateColumn = options.includeUpdateColumn;

    if (options.includeStyle) params.includeStyle = options.includeStyle;

    if (options.includeMetadata !== undefined) params.includeMetadata = options.includeMetadata;

    return params;
}

/**
 * Select rows.
 * #### Examples
 *
 * ```js
 * function onFailure(errorInfo, options, responseObj)
 * {
 *     if (errorInfo && errorInfo.exception)
 *         alert("Failure: " + errorInfo.exception);
 *     else
 *         alert("Failure: " + responseObj.statusText);
 * }
 *
 * function onSuccess(data)
 * {
 *     alert("Success! " + data.rowCount + " rows returned.");
 * }
 *
 * LABKEY.Query.selectRows({
 *    schemaName: 'lists',
 *    queryName: 'People',
 *    columns: ['Name', 'Age'],
 *    success: onSuccess,
 *    failure: onFailure
 * });
 * ```
 *
 * @returns In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request. In server-side scripts,
 * this method will return the JSON response object (first parameter of the success or failure callbacks).
 */
export function selectRows(options: SelectRowsOptions): XMLHttpRequest {
    if (!options || !options.schemaName) {
        throw 'You must specify a schemaName!';
    }
    if (!options.queryName) {
        throw 'You must specify a queryName!';
    }

    return request({
        url: buildURL('query', 'getQuery.api', options.containerPath),
        method: getMethod(options.method),
        success: getSuccessCallbackWrapper(
            getOnSuccess(options),
            options.stripHiddenColumns,
            options.scope,
            options.requiredVersion
        ),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        params: buildSelectRowsParams(options),
        timeout: options.timeout,
    });
}
