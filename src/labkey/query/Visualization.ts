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
import { buildURL, getParameters, queryString } from '../ActionURL';
import { request } from '../Ajax';
import { decode, encode, getCallbackWrapper, getOnFailure, getOnSuccess, RequestCallbackOptions } from '../Utils';
import { IFilter as QueryFilter } from '../filter/Filter';

import { Aggregate, Interval, TAggregate, TInterval, Type } from './visualization/constants';
import { Dimension } from './visualization/Dimension';
import * as Filter from './visualization/Filter';
import { MeasureGetDimensionsOptions, Measure } from './visualization/Measure';

export { Aggregate, Dimension, Filter, Interval, MeasureGetDimensionsOptions, Measure, Type };

function createMeasures(json: any): Measure[] {
    const measures = [];
    if (json.measures && json.measures.length) {
        for (let i = 0; i < json.measures.length; i++) {
            measures.push(new Measure(json.measures[i]));
        }
    }

    return measures;
}

function createTypes(json: any): any[] {
    if (json && json.types && json.types.length) {
        // for now just return the raw object array
        return json.types;
    }

    return [];
}

export interface IDateOptions {
    /**
     * A measure object (with properties for name, queryName, and schemaName) of type date specifying the measure date.
     */
    dateCol: Measure | IMeasureLike;

    /**
     * See {@link Interval}.  The type of interval that should be calculated between the measure date and the zero date
     * (if zeroDateCol is specified) or zero day (if zeroDayVisitTag is specified).
     */
    interval?: TInterval;

    /**
     * If true, zeroDayVisitTag uses ParticipantVisit.ProtocolDay to calculate offsets;
     * if false ParticipantVisit.Day is used. Defaults to true.
     */
    useProtocolDay?: boolean;

    /**
     * A measure object (with properties for name, queryName, and schemaName) of type date specifying
     * the zero date, used to align data points in terms of days, weeks, or months.
     */
    zeroDateCol?: Measure | IMeasureLike;

    /** A VisitTag that will be used to find the ParticipantVisit used to align data points. */
    zeroDayVisitTag?: string;
}

export interface IDimensionLike {}

export interface VisualizationGetResponse {
    canDelete: boolean;
    canEdit: boolean;
    canShare: boolean;
    createdBy: number;
    description: string;
    name: string;
    ownerId: any;
    queryName: string;
    reportId: string;
    reportProps: any;
    schemaName: string;
    shared: boolean;
    thumbnailURL: string;
    type: string;
    visualizationConfig: any;
}

export interface IGetOptions extends RequestCallbackOptions<VisualizationGetResponse> {
    name?: string;
    /**
     * Optional, but required if config.schemaName is provided.  Limits the search for
     * the visualization to a specific schema and query.  Note that visualization names are unique within a container
     * (regardless of schema and query), so these additional optional parameters are only useful in a small number of circumstances.
     */
    queryName?: string;

    reportId?: any;

    /**
     * Optional, but required if config.queryName is provided.  Limits the search for
     * the visualization to a specific schema and query.  Note that visualization names are unique within a container
     * (regardless of schema and query), so these additional optional parameters are only useful in a small number of circumstances.
     */
    schemaName?: string;
}

/**
 * Retrieves a saved visualization.  See {@link save}.
 */
export function get(options: IGetOptions): XMLHttpRequest {
    const jsonData = {
        name: options.name,
        reportId: options.reportId,
        queryName: options.queryName,
        schemaName: options.schemaName,
    };

    const processPayload = (json: any) => {
        if (json && json.visualizationConfig) {
            json.visualizationConfig = decode(json.visualizationConfig);
        }
        return json;
    };

    return request({
        url: buildURL('visualization', 'getVisualization.api'),
        method: 'POST',
        initialConfig: options,
        jsonData,
        success: getCallbackWrapper(getOnSuccess(options), options.scope, false, processPayload),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
    });
}

export interface IGetDataOptions extends RequestCallbackOptions {
    containerPath?: string;
    endpoint?: string;
    filterQuery?: string;
    filterUrl?: string;
    groupBys?: any; // TODO: determine type

    /**
     * Default false. If true, all measures will be joined to the first measure
     * in the array instead of to the previous measure.
     */
    joinToFirst?: boolean;
    limit?: any; // TODO: determine type
    measures: IMeasureable[];

    /** Default false. If true, response will no include the actual data rows, just metadata. */
    metaDataOnly?: boolean;
    parameters?: any;

    /** Generally an array of augmented {@link Dimension} or {@link Measure} objects */
    sorts?: Dimension[] | Measure[] | IGetDataSortable[];
}

export interface IGetDataSortable {}

/**
 * Returns a resultset suitable for visualization based on requested measures and dimensions.
 */
export function getData(options: IGetDataOptions): XMLHttpRequest {
    const jsonData: any = {
        measures: [],
        sorts: options.sorts,

        // @deprecated -- created for issue 11627
        // The filterUrl and filterQuery are used in tandem to apply a filter from a URL. Use the filterArray
        // option on each measure to apply filters.
        filterQuery: options.filterQuery, // e.g. 'study.Lab Results'
        filterUrl: options.filterUrl, // e.g. '/labkey/study/StudyFolder/dataset.view?Dataset.Column%7Egt=value'

        limit: options.limit,
        groupBys: options.groupBys,
        metaDataOnly: options.metaDataOnly,

        // specify that all source queries should join back to the first measure
        joinToFirst: options.joinToFirst === true,
    };

    // clone measures
    let filters, m, f, asURL, fa;
    for (m = 0; m < options.measures.length; m++) {
        const c = options.measures[m];

        const measure: IMeasureable = {
            measure: c.measure,
            time: c.time,
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
            for (f = 0; f < measure.filterArray.length; f++) {
                fa = measure.filterArray[f];
                if (fa && fa.getURLParameterName) {
                    asURL =
                        encodeURIComponent(fa.getURLParameterName()) +
                        '=' +
                        encodeURIComponent(fa.getURLParameterValue());
                    filters.push(asURL);
                }
            }

            // TODO: See if we can fix-up typings so this doesn't have to be cast.
            measure.filterArray = filters as any;
        }

        jsonData.measures.push(measure);
    }

    // issue 21418: support for parameterized queries
    const urlParams: any = {};
    if (options.parameters) {
        for (const p in options.parameters) {
            if (options.parameters.hasOwnProperty(p)) {
                urlParams['visualization.param.' + p] = options.parameters[p];
            }
        }
    }

    let url: string;
    if (options.endpoint) {
        url = options.endpoint + '?' + queryString(urlParams);
    } else {
        url = buildURL('visualization', 'getData', options.containerPath, urlParams);
    }

    return request({
        url,
        method: 'POST',
        jsonData,
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
    });
}

export function getDataFilterFromURL(): string {
    return getParameters().filterUrl;
}

/**
 * Retrieves a saved visualization based on identifying parameters found on the current URL.
 * Method returns true or false, depending on whether the URL contains a saved visualization identifier.
 * If true, the success or failure callback function will be called just as with {@link get}. If false, no callbacks
 * will be called. This method allows callers to use a single method to retrieve saved visualizations, regardless
 * of how they are identified on the URL.
 *
 * @returns Indicates whether the current URL includes parameters that identify a saved visualization.
 */
export function getFromUrl(options: RequestCallbackOptions): boolean {
    const params: any = options || {};

    params.success = getOnSuccess(options);
    params.failure = getOnFailure(options);

    const urlParams = getParameters();
    let valid = false;
    if (params.reportId) {
        valid = true;
    } else {
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

export interface IGetMeasuresOptions extends RequestCallbackOptions<{ measures: Measure[] }> {
    allColumns?: any;
    /** Indicates whether date measures should be returned instead of numeric measures. Defaults to false. */
    dateMeasures?: any;
    /** An array of {@link Filter} objects. **/
    filters?: any[]; // TODO: Check if this is expecting Query Filters
    showHidden?: any;
}

/**
 * Returns the set of plottable measures found in the current container.
 * @param {IGetMeasuresOptions} options
 */
export function getMeasures(options: IGetMeasuresOptions): XMLHttpRequest {
    const params: any = {};

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

    return request({
        url: buildURL('visualization', 'getMeasures.api'),
        params,
        success: getCallbackWrapper(getOnSuccess(options), options.scope, false, createMeasures),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
    });
}

export function getTypes(options: RequestCallbackOptions): XMLHttpRequest {
    return request({
        url: buildURL('visualization', 'getVisualizationTypes.api'),
        success: getCallbackWrapper(getOnSuccess(options), options.scope, false, createTypes),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
    });
}

export interface IMeasureable {
    /**
     * Optional if this measure's axis.timeAxis property is true, ignored otherwise.  Has the following child properties.
     * Either zeroDateCol or ZeroDayVisitTag may be specified, but not both.
     */
    dateOptions?: IDateOptions;

    /** Used to pivot a resultset into multiple series.  Generally an augmented {@link Dimension} */
    dimension?: Dimension | IDimensionLike;
    filterArray?: QueryFilter[];

    /** Generally an augmented {@link Measure} */
    measure: Measure | IMeasureLike;

    /** "date" indicates this measure is date-based. "time" indicates it is time-based. */
    time?: any;
}

export interface IMeasureLike {
    /**
     * See {@link Aggregate}.  Required if a 'dimension' property is specified, ignored otherwise.  Indicates
     * what data should be returned if pivoting by dimension results in multiple underlying values
     * per series data point.
     */
    aggregate?: TAggregate;

    /** String. */
    alias: string;

    /**
     * Optional, defaults to true.  If true, this measure will be joined to other measures via an outer join,
     * which will allow results from other measures at timepoints not present for this measure
     * (possibly resulting in null/blank values for this measure).  If false, other measures will be inner
     * joined to this measure, which will produce a dataset without null values for this measure, but which may
     * not include all data from joined measures.
     */
    allowNullResults?: boolean;

    /** Boolean (default false). Indicates whether the measure is Demographic data. */
    isDemographic?: boolean;

    /** The  name of the column containing this measure. */
    name: string;

    /** The name of the query containing this measure. */
    queryName: string;

    /** The name of the schema containing the query that contains this measure. */
    schemaName: string;

    /** The data type of this measure. */
    type: string;

    /** Optional.  If provided, results will be filtered to include only the provided values. */
    values?: any;
}

/**
 * Indicates whether an icon should be auto-generated ('AUTO'), no thumbnail
 * should be saved ('NONE'), or the existing custom thumbnail should be kept ('CUSTOM').
 */
export type IconType = 'AUTO' | 'CUSTOM' | 'NONE';

export interface SaveResponse {
    /** The name of the saved visualization. */
    name: string;
    /** A unique integer identifier for this saved visualization. */
    visualizationId: number;
}

export interface ISaveOptions extends RequestCallbackOptions<SaveResponse> {
    /** A description of the saved report. */
    description?: string;
    /**
     * Indicates whether a icon should be auto-generated ('AUTO'), no icon
     * should be saved ('NONE'), or the existing custom icon should be kept ('CUSTOM').
     */
    iconType?: IconType;
    /** The name this visualization should be saved under. */
    name: string;
    /**
     * Optional, but required if schemaName property is provided.  Allows the visualization to
     * be scoped to a particular query. If scoped, this visualization will appear in the
     * 'views' menu for that query.
     */
    queryName?: string;
    /**
     * Whether this 'save' call should replace an existing report with the same name.
     * If false, the call to 'save' will fail if another report with the same name exists.
     */
    replace?: boolean;
    /**
     * Optional, but required if queryName property is provided.  Allows the visualization to
     * be scoped to a particular query. If scoped, this visualization will appear in the
     * 'views' menu for that query.
     */
    schemaName?: string;
    /**
     * Indicates whether this report is viewable by all users with read
     * permissions to the visualization's folder. If false, only the creating user can see
     * the visualization. Defaults to true.
     */
    shared?: boolean;
    /**
     * SVG to be used to generate a thumbnail.
     */
    svg?: string;
    /**
     * Indicates whether a thumbnail should be auto-generated ('AUTO'), no thumbnail
     * should be saved ('NONE'), or the existing custom thumbnail should be kept ('CUSTOM').
     */
    thumbnailType?: IconType;
    /**
     * The type of visualization being saved. Should be an instance of
     * {@link LABKEY.Query.Visualization.Type}.
     */
    type: string; // TODO: Make "Type" type
    /**
     * An arbitrarily complex JavaScript object that contains all information required to
     * recreate the report.
     */
    visualizationConfig: any;
}

/**
 * Saves a visualization for future use. Saved visualizations appear in the study 'views' webpart. If the
 * visualization is scoped to a specific query, it will also appear in the views menu for that query.
 */
export function save(options: ISaveOptions): XMLHttpRequest {
    const jsonData = {
        description: options.description,
        json: encode(options.visualizationConfig),
        name: options.name,
        replace: options.replace,
        shared: options.shared,
        thumbnailType: options.thumbnailType,
        iconType: options.iconType,
        svg: options.svg,
        type: options.type,
        schemaName: options.schemaName,
        queryName: options.queryName,
    };

    return request({
        url: buildURL('visualization', 'saveVisualization.api'),
        method: 'POST',
        jsonData,
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
    });
}
