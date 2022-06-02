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
import { ensureRegionName, isArray } from '../Utils';
import { getParameters } from '../ActionURL';
import { FieldKey } from '../FieldKey';

import { FilterValue } from './constants';
import { IFilterType, getFilterTypeForURLSuffix, Types } from './Types';

export interface Aggregate {
    column?: string;
    label?: string;
    type: string;
}

export interface IFilter {
    getColumnName(): string;
    getFilterType(): IFilterType;
    getURLParameterName(dataRegionName?: string): string;
    getURLParameterValue(): FilterValue;
    getValue(): FilterValue;
}

// Previously known as LABKEY.Query.Filter
export class Filter implements IFilter {
    readonly columnName: string;
    readonly filterType: IFilterType;
    readonly value: FilterValue;

    constructor(columnName: string | string[] | FieldKey, value: FilterValue, filterType?: IFilterType) {
        if (columnName) {
            if (columnName instanceof FieldKey) {
                columnName = columnName.toString();
            } else if (columnName instanceof Array) {
                columnName = columnName.join('/');
            }
        }

        if (!filterType) {
            filterType = Types.EQUAL;
        }

        if (filterType.isTableWise()) {
            columnName = '*';
        }

        if (value) {
            // If the filter is multi-valued and we were constructed with a single
            // string value, split the string into the individual parts.
            value = filterType.parseValue(value);
        }

        this.columnName = columnName as string;
        this.filterType = filterType;
        this.value = value;
    }

    getColumnName(): string {
        return this.columnName;
    }

    getFilterType(): IFilterType {
        return this.filterType;
    }

    getURLParameterName(dataRegionName?: string): string {
        return [ensureRegionName(dataRegionName), '.', this.columnName, '~', this.filterType.getURLSuffix()].join('');
    }

    getURLParameterValue(): FilterValue {
        return this.filterType.getURLParameterValue(this.value);
    }

    getValue(): FilterValue {
        return this.value;
    }
}

/**
 * Create an object suitable for QueryWebPart, etc
 * @private
 */
export function appendAggregateParams(params: any, aggregates: Aggregate[], dataRegionName?: string): any {
    const prefix = ensureRegionName(dataRegionName) + '.agg.';
    const _params = params || {};

    if (isArray(aggregates)) {
        for (let i = 0; i < aggregates.length; i++) {
            const aggregate = aggregates[i];
            let value = 'type=' + aggregate.type;
            if (aggregate.label) {
                value = value + '&label=' + aggregate.label;
            }
            if (aggregate.type && aggregate.column) {
                // Create an array of aggregate values if there is more than one aggregate for the same column.
                const paramName = prefix + aggregate.column;
                let paramValue = encodeURIComponent(value);
                if (_params[paramName] !== undefined) {
                    let values = _params[paramName];
                    if (!isArray(values)) {
                        values = [values];
                    }
                    values.push(paramValue);
                    paramValue = values;
                }
                _params[paramName] = paramValue;
            }
        }
    }

    return _params;
}

/**
 * Create an Object suitable for Query.selectRows, etc
 * @private
 */
export function appendFilterParams(params: any, filterArray: IFilter[], dataRegionName?: string): any {
    const regionName = ensureRegionName(dataRegionName);
    const filterParams = params || {};

    if (filterArray) {
        for (let i = 0; i < filterArray.length; i++) {
            const filter = filterArray[i];

            // 10.1 compatibility: treat ~eq=null as a NOOP (#10482)
            if (filter.getFilterType().isDataValueRequired() && filter.getURLParameterValue() == null) {
                continue;
            }

            // Create an array of filter values if there is more than one filter for the same column and filter type.
            const name = filter.getURLParameterName(regionName);
            let value = filter.getURLParameterValue();

            if (filterParams[name] !== undefined) {
                let values = filterParams[name];
                if (!isArray(values)) {
                    values = [values];
                }
                values.push(value);
                value = values;
            }

            filterParams[name] = value;
        }
    }

    return filterParams;
}

/**
 * Creates a filter
 * @param column The name of a column that is available in the associated query.
 * @param value Value(s) to be filtered upon.
 * @param type Filter type for the filter. Defaults to `LABKEY.Filter.Types.EQUAL`.
 * @return A filter instance.
 *
 * ```
 * // Create a request with the data filtered
 * LABKEY.Query.selectRows({
 *   schemaName: 'lists',
 *   queryName: 'People',
 *   filterArray: [
 *       LABKEY.Filter.create('FirstName', 'Johnny'),
 *       LABKEY.Filter.create('Age', 15, LABKEY.Filter.Types.LESS_THAN_OR_EQUAL)
 *       LABKEY.Filter.create('LastName', ['A', 'B'], LABKEY.Filter.Types.DOES_NOT_START_WITH),
 *   ]
 *   success: function (data) {
 *       console.log("Success! " + data.rowCount + " rows returned.");
 *   },
 *   failure: function (errorInfo, options, responseObj) {
 *       console.error("Failed to query 'lists.People'.", errorInfo);
 *   },
 * });
 * ```
 */
export function create(column: string, value: FilterValue, type?: IFilterType): IFilter {
    return new Filter(column, value, type);
}

/**
 * Convert from URL syntax filters to a human readable description
 * (e.g. "Is Greater Than 10 AND Is Less Than 100").
 * @param url URL containing the filter parameters
 * @param dataRegionName Name of the data region the column is a part of
 * @param columnName Name of the column to filter
 * @return Human readable version of the filter
 *
 * ```js
 * var url = 'mylab.org?qwp1.priority~gt=10&qwp1.priority~lte=75';
 *
 * var description = LABKEY.Filter.getFilterDescription(url, 'qwp1', 'priority');
 *
 * console.log(description); // "Is Greater Than 10 AND Is Less Than or Equal To 75"
 * ```
 */
export function getFilterDescription(url: string, dataRegionName: string, columnName: string): string {
    const params = getParameters(url);
    let result = '';
    let sep = '';

    for (const paramName in params) {
        if (params.hasOwnProperty(paramName)) {
            // Look for parameters that have the right prefix
            if (paramName.indexOf(dataRegionName + '.' + columnName + '~') == 0) {
                const filterType = paramName.substring(paramName.indexOf('~') + 1);
                let values = params[paramName];

                if (!isArray(values)) {
                    values = [values];
                }

                // Get the human readable version, like "Is Less Than"
                const friendly = getFilterTypeForURLSuffix(filterType);
                let displayText: string;

                if (friendly) {
                    displayText = friendly.getDisplayText();
                } else {
                    displayText = filterType;
                }

                for (let i = 0; i < values.length; i++) {
                    // If the same type of filter is applied twice, it will have multiple values
                    result += sep + displayText + ' ' + values[i];
                    sep = ' AND ';
                }
            }
        }
    }

    return result;
}

export function getFiltersFromParameters(params: Record<string, any>, dataRegionName?: string): IFilter[] {
    const filters: IFilter[] = [];
    const regionName = ensureRegionName(dataRegionName);

    Object.keys(params).forEach(paramName => {
        if (paramName.indexOf(regionName + '.') == 0) {
            const tilde = paramName.indexOf('~');

            if (tilde != -1) {
                const columnName = paramName.substring(regionName.length + 1, tilde);
                const filterName = paramName.substring(tilde + 1);
                const filterType = getFilterTypeForURLSuffix(filterName);

                const values = params[paramName];
                // Create separate Filter objects if the filter parameter appears on the URL more than once.
                if (isArray(values)) {
                    for (let i = 0; i < values.length; i++) {
                        filters.push(create(columnName, values[i], filterType));
                    }
                } else {
                    filters.push(create(columnName, values, filterType));
                }
            }
        }
    });

    return filters;
}

/**
 * Create an array of [[IFilter]] objects from the filter parameters on the URL.
 * @param url The URL to parse filters from.
 * @param dataRegionName The data region name scope for the filters. Defaults to "query".
 */
export function getFiltersFromUrl(url: string, dataRegionName?: string): IFilter[] {
    return getFiltersFromParameters(getParameters(url), dataRegionName);
}

/**
 * Retrieves parameters used by [parameterized queries](https://www.labkey.org/Documentation/wiki-page.view?name=paramsql)
 * from the passed in URL for a given data region name
 * @param url The URL to parse the query parameters from.
 * @param dataRegionName The data region name scope for this query. Defaults to "query".
 */
export function getQueryParamsFromUrl(url: string, dataRegionName?: string): Record<string, any> {
    const queryParams: Record<string, any> = {};
    const params = getParameters(url);
    const key = ensureRegionName(dataRegionName) + '.param.';

    for (const paramName in params) {
        if (params.hasOwnProperty(paramName)) {
            if (paramName.indexOf(key) == 0) {
                const qParamName = paramName.substring(key.length);
                queryParams[qParamName] = params[paramName];
            }
        }
    }

    return queryParams;
}

/**
 * Retrieves the raw sort value from a URL's query parameters for a data region scoped sort.
 * @param url The URL to parse the sorts from.
 * @param dataRegionName The data region name scope for this query. Defaults to "query".
 */
export function getSortFromUrl(url: string, dataRegionName?: string): string {
    const regionName = ensureRegionName(dataRegionName);
    const params = getParameters(url);
    return params[regionName + '.sort'];
}

/**
 * Given an array of filter objects, return a new filterArray with old filters from a column
 * removed and new filters for the column added. If new filters are null, simply remove all old filters
 * from baseFilters that refer to this column.
 * @param baseFilters Array of existing filters created by [[create]]
 * @param columnName Column name of filters to replace
 * @param columnFilters Array of new filters created by [[create]]. Will replace any filters referring to columnName
 */
export function merge(baseFilters: IFilter[], columnName: string, columnFilters: IFilter[]): IFilter[] {
    const newFilters: IFilter[] = [];

    if (baseFilters && baseFilters.length > 0) {
        for (let i = 0; i < baseFilters.length; i++) {
            const bi = baseFilters[i];
            if (bi.getColumnName() != columnName) {
                newFilters.push(bi);
            }
        }
    }

    return columnFilters && columnFilters.length > 0 ? newFilters.concat(columnFilters) : newFilters;
}
