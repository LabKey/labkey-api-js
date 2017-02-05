/*
 * Copyright (c) 2016 LabKey Corporation
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
import { decode, getCallbackWrapper, getOnFailure, getOnSuccess } from './Utils'

interface ICreateSessionOptions {
    clientContext: any
    containerPath?: string
    failure?: () => any
    scope?: any
    success?: () => any
}

/**
 * Creates a new report session which can be used across multiple report requests.  For example,
 * this allows an R script to setup an R environment and then use this environment in
 * subsequent R scripts.
 * @param options
 */
export function createSession(options: ICreateSessionOptions): void {

    request({
        url: buildURL('reports', 'createSession', options.containerPath),
        method: 'POST',
        jsonData: {
            clientContext: options.clientContext
        },
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true /* isErrorCallback */)
    });
}

interface IDeleteSessionOptions {
    containerPath?: string
    failure?: () => any
    reportSessionId: string
    scope?: any
    success?: () => any
}

/**
 * Deletes an underlying report session
 * @param options
 */
export function deleteSession(options: IDeleteSessionOptions): void {

    request({
        url: buildURL('reports', 'deleteSession', options.containerPath),
        method: 'POST',
        params: {
            reportSessionId: options.reportSessionId
        },
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true /* isErrorCallback */)
    });
}

interface IRequestExecuteOptions {
    containerPath?: string
    failure?: () => any
    functionName?: string
    inputParams?: any
    reportId?: string
    reportName?: string
    reportSessionId?: string
    queryName?: string
    schemaName?: string
    scope?: any
    success?: () => any
}

interface IRequestExecuteParams {
    functionName?: string
    inputParams?: any
    reportId?: string
    reportName?: string
    reportSessionId?: string
    queryName?: string
    schemaName?: string
}

function requestExecute(options: IRequestExecuteOptions, isReport: boolean): XMLHttpRequest {

    return request({
        url: buildURL('reports', 'execute', options.containerPath),
        method: 'POST',
        jsonData: populateParams(options, isReport),
        success: requestExecuteWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true /* isErrorCallback */)
    });
}

function requestExecuteWrapper(callback: Function, scope: any): AjaxHandler {

    return getCallbackWrapper((data: any, response: any, options: any) => {
        if (data && data.outputParams) {
            for (let i = 0; i < data.outputParams.length; i++) {
                let param = data.outputParams[i];
                if (param.type == 'json') {
                    param.value = decode(param.value);
                }
            }
        }
        if (callback) {
            callback.call(scope || this, data, options, response);
        }
    }, this);
}

interface IExecuteOptions extends IRequestExecuteOptions {
    reportId: string
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

    return requestExecute(options, true /* isReport */);
}

interface IExecuteFunctionOptions extends IRequestExecuteOptions {
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

    return requestExecute(options, false /* isReport */);
}

interface IGetSessionsOptions {
    containerPath?: string
    failure?: () => any
    scope?: any
    success?: () => any
}

/**
 * Returns a list of report sessions created via createSession
 * @param options
 */
export function getSessions(options: IGetSessionsOptions): void {

    request({
        url: buildURL('reports', 'getSessions', options.containerPath),
        method: 'POST',
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true /* isErrorCallback */)
    });
}

function populateParams(options: IRequestExecuteOptions, isReport: boolean): IRequestExecuteParams {
    let execParams: IRequestExecuteParams = {};

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
        execParams.inputParams = {};

        for (let i in options.inputParams) {
            if (options.inputParams.hasOwnProperty(i)) {
                execParams.inputParams[i] = options.inputParams[i];
            }
        }
    }

    return execParams;
}