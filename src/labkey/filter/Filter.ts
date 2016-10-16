import { ensureRegionName, isArray } from '../Utils'
import { getParameters } from '../ActionURL'

import { FilterValue } from './constants'
import { FilterType, Types } from './Types'

export interface Filter {
    getColumnName(): string
    getFilterType(): FilterType
    getURLParameterName(dataRegionName?: string): string
    getURLParameterValue(): FilterValue
    getValue(): FilterValue
}

export function appendFilterParams(params: any, filterArray: Array<Filter>, dataRegionName?: string): any {

    let regionName = ensureRegionName(dataRegionName);
    let filterParams = params || {};

    if (filterArray) {
        for (var i=0; i < filterArray.length; i++) {
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
    throw new Error('Filter.getFilterDescription() Not Yet Implemented');
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
        for (var i=0; i < baseFilters.length; i++) {
            let bi = baseFilters[i];
            if (bi.getColumnName() != columnName) {
                newFilters.push(bi);
            }
        }
    }

    return columnFilters && columnFilters.length > 0 ? newFilters.concat(columnFilters) : newFilters;
}