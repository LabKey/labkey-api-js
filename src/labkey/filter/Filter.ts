/*
 * Copyright (c) 2016-2017 LabKey Corporation
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
import { ensureRegionName, isArray } from '../Utils'
import { getParameters } from '../ActionURL'

import { FilterValue } from './constants'
import { FilterType, getFilterTypeForURLSuffix, Types } from './Types'

interface Aggregate {
    column?: string
    label?: string
    type: string
}

export interface Filter {
    getColumnName(): string
    getFilterType(): FilterType
    getURLParameterName(dataRegionName?: string): string
    getURLParameterValue(): FilterValue
    getValue(): FilterValue
}

/**
 * Create an object suitable for QueryWebPart, etc
 * @param params
 * @param aggregates
 * @param dataRegionName
 * @returns {any|{}}
 * @private
 */
export function appendAggregateParams(params: any, aggregates: Array<Aggregate>, dataRegionName?: string): any {
    const prefix = ensureRegionName(dataRegionName) + '.agg.';
    let _params = params || {};

    if (isArray(aggregates)) {
        for (let i=0; i < aggregates.length; i++) {
            let aggregate = aggregates[i];
            let value = 'type=' + aggregate.type;
            if (aggregate.label) {
                value = value + '&label=' + aggregate.label;
            }
            if (aggregate.type && aggregate.column) {
                // Create an array of aggregate values if there is more than one aggregate for the same column.
                let paramName = prefix + aggregate.column;
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
 * @param params
 * @param filterArray
 * @param dataRegionName
 * @returns {any|{}}
 * @private
 */
export function appendFilterParams(params: any, filterArray: Array<Filter>, dataRegionName?: string): any {

    let regionName = ensureRegionName(dataRegionName);
    let filterParams = params || {};

    if (filterArray) {
        for (let i=0; i < filterArray.length; i++) {
            let filter = filterArray[i];

            // 10.1 compatibility: treat ~eq=null as a NOOP (#10482)
            if (filter.getFilterType().isDataValueRequired() && null == filter.getURLParameterValue()) {
                continue;
            }

            // Create an array of filter values if there is more than one filter for the same column and filter type.
            let name = filter.getURLParameterName(regionName);
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

export function create(column: string, value: FilterValue, type?: FilterType): Filter {

    const _type = type ? type : Types.EQUAL;

    return {
        getColumnName: () => column,
        getValue: () => value,
        getFilterType: () => _type,
        getURLParameterName(dataRegionName?: string): string {
            let regionName = ensureRegionName(dataRegionName);
            return [
                regionName,
                '.',
                column,
                '~',
                _type.getURLSuffix()
            ].join('');
        },
        getURLParameterValue: () => {
            return _type.isDataValueRequired() ? value : '';
        }
    }
}

/**
 * Convert from URL syntax filters to a human readable description, like "Is Greater Than 10 AND Is Less Than 100"
 * @param {String} url URL containing the filter parameters
 * @param {String} dataRegionName String name of the data region the column is a part of
 * @param {String} columnName String name of the column to filter
 * @return {String} human readable version of the filter
 */
export function getFilterDescription(url: string, dataRegionName: string, columnName: string): string {
    const params = getParameters(url);
    let result = '';
    let sep = '';

    for (let paramName in params) {
        if (params.hasOwnProperty(paramName)) {

            // Look for parameters that have the right prefix
            if (paramName.indexOf(dataRegionName + '.' + columnName + '~') == 0) {
                let filterType = paramName.substring(paramName.indexOf('~') + 1);
                let values = params[paramName];

                if (!isArray(values)) {
                    values = [values];
                }

                // Get the human readable version, like "Is Less Than"
                let friendly = getFilterTypeForURLSuffix(filterType);
                let displayText: string;

                if (friendly) {
                    displayText = friendly.getDisplayText();
                }
                else {
                    displayText = filterType;
                }

                for (let i=0; i < values.length; i++) {
                    // If the same type of filter is applied twice, it will have multiple values
                    result += sep + displayText + ' ' + values[i];
                    sep = ' AND ';
                }
            }
        }
    }

    return result;
}

export function getFiltersFromUrl(url: string, dataRegionName?: string): Array<Filter> {

    let filters: Array<Filter> = [];
    const params = getParameters(url);
    const regionName = ensureRegionName(dataRegionName);

    for (let paramName in params) {
        if (params.hasOwnProperty(paramName)) {
            // Look for parameters that have the right prefix
            if (paramName.indexOf(regionName + '.') == 0) {
                let tilde = paramName.indexOf('~');

                if (tilde != -1) {
                    let columnName = paramName.substring(regionName.length + 1, tilde);
                    let filterName = paramName.substring(tilde + 1);
                    let filterType = getFilterTypeForURLSuffix(filterName);

                    let values = params[paramName];
                    if (!isArray(values)) {
                        values = [values];
                    }

                    filters.push(create(columnName, values, filterType));
                }
            }
        }
    }

    return filters;
}

export function getQueryParamsFromUrl(url: string, dataRegionName: string): any {

    let queryParams: {
        [key:string]: string
    } = {};
    
    const params = getParameters(url);
    const key = ensureRegionName(dataRegionName) + '.param.';

    for (let paramName in params) {
        if (params.hasOwnProperty(paramName)) {
            if (paramName.indexOf(key) == 0) {
                let qParamName = paramName.substring(key.length);
                queryParams[qParamName] = params[paramName];
            }
        }
    }

    return queryParams;
}

export function getSortFromUrl(url: string, dataRegionName: string): string {
    const regionName = ensureRegionName(dataRegionName);

    const params = getParameters(url);
    return params[regionName + '.sort'];
}

/**
 * Given an array of filter objects, return a new filterArray with old filters from a column
 * removed and new filters for the column added. If new filters are null, simply remove all old filters
 * from baseFilters that refer to this column.
 * @param {Array} baseFilters  Array of existing filters created by {@link LABKEY.Filter.create}
 * @param {String} columnName  Column name of filters to replace
 * @param {Array} columnFilters Array of new filters created by {@link LABKEY.Filter.create}. Will replace any filters referring to columnName
 */
export function merge(baseFilters: Array<Filter>, columnName: string, columnFilters: Array<Filter>): Array<Filter> {
    let newFilters: Array<Filter> = [];

    if (baseFilters && baseFilters.length > 0) {
        for (let i=0; i < baseFilters.length; i++) {
            let bi = baseFilters[i];
            if (bi.getColumnName() != columnName) {
                newFilters.push(bi);
            }
        }
    }

    return columnFilters && columnFilters.length > 0 ? newFilters.concat(columnFilters) : newFilters;
}