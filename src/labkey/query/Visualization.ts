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
import { buildURL, getParameters, queryString } from '../ActionURL'
import { request, RequestOptions } from '../Ajax'
import { decode, getCallbackWrapper, getOnFailure, getOnSuccess } from '../Utils'
import { IFilter as QueryFilter } from '../filter/Filter'

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
    /** A measure object (with properties for name, queryName, and schemaName) of type date specifying the measure date. */
    dateCol: Measure | IMeasureLike

    /**
     * See [[Interval]].  The type of interval that should be calculated between the measure date and the zero date
     * (if zeroDateCol is specified) or zero day (if zeroDayVisitTag is specified).
     */
    interval?: TInterval

    /**
     * If true, zeroDayVisitTag uses ParticipantVisit.ProtocolDay to calculate offsets;
     * if false ParticipantVisit.Day is used. Defaults to true.
     */
    useProtocolDay?: boolean

    /**
     * A measure object (with properties for name, queryName, and schemaName) of type date specifiying
     * the zero date, used to align data points in terms of days, weeks, or months.
     */
    zeroDateCol?: Measure | IMeasureLike

    /** A VisitTag that will be used to find the ParticipantVisit used to align data points. */
    zeroDayVisitTag?: string
}

export interface IDimensionLike {
}

export interface IGetOptions {
    /**
     * Function called when execution fails.  Called with the following parameters:
     * * **errorInfo:** an object containing detailed error information (may be null)
     * * **response:** The XMLHttpResponse object
     */
    failure?: Function
    name: string
    reportId?: any

    /**
     * Optional, but required if config.schemaName is provided.  Limits the search for
     * the visualization to a specific schema and query.  Note that visualization names are unique within a container
     * (regardless of schema and query), so these additional optional parameters are only useful in a small number of circumstances.
     */
    queryName?: string

    /**
     * Optional, but required if config.queryName is provided.  Limits the search for
     * the visualization to a specific schema and query.  Note that visualization names are unique within a container
     * (regardless of schema and query), so these additional optional parameters are only useful in a small number of circumstances.
     */
    schemaName?: string
    scope?: any

    /**
     * Function called when execution succeeds. Will be called with one arguments:
     * * **result**: an object with two properties:
     *    * **name**: The name of the saved visualization
     *    * **description**: The description of the saved visualization
     *    * **type**: The visualization type
     *    * **schemaName**: The schema to which this visualization has been scoped, if any
     *    * **queryName**: The query to which this visualization has been scoped, if any
     *    * **visualizationConfig**: The configuration object provided to [[save]]
     * * **request**: the XMLHttpRequest object
     * * **options**: a request options object
     */
    success?: Function
}

/**
 * Retrieves a saved visualization.  See [[save]].
 * @param {IGetOptions} options
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

    /**
     * Function called when execution fails.  Called with the following parameters:
     * * **errorInfo:** an object containing detailed error information (may be null)
     * * **response:** The XMLHttpResponse object
     */
    failure?: Function
    filterQuery?: string
    filterUrl?: string
    groupBys?: any // TODO: determine type

    /**
     * Default false. If true, all measures will be joined to the first measure
     * in the array instead of to the previous measure.
     */
    joinToFirst?: boolean
    limit?: any // TODO: determine type
    measures: Array<IMeasureable>

    /** Default false. If true, response will no include the actual data rows, just metadata. */
    metaDataOnly?: boolean
    parameters?: any
    scope?: any

    /** Generally an array of augmented [[Dimension]] or [[Measure]] objects */
    sorts?: Array<Dimension> | Array<Measure> | Array<IGetDataSortable>

    /**
     * Function called when execution succeeds. Will be called with three arguments:
     * * **data**: the parsed response data ({@link LABKEY.Query.SelectRowsResults})
     * * **request**: the XMLHttpRequest object
     * * **options**: a request options object ({@link LABKEY.Query.SelectRowsOptions})
     */
    success?: Function
}

export interface IGetDataSortable {

}

/**
 * Returns a resultset suitable for visualization based on requested measures and dimensions.
 * @param {IGetDataOptions} options
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
    /** Function called when the saved visualization could not be retrieved.  See [[get]] for details. */
    failure?: Function
    scope?: any

    /** Function called when the saved visualization was successfully retrieved. See [[get]] for details. */
    success?: Function
}

/**
 * Retrieves a saved visualization based on identifying parameters found on the current URL.
 * Method returns true or false, depending on whether the URL contains a saved visualization identifier.
 * If true, the success or failure callback function will be called just as with [[get]]. If false, no callbacks
 * will be called. This method allows callers to use a single method to retrieve saved visualizations, regardless
 * of how they are identified on the URL.
 * @param {IGetFromUrlOptions} options
 * @returns {boolean} Indicates whether the current URL includes parameters that identify a saved visualization.
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

    /** Indicates whether date measures should be returned instead of numeric measures. Defaults to false. */
    dateMeasures?: any

    /**
     * Function called when execution fails.  Called with the following parameters:
     * * **errorInfo:** an object containing detailed error information (may be null)
     * * **response:** The XMLHttpResponse object
     */
    failure?: Function

    /** An array of [[Filter]] objects. **/
    filters?: Array<any> // TODO: Check if this is expecting Query Filters
    showHidden?: any;
    scope?: any

    /**
     * Function called when execution succeeds. Will be called with one argument:
     * * **measures**: an array of [[Measure]] objects.
     */
    success?: Function
}

/**
 * Returns the set of plottable measures found in the current container.
 * @param {IGetMeasuresOptions} options
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
    /**
     * Optional if this measure's axis.timeAxis property is true, ignored otherwise.  Has the following child properties.
     * Either zeroDateCol or ZeroDayVisitTag may be specified, but not both.
     */
    dateOptions?: IDateOptions

    /** Used to pivot a resultset into multiple series.  Generally an augmented [[Dimension]] */
    dimension?: Dimension | IDimensionLike
    filterArray?: Array<QueryFilter>

    /** Generally an augmented [[Measure]] */
    measure: Measure | IMeasureLike

    /** "date" indicates this measure is date-based. "time" indicates it is time-based. */
    time?: any
}

export interface IMeasureLike {
    /**
     * See [[Aggregate]].  Required if a 'dimension' property is specified, ignored otherwise.  Indicates
     * what data should be returned if pivoting by dimension results in multiple underlying values
     * per series data point.
     */
    aggregate?: TAggregate

    /** String. */
    alias: string

    /**
     * Optional, defaults to true.  If true, this measure will be joined to other measures via an outer join, which will allow results
     * from other measures at timepoints not present for this measure (possibly resulting in null/blank values for this measure).  If false, other measures will be inner joined
     * to this measure, which will produce a dataset without null values for this measure, but which may not include all data from joined measures.
     */
    allowNullResults?: boolean

    /** Boolean (default false). Indicates whether the measure is Demographic data. */
    isDemographic?: boolean

    /** The  name of the column containing this measure. */
    name: string

    /** The name of the query containing this measure. */
    queryName: string

    /** The name of the schema containing the query that contains this measure. */
    schemaName: string

    /** The data type of this measure. */
    type: string

    /** Optional.  If provided, results will be filtered to include only the provided values. */
    values?: any
}