/*
 * Copyright (c) 2017-2020 LabKey Corporation
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
import { decode, getCallbackWrapper, getOnFailure, getOnSuccess, RequestCallbackOptions } from './Utils'

export interface CreateSessionsResponse {
    /** Session ID for the created session */
    reportSessionId: string
}

export interface ICreateSessionOptions extends RequestCallbackOptions<CreateSessionsResponse> {
    /** Client supplied identifier returned in a call to getSessions() */
    clientContext: any
    /** The container in which to make the request (defaults to current container) */
    containerPath?: string
}

/**
 * Creates a new report session which can be used across multiple report requests.  For example,
 * this allows an R script to setup an R environment and then use this environment in
 * subsequent R scripts.
 * @param options
 */
export function createSession(options: ICreateSessionOptions): XMLHttpRequest {
    return request({
        url: buildURL('reports', 'createSession.api', options.containerPath),
        method: 'POST',
        jsonData: {
            clientContext: options.clientContext
        },
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}

export interface IDeleteSessionOptions extends RequestCallbackOptions {
    /** The container in which to make the request (defaults to current container) */
    containerPath?: string
    /** reportSessionId Identifier for the report session to delete. */
    reportSessionId: string
}

/**
 * Deletes an underlying report session
 * @param options
 */
export function deleteSession(options: IDeleteSessionOptions): XMLHttpRequest {
    return request({
        url: buildURL('reports', 'deleteSession.api', options.containerPath),
        method: 'POST',
        params: {
            reportSessionId: options.reportSessionId
        },
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}

export interface RequestExecuteResponse {
    /** Information written by the script to the console */
    console: string[]
    /** Any exception thrown by the script that halted execution */
    errors: string[]
    /** Any output parameters (imgout, jsonout, etc) returned by the script */
    outputParams: any[]
}

export interface IRequestExecuteOptions extends RequestCallbackOptions<RequestExecuteResponse> {
    /** The container in which to make the request (defaults to current container) */
    containerPath?: string
    /** The name of the function to execute */
    functionName?: string
    /** An object with properties for input parameters. */
    inputParams?: any
    /** Identifier for the report to execute */
    reportId?: string
    /** name of the report to execute if the id is unknown */
    reportName?: string
    /** Execute within the existing report session. */
    reportSessionId?: string
    queryName?: string
    /** schema to which this report belongs (only used if reportName is used) */
    schemaName?: string
}

export interface IRequestExecuteParams {
    /** The name of the function to execute */
    functionName?: string
    /** Identifier for the report to execute */
    reportId?: string
    /** name of the report to execute if the id is unknown */
    reportName?: string
    /** Execute within the existing report session. */
    reportSessionId?: string
    queryName?: string
    /** schema to which this report belongs (only used if reportName is used) */
    schemaName?: string
}

function requestExecute(options: IRequestExecuteOptions, isReport: boolean): XMLHttpRequest {
    return request({
        url: buildURL('reports', 'execute.api', options.containerPath),
        method: 'POST',
        jsonData: populateParams(options, isReport),
        success: requestExecuteWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}

/**
 * @hidden
 * @private
 */
function requestExecuteWrapper(callback: Function, scope: any): AjaxHandler {
    return getCallbackWrapper(function(data: any, response: any, options: any) {
        // TODO: This could be done with getCallbackWrapper "responseTransformer"
        if (data && data.outputParams) {
            for (let i = 0; i < data.outputParams.length; i++) {
                let param = data.outputParams[i];
                if (param.type == 'json') {
                    param.value = decode(param.value);
                }
            }
        }
        if (callback) {
            // Unfortunately, this callback flips the arguments, otherwise,
            // requestExecuteWrapper() could be replaced by just calling getCallbackWrapper() directly.
            // (data, response, options) -> (data, options, response)
            callback.call(scope || this, data, options, response);
        }
    }, this);
}

export interface IExecuteOptions extends IRequestExecuteOptions {
    /** reportId Identifier for the report to execute */
    reportId: string
    /** name of the report to execute if the id is unknown */
    reportName: string
}

/**
 * Executes a report script
 * @param options
 * @returns {XMLHttpRequest}
 */
export function execute(options: IExecuteOptions): XMLHttpRequest {

    if (!options) {
        throw 'You must supply a config object to call this method.';
    }

    if (!options.reportId && !options.reportName) {
        throw 'You must supply a value for the reportId or reportName config property.';
    }

    return requestExecute(options, true);
}

export interface IExecuteFunctionOptions extends IRequestExecuteOptions {
    functionName: string
}

/**
 * Executes a single method available in the namespace of a previously created session context.
 * @param options
 * @returns {XMLHttpRequest}
 */
export function executeFunction(options: IExecuteFunctionOptions): XMLHttpRequest {

    if (!options) {
        throw 'You must supply a config object to call this method.';
    }

    if (!options.functionName) {
        throw 'You must supply a value for the functionName config property.';
    }

    return requestExecute(options, false);
}

export interface GetSessionsResponse {
    /** Any sessions that have been created by the client */
    reportSessions: any[]
}

export interface IGetSessionsOptions extends RequestCallbackOptions<GetSessionsResponse> {
    /** The container in which to make the request (defaults to current container) */
    containerPath?: string
}

/**
 * Returns a list of report sessions created via createSession
 * @param options
 */
export function getSessions(options: IGetSessionsOptions): XMLHttpRequest {
    return request({
        url: buildURL('reports', 'getSessions.api', options.containerPath),
        method: 'POST',
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}

/**
 * @hidden
 * @private
 */
function populateParams(options: IRequestExecuteOptions, isReport: boolean): IRequestExecuteParams {
    let execParams: any = {};

    // fill in these parameters if we are executing a report
    if (isReport) {
        if (options.reportId) {
            execParams.reportId = options.reportId;
        }

        if (options.reportName) {
            execParams.reportName = options.reportName;
        }

        if (options.schemaName) {
            execParams.schemaName = options.schemaName;
        }

        if (options.queryName) {
            execParams.queryName = options.queryName;
        }
    }
    else {
        if (options.functionName) {
            execParams.functionName = options.functionName;
        }
    }

    // the rest are common
    if (options.reportSessionId) {
        execParams.reportSessionId = options.reportSessionId;
    }

    // bind client input params to our parameter map
    if (options.inputParams) {
        for (let i in options.inputParams) {
            if (options.inputParams.hasOwnProperty(i)) {
                execParams["inputParams[" + i + "]"] = options.inputParams[i];
            }
        }
    }

    return execParams;
}