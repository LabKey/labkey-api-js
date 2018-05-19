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
import { request } from './Ajax'
import { encode, getCallbackWrapper, getOnFailure, getOnSuccess, isString } from './Utils'

export interface IGetFileStatusOptions {
    // required
    files: Array<string>
    path: string
    protocolName: string
    taskId: string

    // optional
    containerPath?: string
    failure?: () => any
    includeWorkbooks?: boolean
    scope?: any
    success?: () => any
}

/**
 * Gets the status of analysis using a particular protocol for a particular pipeline.
 */
export function getFileStatus(config: IGetFileStatusOptions): void {
    let params = {
        taskId: config.taskId,
        path: config.path,
        file: config.files,
        protocolName: config.protocolName
    };

    const onSuccess = getOnSuccess(config);

    // note, it does not return the request
    request({
        url: buildURL('pipeline-analysis', 'getFileStatus.api', config.containerPath),
        method: 'POST',
        params,
        success: getCallbackWrapper((data: any, response: any) => {
            onSuccess.call(this, data.files, data.submitType, response);
        }, config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true /* isErrorCallback */),
        timeout: 60000000
    });
}

export interface IGetPipelineContainerOptions {
    containerPath?: string
    failure?: Function
    scope?: any
    success?: Function
}

/**
 * Gets the container in which the pipeline for this container is defined. This may be the
 * container in which the request was made, or a parent container if the pipeline was defined
 * there.
 * @returns {XMLHttpRequest}
 */
export function getPipelineContainer(config: IGetPipelineContainerOptions): XMLHttpRequest {
    return request({
        url: buildURL('pipeline', 'getPipelineContainer.api', config.containerPath),
        method: 'GET',
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true /* isErrorCallback */)
    });
}

export interface IGetProtocolsOptions {
    // required
    path: string
    taskId: string

    // optional
    containerPath?: string
    failure?: Function
    includeWorkbooks?: boolean
    scope?: any
    success?: Function
}

export function getProtocols(config: IGetProtocolsOptions): void {
    let params = {
        taskId: config.taskId,
        includeWorkbooks: !!config.includeWorkbooks,
        path: config.path
    };

    const onSuccess = getOnSuccess(config);

    // note, it does not return the request
    request({
        url: buildURL('pipeline-analysis', 'getSavedProtocols.api', config.containerPath),
        method: 'POST',
        params,
        success: getCallbackWrapper((data: any, response: any) => {
            onSuccess.call(this, data.protocols, data.defaultProtocolName, response);
        }, config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true /* isErrorCallback */)
    });
}

export interface IStartAnalysisOptions {
    // required
    files: Array<string>
    fileIds: Array<number>
    path: string
    protocolName: string
    taskId: string

    // optional
    allowNonExistentFiles?: boolean
    containerPath?: string
    failure?: () => any
    jsonParameters?: any
    pipelineDescription?: string
    protocolDescription?: string
    saveProtocol?: string
    scope?: any
    success?: () => any
    xmlParameters?: string
}

export interface IStartAnalysisParams {
    allowNonExistentFiles?: boolean
    configureJson?: any
    configureXml?: string
    file?: Array<string>
    fileIds?: Array<number>
    path?: string
    pipelineDescription?: string
    protocolDescription?: string
    protocolName?: string
    saveProtocol?: string | boolean
    taskId?: string
}

/**
 * Starts analysis of a set of files using a particular protocol definition with a particular pipeline.
 * @param config
 */
export function startAnalysis(config: IStartAnalysisOptions): void {
    if (!config.protocolName) {
        throw 'Invalid config, must include protocolName property';
    }

    let params: IStartAnalysisParams = {
        allowNonExistentFiles: config.allowNonExistentFiles,
        file: config.files,
        fileIds: config.fileIds,
        path: config.path,
        pipelineDescription: config.pipelineDescription,
        protocolDescription: config.protocolDescription,
        protocolName: config.protocolName,
        saveProtocol: config.saveProtocol == undefined || config.saveProtocol,
        taskId: config.taskId
    };

    if (config.xmlParameters) {
        if (typeof config.xmlParameters == 'object')
            throw new Error('The xml configuration is deprecated, please user the jsonParameters option to specify your protocol description.');
        else
            params.configureXml = config.xmlParameters;
    }
    else if (config.jsonParameters) {
        params.configureJson = isString(config.jsonParameters) ? config.jsonParameters : encode(config.jsonParameters);
    }

    request({
        url: buildURL('pipeline-analysis', 'startAnalysis.api', config.containerPath),
        method: 'POST',
        params,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true /* isErrorCallback */),
        timeout: 60000000
    });
}