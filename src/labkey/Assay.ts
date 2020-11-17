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
import { buildURL } from './ActionURL';
import { request } from './Ajax';
import { appendFilterParams, IFilter } from './filter/Filter';
import { QueryColumn } from './query/types';
import {
    applyTranslated,
    displayAjaxErrorResponse,
    getCallbackWrapper,
    getOnFailure,
    getOnSuccess,
    merge,
    RequestCallbackOptions,
} from './Utils';

export type GetAssaysParameters = {
    /** Applies a filter to match against only assay designs with the provided "id". */
    id?: number;
    /** Applies a filter to match against only assay designs with the provided "name". */
    name?: string;
    /** Applies a filter to match against only assay designs with the provided "plateEnabled" value. */
    plateEnabled?: boolean;
    /**
     * Applies a filter to match against only assay designs with the provided "status".
     * Supported statuses are "Active" and "Archived".
     */
    status?: string;
    /** Applies a filter to match against only assay designs with the provided "type". */
    type?: string;
};

export interface GetAssaysOptions extends GetAssaysParameters, RequestCallbackOptions<AssayDesign[]> {
    /**
     * The container path in which the requested Assays are defined.
     * If not supplied, the current container path will be used.
     */
    containerPath?: string;
    /** @deprecated Specify any/all parameters directly on GetAssaysOptions instead. */
    parameters?: GetAssaysParameters;
}

export enum AssayLink {
    BATCHES = 'batches',
    BEGIN = 'begin',
    DESIGN_COPY = 'designCopy',
    DESIGN_EDIT = 'designEdit',
    IMPORT = 'import',
    RESULT = 'result',
    RESULTS = 'results',
    RUNS = 'runs',
}

export interface AssayDesign {
    /** The path to the container in which this assay design is saved. */
    containerPath: string;
    /** Contains the assay description. */
    description: string;
    /**
     * An mapped enumeration of domain types to domain names. Useful when attempting to find a domain by type.
     * The value is a domain name which can be used as a key lookup into the "domain" object.
     */
    domainTypes: { [domainType: string]: string };
    /**
     * Map containing name/value pairs. Typically, contains three entries for three domains (batch, run and results).
     * Each domain is associated with an array of objects that each describe a domain field.
     */
    domains: { [domainName: string]: QueryColumn };
    /** The unique ID of the assay. */
    id: number;
    /** The name of the action used for data import. */
    importAction: string;
    /** The name of the controller used for data import. */
    importController: string;
    /** Contains a map of name to URL for this assay design. */
    links: Map<AssayLink, string>;
    /** The name of the assay. */
    name: string;
    /** Contains the plate template name if the assay is plate-based.  Undefined otherwise. */
    plateTemplate?: string;
    /** Indicates whether this is a project-level assay. */
    projectLevel: boolean;
    /** Query schema name of this assay protocol. e.g. 'assay.General.MyAssay' */
    protocolSchemaName: string;
    /** URL for generating an Excel template for importing data into this assay. */
    templateLink: string;
    /** The name of the assay type.  Example:  "ELISpot". */
    type: string;
}

/**
 * @deprecated Use {@link getAssays} instead.
 * Gets all assay designs.
 * @see {@link AssayDesign}
 */
export function getAll(options: GetAssaysOptions): XMLHttpRequest {
    return getAssays(options);
}

/**
 * Gets assay designs available in a folder. Optionally, filter the results based on criteria.
 * #### Examples
 *
 * ```
 * function successHandler(assayArray){
 *  var html = '';
 *  for (var defIndex = 0; defIndex < assayArray.length; defIndex ++){
 *      var definition = assayArray[defIndex ];
 *      html += '<b>' + definition.type + '</b>: '
 *          + definition.name + '<br>';
 *      for (var domain in definition.domains){
 *          html += '   ' + domain + '<br>';
 *          var properties = definition.domains[domain];
 *          for (var propertyIndex = 0; propertyIndex < properties.length; propertyIndex++){
 *              var property = properties[propertyIndex];
 *              html += '      ' + property.name +
 *              	' - ' + property.typeName + '<br>';
 *          }
 *      }
 *  }
 *  document.getElementById('testDiv').innerHTML = html;
 * }
 *
 * function errorHandler(error){
 *  alert('An error occurred retrieving data.');
 * }
 *
 * // Get all assay design of type "General"
 * LABKEY.Assay.getAssays({ success: successHandler, failure: errorHandler, type: 'General' });
 * ```
 * @param options
 * @see {@link AssayDesign}
 */
export function getAssays(options: GetAssaysOptions): XMLHttpRequest {
    moveParameters(options, 'id', 'name', 'plateEnabled', 'status', 'type');

    return request({
        url: buildURL('assay', 'assayList.api', options.containerPath),
        method: 'POST',
        jsonData: options.parameters,
        success: getCallbackWrapper(getOnSuccess(options), options.scope, false, data => data.definitions),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        scope: options.scope || this,
    });
}

export interface GetByIdOptions extends GetAssaysOptions {
    /** Unique integer ID for the assay. */
    id: number;
}

/**
 * @deprecated Use {@link getAssays} instead and specify the `id` option.
 * Gets an assay design by its ID.
 * @see {@link AssayDesign}
 */
export function getById(options: GetByIdOptions): XMLHttpRequest {
    return getAssays(options);
}

export interface GetByNameOptions extends GetAssaysOptions {
    /** String name of the assay. */
    name: string;
}

/**
 * @deprecated Use {@link getAssays} instead and specify the `name` option.
 * Gets an assay design by name.
 * @param options
 * @see {@link AssayDesign}
 */
export function getByName(options: GetByNameOptions): XMLHttpRequest {
    return getAssays(options);
}

export interface GetByTypeOptions extends GetAssaysOptions {
    /** String name of the assay type (e.g. "ELISpot"). */
    type: string;
}

/**
 * @deprecated Use {@link getAssays} instead and specify the `type` option.
 * Gets an assay design by type.
 * @param options
 * @see {@link AssayDesign}
 */
export function getByType(options: GetByTypeOptions): XMLHttpRequest {
    return getAssays(options);
}

export interface GetNAbRunsOptions extends RequestCallbackOptions {
    /** The name of the NAb assay design for which runs are to be retrieved. */
    assayName: string;
    /** Whether neutralization should be calculated on the server. */
    calculateNeut?: boolean;
    /**
     * The path to the container in which the schema and query are defined, if different than the current container.
     * If not supplied, the current container's path will be used.
     */
    containerPath?: string;
    /** Array of objects created by {@link create}. */
    filterArray?: IFilter[];
    /** Whether the parameters used in the neutralization curve fitting calculation
     * should be included in the response.*/
    includeFitParameters?: boolean;
    /** Whether statistics (standard deviation, max, min, etc.) should
     * be returned with calculations and well data.*/
    includeStats?: boolean;
    /** Whether well-level data should be included in the response. */
    includeWells?: boolean;
    /**
     * The maximum number of runs to return from the server (defaults to 100).
     * If you want to return all possible rows, set this config property to -1.
     */
    maxRows?: number;
    /**
     * The index of the first row to return from the server (defaults to 0).
     * Use this along with the maxRows config property to request pages of data.
     */
    offset?: number;
    /**
     * String description of the sort.  It includes the column names
     * listed in the URL of a sorted data region (with an optional minus prefix to indicate
     * descending order). In the case of a multi-column sort, up to three column names can be
     * included, separated by commas.
     */
    sort?: string;
    /**
     * The maximum number of milliseconds to allow for this operation before generating
     * a timeout error (defaults to 30000).
     */
    timeout?: number;
}

/**
 * Select NAb assay data from an assay folder.
 * @param options
 */
export function getNAbRuns(options: GetNAbRunsOptions): XMLHttpRequest {
    const params = merge({}, options);

    if (options.sort) {
        params['query.sort'] = options.sort;
    }
    if (options.offset) {
        params['query.offset'] = options.offset;
    }
    if (options.maxRows) {
        if (options.maxRows < 0) {
            params['query.showRows'] = 'all';
        } else {
            params['query.maxRows'] = options.maxRows;
        }
    }

    return request({
        url: buildURL('nabassay', 'getNabRuns.api', options.containerPath),
        params: appendFilterParams(params, options.filterArray),
        success: getCallbackWrapper(getOnSuccess(options), options.scope, false, data => data.runs),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        timeout: options.timeout,
    });
}

export interface GetStudyNabGraphURLResponse {
    /** IDs of the samples that were successfully graphed. */
    objectIds: any[];
    /** URL of the dilution curve graph. */
    url: string;
}

export interface GetStudyNabGraphURLOptions extends RequestCallbackOptions<GetStudyNabGraphURLResponse> {
    /** The desired title for the chart. Defaults to no title. */
    chartTitle?: string;
    /**
     * The path to the study container containing the NAb summary data, if different than the current container.
     * If not supplied, the current container's path will be used.
     */
    containerPath?: string;
    /** Allowable values are FIVE_PARAMETER, FOUR_PARAMETER, and POLYNOMIAL. Defaults to FIVE_PARAMETER. */
    fitType?: 'FIVE_PARAMETER' | 'FOUR_PARAMETER' | 'POLYNOMIAL';
    /** Desired height of the graph image in pixels. Defaults to 300. */
    height?: number;
    /**
     * The object Ids for the NAb data rows that have been copied to the study.
     * This method will ignore requests to graph any object IDs that the current
     * user does not have permission to view.
     */
    objectIds: Array<string | number>;
    /**
     * The maximum number of milliseconds to allow for this operation before generating
     * a timeout error (defaults to 30000).
     */
    timeout?: number;
    /** Desired width of the graph image in pixels. Defaults to 425. */
    width?: number;
}

/**
 * Retrieve the URL of an image that contains a graph of dilution curves for NAb results that have been copied
 * to a study. Note that this method must be executed against the study folder containing the copied NAb summary data.
 * #### Examples
 *
 * ```
 * <script type="text/javascript">
 *  function showGraph(data){
 *      var el = document.getElementById("graphDiv");
 *      if (data.objectIds && data.objectIds.length > 0)
 *          el.innerHTML = '<img src=\"' + data.url + '\">';
 *      else
 *          el.innerHTML = 'No graph available.  Insufficient permissions, ' + 'or no matching results were found.';
 *  }
 *
 *  function initiateGraph(ids){
 *      LABKEY.Assay.getStudyNabGraphURL({
 *          objectIds: ids,
 *          success: showGraph,
 *          captionColumn: 'VirusName',
 *          chartTitle: 'My NAb Chart',
 *          height: 500,
 *          width: 700,
 *          fitType: 'FOUR_PARAMETER'
 *      });
 *  }
 *
 *  Ext.onReady(initiateGraph([185, 165]));
 * </script>
 * <div id="graphDiv">
 * ```
 * @param options
 */
export function getStudyNabGraphURL(options: GetStudyNabGraphURLOptions): XMLHttpRequest {
    const params: any = {};
    applyTranslated(params, options, { objectIds: 'id' }, true, false);

    return request({
        url: buildURL('nabassay', 'getStudyNabGraphURL.api', options.containerPath),
        params,
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options) || displayAjaxErrorResponse, options.scope, true),
        timeout: options.timeout,
    });
}

export interface GetStudyNabRunsOptions extends RequestCallbackOptions {
    /** Whether neutralization should be calculated on the server. */
    calculateNeut?: boolean;
    /**
     * The path to the study container containing the NAb summary, if different than the current container.
     * If not supplied, the current container's path will be used.
     */
    containerPath?: string;
    /**
     * Whether the parameters used in the neutralization curve fitting calculation should be included
     * in the response.
     */
    includeFitParameters?: boolean;
    /**
     * Whether statistics (standard deviation, max, min, etc.) should be returned with calculations
     * and well data.
     */
    includeStats?: boolean;
    /** Whether well-level data should be included in the response. */
    includeWells?: boolean;
    /** The object Ids for the NAb data rows that have been copied to the study. */
    objectIds: Array<string | number>;
    /**
     * The maximum number of milliseconds to allow for this operation before generating
     * a timeout error (defaults to 30000).
     */
    timeout?: number;
}

/**
 * Select detailed NAb information for runs with summary data that has been linked to a study folder. Note that this
 * method must be executed against the study folder containing the copied NAb summary data.
 * @param options
 */
export function getStudyNabRuns(options: GetStudyNabRunsOptions): XMLHttpRequest {
    return request({
        url: buildURL('nabassay', 'getStudyNabRuns.api', options.containerPath),
        params: merge({}, options),
        success: getCallbackWrapper(getOnSuccess(options), options.scope, false, data => data.runs),
        failure: getCallbackWrapper(getOnFailure(options) || displayAjaxErrorResponse, options.scope, true),
        timeout: options.timeout,
    });
}

/**
 * @hidden
 * @private
 */
function moveParameters(config: any, ...params: string[]): void {
    if (!config.parameters) {
        config.parameters = {};
    }

    for (let i = 0; i < params.length; i++) {
        const param = params[i];
        if (config.hasOwnProperty(param)) {
            config.parameters[param] = config[param];
            delete config[param];
        }
    }
}
