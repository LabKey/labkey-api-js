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
import { buildURL } from './ActionURL'
import { AjaxHandler, request } from './Ajax'
import { appendFilterParams, Filter } from './filter/Filter'
import { applyTranslated, displayAjaxErrorResponse, getCallbackWrapper, getOnFailure, getOnSuccess, merge } from './Utils'

/**
 * Gets all assays
 * @param options
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
    containerPath?: string
    failure?: Function
    parameters?: any
    scope?: any
    success?: Function
}

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
        url: buildURL('assay', 'assayList', options.containerPath),
        method: 'POST',
        jsonData: options.parameters,
        success: getSuccessCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true /* isErrorCallback */),
        scope: options.scope || this
    });
}

export interface IGetByIdOptions extends IGetAssaysOptions {
    id: number
}

/**
 * Gets an assay by its ID.
 * @param options
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
    name: string
}

/**
 * Gets an assay by name.
 * @param options
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
    type: string
}

/**
 * Gets an assay by type.
 * @param options
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
    assayName: string
    calculateNeut?: boolean
    containerPath?: string
    failure?: Function
    filterArray?: Array<Filter>
    includeFitParameters?: boolean
    includeStats?: boolean
    includeWells?: boolean
    maxRows?: number
    offset?: number
    scope?: any
    sort?: string
    success: Function
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
        success: getCallbackWrapper((data: any) => {
            if (success) {
                success.call(options.scope, data.runs);
            }
        }, this),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true /* isErrorCallback */),
        timeout: options.timeout
    });
}

export interface IGetStudyNabGraphURLOptions {
    chartTitle?: string
    containerPath?: string
    failure?: Function
    fitType?: 'FIVE_PARAMETER' | 'FOUR_PARAMETER' | 'POLYNOMIAL'
    height?: number
    objectIds: Array<string | number>
    scope?: any
    success: Function
    timeout?: number
    width?: number
}

export function getStudyNabGraphURL(options: IGetStudyNabGraphURLOptions): void {

    let params: any = {};
    applyTranslated(params, options, { objectIds: 'id' }, true /* applyOthers */, false /* applyFunctions */);

    request({
        url: buildURL('nabassay', 'getStudyNabGraphURL'),
        method: 'GET',
        params,
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options) || displayAjaxErrorResponse, options.scope, true /* isErrorCallback */),
        timeout: options.timeout
    });
}

export interface IGetStudyNabRunsOptions {
    calculateNeut?: boolean
    containerPath?: string
    failure?: Function
    includeFitParameters?: boolean
    includeStats?: boolean
    includeWells?: boolean
    objectIds: Array<string | number>
    scope?: any
    success: Function
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

function getSuccessCallbackWrapper(success: Function, scope: any): AjaxHandler {
    return getCallbackWrapper((data: any, response: any) => {
        if (success) {
            success.call(this, data.definitions, response);
        }
    }, (scope || this));
}

function moveParameter(config: any, param: any): void {

    if (!config.parameters) {
        config.parameters = {};
    }

    if (config[param]) {
        config.parameters[param] = config[param];
        delete config[param];
    }
}