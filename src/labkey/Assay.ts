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
import { buildURL } from './ActionURL'
import { AjaxHandler, request } from './Ajax'
import { appendFilterParams, IFilter } from './filter/Filter'
import { applyTranslated, displayAjaxErrorResponse, getCallbackWrapper, getOnFailure, getOnSuccess, merge } from './Utils'

/**
 * Gets all assays
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
 * LABKEY.Assay.getAll({success: successHandler, failure: errorHandler});
 * ```
 * @param options
 * @see [[AssayDesign]]
 */
export function getAll(options: IGetAssaysOptions) {

    if (arguments.length > 1) {
        options = {
            success: arguments[0],
            failure: arguments[1],
            parameters: {},
            containerPath: arguments[2]
        };
    }

    getAssays(options);
}

export interface IGetAssaysOptions {
    /**The container path in which the requested Assays are defined.
     * If not supplied, the current container path will be used.*/
    containerPath?: string
    /**Function called when execution of the "getAll" function fails.*/
    failure?: Function
    parameters?: any
    /**The scope to be used for the success and failure callbacks*/
    scope?: any
    /**Function called when the "getAll" function executes successfully.
     * Will be called with the argument: [[AssayDesign]][].*/
    success: ( assays: AssayDesign[] ) => void
}

enum AssayLink {
    BATCHES = 'batches',
    BEGIN = 'begin',
    DESIGN_COPY = 'designCopy',
    DESIGN_EDIT = 'designEdit',
    IMPORT = 'import',
    RESULT = 'result',
    RESULTS = 'results',
    RUNS = 'runs'
}


export interface AssayDesign {
    /** The name of the assay. */
    name: string
    /** The path to the container in which this assay design is saved. */
    containerPath: string;
    /** Contains the assay description. */
    description: string;
    /**
     * Map containing name/value pairs.  Typically contains three entries for three domains (batch, run and results).
     * Each domain is associated with an array of objects that each describe a domain field.
     */
    domains: Map<string, any /*FieldMetaData*/[]>;
    /**
     * An mapped enumeration of domain types to domain names. Useful when attempting to find a domain by type.
     * The value is a domain name which can be used as a key lookup into the "domain" object.
     */
    domainTypes: Map<string, string>;
    /** The unique ID of the assay. */
    id: number;
    /** The name of the action used for data import. */
    importAction: string;
    /** The name of the controller used for data import. */
    importController: string;
    /** Contains a map of name to URL for this assay design. */
    links: Map<AssayLink, string>;
    /** Contains the plate template name if the assay is plate-based.  Undefined otherwise. */
    plateTemplate?: string;
    /** Indicates whether this is a project-level assay. */
    projectLevel: boolean;
    /** Query schema name of this assay protocol. e.g. 'assay.General.MyAssay' */
    protocolSchemaName: string;
    // sampleRuns: List<number>;
    /** URL for generating an Excel template for importing data into this assay. */
    templateLink: string;
    /** The name of the assay type.  Example:  "ELISpot". */
    type: string;
}

/**
 * @hidden
 * @private
 */
function getAssays(options: IGetAssaysOptions): void {

    if (arguments.length > 1) {
        options = {
            success: arguments[0],
            failure: arguments[1],
            parameters: arguments[2],
            containerPath: arguments[3]
        };
    }

    moveParameter(options, 'id');
    moveParameter(options, 'type');
    moveParameter(options, 'name');

    request({
        url: buildURL('assay', 'assayList.api', options.containerPath),
        method: 'POST',
        jsonData: options.parameters,
        success: getSuccessCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        scope: options.scope || this
    });
}

export interface IGetByIdOptions extends IGetAssaysOptions {
    /**Unique integer ID for the assay.*/
    id: number
}

/**
 * Gets an assay by its ID.
 * @param options
 * @see [[AssayDesign]]
 */
export function getById(options: IGetByIdOptions): void {

    let config: IGetAssaysOptions = options;

    if (arguments.length > 1) {
        config = {
            success: arguments[0],
            failure: arguments[1],
            parameters: { id: arguments[2] },
            containerPath: arguments[3]
        };
    }

    moveParameter(config, 'id'); // repeat?
    getAssays(config);
}

export interface IGetByNameOptions extends IGetAssaysOptions {
    /**String name of the assay.*/
    name: string
}

/**
 * Gets an assay by name.
 * @param options
 * @see [[AssayDesign]]
 */
export function getByName(options: IGetByNameOptions): void {

    let config: IGetAssaysOptions = options;

    if (arguments.length > 1) {
        config = {
            success: arguments[0],
            failure: arguments[1],
            parameters: { name: arguments[2] },
            containerPath: arguments[3]
        };
    }

    moveParameter(config, 'name'); // repeat?
    getAssays(config);
}

export interface IGetByTypeOptions extends IGetAssaysOptions {
    /**String name of the assay type.  "ELISpot", for example.*/
    type: string
}

/**
 * Gets an assay by type.
 * @param options
 * @see [[AssayDesign]]
 */
export function getByType(options: IGetByTypeOptions): void {

    let config: IGetAssaysOptions = options;

    if (arguments.length > 1) {
        config = {
            success: arguments[0],
            failure: arguments[1],
            parameters: { type: arguments[2] },
            containerPath: arguments[3]
        };
    }

    moveParameter(config, 'type'); // repeat?
    getAssays(config);
}

export interface IGetNAbRunsOptions {
    /**The name of the NAb assay design for which runs are to be retrieved.*/
    assayName: string
    /**Whether neutralization should be calculated on the server.*/
    calculateNeut?: boolean
    /**The path to the container in which the schema and query are defined,
     * if different than the current container. If not supplied, the current container's path will be used.*/
    containerPath?: string
    /**
     * Function called when execution of the "getNAbRuns" function fails.
     * This function will be called with the following arguments:
     * * errorInfo: an object describing the error with the following fields:
     *   * exception: the exception message
     *   * exceptionClass: the Java class of the exception thrown on the server
     *   * stackTrace: the Java stack trace at the point when the exception occurred
     * * responseObj: the XMLHttpResponseObject instance used to make the AJAX request
     * * options: the options used for the AJAX request
     */
    failure?: (errorInfo: {exception: string, exceptionClass: any, stackTrace: any}, responseObj: object, options: object) => any
    /**Array of objects created by {@link LABKEY.Filter.create}.*/
    filterArray?: Array<IFilter>
    /**Whether the parameters used in the neutralization curve fitting calculation
     * should be included in the response.*/
    includeFitParameters?: boolean
    /**Whether or not statistics (standard deviation, max, min, etc.) should
     * be returned with calculations and well data.*/
    includeStats?: boolean
    /**Whether well-level data should be included in the response.*/
    includeWells?: boolean
    /**The maximum number of runs to return from the server (defaults to 100).
     * If you want to return all possible rows, set this config property to -1.*/
    maxRows?: number
    /**The index of the first row to return from the server (defaults to 0).
     * Use this along with the maxRows config property to request pages of data.*/
    offset?: number
    scope?: any
    /**
     * String description of the sort.  It includes the column names
     * listed in the URL of a sorted data region (with an optional minus prefix to indicate
     * descending order). In the case of a multi-column sort, up to three column names can be
     * included, separated by commas.
     */
    sort?: string
    /**
     * Function called when the "getNAbRuns" function executes successfully.
     * This function will be called with the following arguments:
     * * runs: an array of NAb run objects
     * * options: the options used for the AJAX request
     * * responseObj: the XMLHttpResponseObject instance used to make the AJAX request
     */
    success: Function
    /**The maximum number of milliseconds to allow for this operation before
     * generating a timeout error (defaults to 30000).*/
    timeout?: number
}

/**
 * Select NAb assay data from an assay folder.
 * @param options
 */
export function getNAbRuns(options: IGetNAbRunsOptions): void {

    let params = merge({}, options);

    if (options.sort) {
        params['query.sort'] = options.sort;
    }
    if (options.offset) {
        params['query.offset'] = options.offset;
    }
    if (options.maxRows) {
        if (options.maxRows < 0) {
            params['query.showRows'] = 'all';
        }
        else {
            params['query.maxRows'] = options.maxRows;
        }
    }

    const success = getOnSuccess(options);

    request({
        url: buildURL('nabassay', 'getNabRuns', options.containerPath),
        method: 'GET',
        params: appendFilterParams(params, options.filterArray),
        success: getCallbackWrapper(function(data: any) {
            if (success) {
                success.call(options.scope, data.runs);
            }
        }, this),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        timeout: options.timeout
    });
}

export interface IGetStudyNabGraphURLOptions {
    /**The desired title for the chart. Defaults to no title.*/
    chartTitle?: string
    /**The path to the study container containing the NAb summary data,
     * if different than the current container. If not supplied, the current container's path will be used.*/
    containerPath?: string
    /**
     * Function called when execution of the "getStudyNabGraphURL" function fails.
     * This function will be called with the following arguments:
     * * errorInfo: an object describing the error with the following fields:
     *   * exception: the exception message
     *   * exceptionClass: the Java class of the exception thrown on the server
     *   * stackTrace: the Java stack trace at the point when the exception occurred
     * * responseObj: the XMLHttpResponseObject instance used to make the AJAX request
     * * options: the options used for the AJAX request
     */
    failure?: Function
    /**Allowable values are FIVE_PARAMETER, FOUR_PARAMETER, and POLYNOMIAL.
     * Defaults to FIVE_PARAMETER.*/
    fitType?: 'FIVE_PARAMETER' | 'FOUR_PARAMETER' | 'POLYNOMIAL'
    /**Desired height of the graph image in pixels. Defaults to 300.*/
    height?: number
    /**The object Ids for the NAb data rows that have been copied to the study.
     * This method will ignore requests to graph any object IDs that the current user does not have permission to view.*/
    objectIds: Array<string | number>
    scope?: any
    /**
     * Function called when the "getStudyNabGraphURL" function executes successfully.
     * This function will be called with the following arguments:
     * * result: an object with the following properties:
     *   * url: a string URL of the dilution curve graph.
     *   * objectIds: an array containing the IDs of the samples that were successfully graphed.
     * * responseObj: the XMLHttpResponseObject instance used to make the AJAX request
     * * options: the options used for the AJAX request
     */
    success: Function
    /**The maximum number of milliseconds to allow for this operation before
     * generating a timeout error (defaults to 30000).*/
    timeout?: number
    /**Desired width of the graph image in pixels. Defaults to 425.*/
    width?: number
}

/**
 * Retrieve the URL of an image that contains a graph of dilution curves for NAb results that have been copied to a study.
 * Note that this method must be executed against the study folder containing the copied NAb summary data.
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
 * @param {IGetStudyNabGraphURLOptions} options
 */
export function getStudyNabGraphURL(options: IGetStudyNabGraphURLOptions): void {

    let params: any = {};
    applyTranslated(params, options, { objectIds: 'id' }, true, false);

    request({
        url: buildURL('nabassay', 'getStudyNabGraphURL'),
        method: 'GET',
        params,
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options) || displayAjaxErrorResponse, options.scope, true),
        timeout: options.timeout
    });
}

export interface IGetStudyNabRunsOptions {
    /**Whether neutralization should be calculated on the server.*/
    calculateNeut?: boolean
    /**The path to the study container containing the NAb summary,
     * if different than the current container. If not supplied, the current container's path will be used.*/
    containerPath?: string
    /**Function called when execution of the "getStudyNabRuns" function fails.
     * This function will be called with the following arguments:
     * * errorInfo: an object describing the error with the following fields:
     *   * exception: the exception message
     *   * exceptionClass: the Java class of the exception thrown on the server
     *   * stackTrace: the Java stack trace at the point when the exception occurred
     * * responseObj: the XMLHttpResponseObject instance used to make the AJAX request
     * * options: the options used for the AJAX request
     */
    failure?: Function
    /**Whether the parameters used in the neutralization curve fitting calculation
     * should be included in the response.*/
    includeFitParameters?: boolean
    /**Whether or not statistics (standard deviation, max, min, etc.) should
     * be returned with calculations and well data.*/
    includeStats?: boolean
    /**Whether well-level data should be included in the response.*/
    includeWells?: boolean
    /**The object Ids for the NAb data rows that have been copied to the study.*/
    objectIds: Array<string | number>
    scope?: any
    /**
     * Function called when the "getStudyNabRuns" function executes successfully.
     * This function will be called with the following arguments:
     * * runs: an array of NAb run objects
     */
    success: Function
    /**The maximum number of milliseconds to allow for this operation before
     * generating a timeout error (defaults to 30000).*/
    timeout?: number
}

/**
 * Select detailed NAb information for runs with summary data that has been copied to a study folder. Note that this
 * method must be executed against the study folder containing the copied NAb summary data.
 * @param options
 */
export function getStudyNabRuns(options: IGetStudyNabRunsOptions): void {

    let params = merge({}, options);
    const success = getOnSuccess(options);

    request({
        url: buildURL('nabassay', 'getStudyNabRuns', options.containerPath),
        method: 'GET',
        params,
        success: getCallbackWrapper(function(data: any) {
            if (success) {
                success.call(options.scope, data.runs);
            }
        }, this),
        failure: getCallbackWrapper(getOnFailure(options) || displayAjaxErrorResponse, options.scope, true),
        timeout: options.timeout
    });
}

/**
 * @hidden
 * @private
 */
function getSuccessCallbackWrapper(success: Function, scope: any): AjaxHandler {
    return getCallbackWrapper(function(data: any, response: any) {
        if (success) {
            success.call(this, data.definitions, response);
        }
    }, (scope || this));
}

/**
 * @hidden
 * @private
 */
function moveParameter(config: any, param: any): void {

    if (!config.parameters) {
        config.parameters = {};
    }

    if (config[param]) {
        config.parameters[param] = config[param];
        delete config[param];
    }
}