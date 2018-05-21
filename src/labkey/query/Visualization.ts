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
import { buildURL, getParameters, queryString } from '../ActionURL'
import { request, RequestOptions } from '../Ajax'
import { decode, getCallbackWrapper, getOnFailure, getOnSuccess } from '../Utils'
import { Filter as QueryFilter } from '../filter/Filter'

import { Aggregate, Interval, TAggregate, TInterval, Type } from './visualization/constants'
import { Dimension } from './visualization/Dimension'
import * as Filter from './visualization/Filter'
import { Measure } from './visualization/Measure'
import { getSuccessCallbackWrapper } from './visualization/Utils'

export {
    Aggregate,
    Dimension,
    Filter,
    Interval,
    Measure,
    Type
}

function createMeasures(json: any): Array<Measure> {

    let measures: Array<Measure> = [];
    if (json.measures && json.measures.length) {
        for (let i=0; i < json.measures.length; i++) {
            measures.push(new Measure(json.measures[i]));
        }
    }

    return measures;
}

function createTypes(json: any): Array<any> {

    if (json && json.types && json.types.length) {
        // for now just return the raw object array
        return json.types;
    }

    return [];
}

export interface IDateOptions {
    dateCol: Measure | IMeasureLike
    interval?: TInterval
    useProtocolDay?: boolean
    zeroDateCol?: Measure | IMeasureLike
    zeroDayVisitTag?: string
}

export interface IDimensionLike {
}

export interface IGetOptions {
    failure?: Function
    name: string
    reportId?: any
    queryName?: string
    schemaName?: string
    scope?: any
    success?: Function
}

/**
 * Retrieves a saved visualization.
 */
export function get(options: IGetOptions): void {

    const jsonData = {
        name: options.name,
        reportId: options.reportId,
        queryName: options.queryName,
        schemaName: options.schemaName
    };

    const onSuccess = getOnSuccess(options);

    request({
        url: buildURL('visualization', 'getVisualization'),
        method: 'POST',
        initialConfig: options,
        jsonData,
        success: getCallbackWrapper((json: any, response: XMLHttpRequest, requestOptions: RequestOptions) => {
            if (json && json.visualizationConfig) {
                json.visualizationConfig = decode(json.visualizationConfig);
            }

            if (onSuccess) {
                onSuccess.call(options.scope || this, json, response, requestOptions);
            }
        }, options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}

export interface IGetDataOptions {
    containerPath?: string
    endpoint?: string
    failure?: Function
    filterQuery?: string
    filterUrl?: string
    groupBys?: any // TODO: determine type
    joinToFirst?: boolean
    limit?: any // TODO: determine type
    measures: Array<IMeasureable>
    metaDataOnly?: boolean
    parameters?: any
    scope?: any
    sorts?: Array<Dimension> | Array<Measure> | Array<IGetDataSortable>
    success?: Function
}

export interface IGetDataSortable {

}

/**
 * Returns a resultset suitable for visualization based on requested measures and dimensions.
 * @param options
 */
export function getData(options: IGetDataOptions): void {

    let jsonData: any = {
        measures: [],
        sorts: options.sorts,

        // @deprecated -- created for issue 11627
        // The filterUrl and filterQuery are used in tandem to apply a filter from a URL. Use the filterArray
        // option on each measure to apply filters.
        filterQuery: options.filterQuery, // e.g. 'study.Lab Results'
        filterUrl: options.filterUrl, // e.g. '/labkey/study/StudyFolder/dataset.view?Dataset.Column%7Egt=value'

        limit: options.limit,
        groupBys: options.groupBys,
        metaDataOnly: options.metaDataOnly === true,

        // specify that all source queries should join back to the first measure
        joinToFirst: options.joinToFirst === true
    };

    // clone measures
    let filters, m, f, asURL, fa;
    for (m=0; m < options.measures.length; m++) {
        let c = options.measures[m];

        let measure: IMeasureable = {
            measure: c.measure,
            time: c.time
        };

        if (c.dimension) {
            measure.dimension = c.dimension;
        }

        if (c.dateOptions) {
            measure.dateOptions = c.dateOptions;
        }

        if (c.filterArray) {
            measure.filterArray = c.filterArray;

            // assume it is an array of LABKEY.Filter instances, convert each filter to it's URL parameter equivalent
            filters = [];
            for (f=0; f < measure.filterArray.length; f++) {
                fa = measure.filterArray[f];
                if (fa && fa.getURLParameterName) {
                    asURL = encodeURIComponent(fa.getURLParameterName()) + "=" + encodeURIComponent(fa.getURLParameterValue());
                    filters.push(asURL);
                }
            }

            // TODO: See if we can fix-up typings so this doesn't have to be cast.
            measure.filterArray = (filters as any);
        }

        jsonData.measures.push(measure);
    }

    // issue 21418: support for parameterized queries
    let urlParams: any = {};
    if (options.parameters) {
        for (let p in options.parameters) {
            if (options.parameters.hasOwnProperty(p)) {
                urlParams['visualization.param.' + p] = options.parameters[p];
            }
        }
    }

    let url: string;
    if (options.endpoint) {
        url = options.endpoint + '?' + queryString(urlParams);
    }
    else {
        url = buildURL('visualization', 'getData', options.containerPath, urlParams);
    }

    request({
        url,
        method: 'POST',
        jsonData,
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}

export function getDataFilterFromURL(): string {
    return getParameters().filterUrl;
}

export interface IGetFromUrlOptions {
    failure?: Function
    scope?: any
    success?: Function
}

/**
 * Retrieves a saved visualization based on identifying parameters found on the current URL.
 * Method returns true or false, depending on whether the URL contains a saved visualization identifier.
 * If true, the success or failure callback function will be called just as with get(). If false, no callbacks
 * will be called. This method allows callers to use a single method to retrieve saved visualizations, regardless
 * of how they are identified on the URL.
 * @returns {boolean}
 */
export function getFromUrl(options: IGetFromUrlOptions): boolean {
    let params: any = options || {};

    params.success = getOnSuccess(options);
    params.failure = getOnFailure(options);

    let urlParams = getParameters();
    let valid = false;
    if (params.reportId) {
        valid = true;
    }
    else {
        if (urlParams.name) {
            params.name = urlParams.name;
            params.schemaName = urlParams.schemaName;
            params.queryName = urlParams.queryName;
            valid = true;
        }
    }

    if (valid) {
        get(params);
    }
    return valid;
}

export interface IGetMeasuresOptions {
    allColumns?: any
    dateMeasures?: any
    failure?: Function
    filters?: Array<any> // TODO: Check if this is expecting Query Filters
    showHidden?: any;
    scope?: any
    success?: Function
}

/**
 * Returns the set of plottable measures found in the current container.
 * @param options
 */
export function getMeasures(options: IGetMeasuresOptions): void {

    let params: any = {};

    if (options.filters && options.filters.length) {
        params.filters = options.filters;
    }

    if (options.dateMeasures !== undefined) {
        params.dateMeasures = options.dateMeasures;
    }

    if (options.allColumns !== undefined) {
        params.allColumns = options.allColumns;
    }

    if (options.showHidden !== undefined) {
        params.showHidden = options.showHidden;
    }
    
    request({
        url: buildURL('visualization', 'getMeasures'),
        method: 'GET',
        params,
        success: getSuccessCallbackWrapper(createMeasures, getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}

export interface IGetTypesOptions {
    failure?: Function
    scope?: any
    success?: Function
}

export function getTypes(options: IGetTypesOptions): void {

    request({
        url: buildURL('visualization', 'getVisualizationTypes'),
        method: 'GET',
        success: getSuccessCallbackWrapper(createTypes, getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}

export interface IMeasureable {
    dateOptions?: IDateOptions
    dimension?: Dimension | IDimensionLike
    filterArray?: Array<QueryFilter>
    measure: Measure | IMeasureLike
    time?: any
}

export interface IMeasureLike {
    aggregate?: TAggregate
    alias: string
    allowNullResults?: boolean
    isDemographic?: boolean
    name: string
    queryName: string
    schemaName: string
    type: string
    values?: any
}