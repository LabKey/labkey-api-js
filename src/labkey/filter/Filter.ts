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
import { ensureRegionName, isArray } from '../Utils'
import { getParameters } from '../ActionURL'
import { FieldKey } from '../fieldKey/FieldKey'

import { FilterValue } from './constants'
import { IFilterType, getFilterTypeForURLSuffix, Types } from './Types'

export interface Aggregate {
    column?: string
    label?: string
    type: string
}

export interface IFilter {
    getColumnName(): string
    getFilterType(): IFilterType
    getURLParameterName(dataRegionName?: string): string
    getURLParameterValue(): FilterValue
    getValue(): FilterValue
}

// Previously known as LABKEY.Query.Filter
export class Filter implements IFilter {

    readonly columnName: string;
    readonly filterType: IFilterType;
    readonly value: FilterValue;

    constructor(columnName: string | Array<string> | FieldKey, value: FilterValue, filterType?: IFilterType) {

        if (columnName) {
            if (columnName instanceof FieldKey) {
                columnName = columnName.toString();
            }
            else if (columnName instanceof Array) {
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
        return [
            ensureRegionName(dataRegionName),
            '.',
            this.columnName,
            '~',
            this.filterType.getURLSuffix()
        ].join('');
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
 * @private
 */
export function appendFilterParams(params: any, filterArray: Array<IFilter>, dataRegionName?: string): any {

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

/**
 * Creates a filter
 *
 * ```
 * function onFailure(errorInfo, options, responseObj){
 *  if(errorInfo && errorInfo.exception)
 *      alert("Failure: " + errorInfo.exception);
 *  else
 *      alert("Failure: " + responseObj.statusText);
 * }
 *
 * function onSuccess(data){
 *  alert("Success! " + data.rowCount + " rows returned.");
 * }
 *
 * LABKEY.Query.selectRows({
 *  schemaName: 'lists',
 *  queryName: 'People',
 *  success: onSuccess,
 *  failure: onFailure,
 *  filterArray: [
 *      LABKEY.Filter.create('FirstName', 'Johnny'),
 *      LABKEY.Filter.create('Age', 15, LABKEY.Filter.Types.LESS_THAN_OR_EQUAL)
 *      LABKEY.Filter.create('LastName', ['A', 'B'], LABKEY.Filter.Types.DOES_NOT_START_WITH)
 *  ]
 * });
 * ```
 */
export function create(column: string, value: FilterValue, type?: IFilterType): IFilter {
    return new Filter(column, value, type);
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

export function getFiltersFromParameters(params: {[key:string]: any}, dataRegionName?: string) : Array<IFilter> {
    let filters: Array<IFilter> = [];
    const regionName = ensureRegionName(dataRegionName);

    for (const paramName in params) {
        if (params.hasOwnProperty(paramName)) {
            // Look for parameters that have the right prefix
            if (paramName.indexOf(regionName + '.') == 0) {
                let tilde = paramName.indexOf('~');

                if (tilde != -1) {
                    let columnName = paramName.substring(regionName.length + 1, tilde);
                    let filterName = paramName.substring(tilde + 1);
                    let filterType = getFilterTypeForURLSuffix(filterName);

                    let values = params[paramName];
                    // Create separate Filter objects if the filter parameter appears on the URL more than once.
                    if (isArray(values)) {
                        for (let i = 0; i < values.length; i++) {
                            filters.push(create(columnName, values[i], filterType));
                        }
                    }
                    else {
                        filters.push(create(columnName, values, filterType));
                    }

                }
            }
        }
    }

    return filters;
}

/**
 * Create an array of LABKEY.Filter objects from the filter parameters on the URL
 */
export function getFiltersFromUrl(url: string, dataRegionName?: string): Array<IFilter> {

    return getFiltersFromParameters(getParameters(url), dataRegionName);
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
export function merge(baseFilters: Array<IFilter>, columnName: string, columnFilters: Array<IFilter>): Array<IFilter> {
    let newFilters: Array<IFilter> = [];

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