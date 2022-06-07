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
import { request, RequestOptions } from './Ajax';
import {
    encode,
    ExtendedXMLHttpRequest,
    getCallbackWrapper,
    getOnFailure,
    getOnSuccess,
    isObject,
    isString,
    RequestCallbackOptions,
    RequestFailure,
} from './Utils';

export interface IGetFileStatusOptions {
    /** The container in which to make the request (defaults to current container) */
    containerPath?: string;
    /** This will be called upon failure to complete a request. */
    failure?: RequestFailure;
    /** names of the file within the subdirectory described by the path property */
    files: string[];
    /** relative path from the folder's pipeline root */
    path: string;
    /** name of the analysis protocol */
    protocolName: string;
    /** A scoping object for the success and failure callback functions (default to this). */
    scope?: any;
    /**
     * The function to call with the resulting information.
     * This function will be passed two arguments, a list of file status objects (described below) and the
     * name of the action that would be performed on the files if the user initiated processing
     * ('Retry' or 'Analyze', for example).
     * - name: name of the file, a String.
     * - status: status of the file, a String
     */
    success?: (files: any[], submitType: any, request: ExtendedXMLHttpRequest, config: RequestOptions) => any;
    /** Identifier for the pipeline. */
    taskId: string;
}

/**
 * Gets the status of analysis using a particular protocol for a particular pipeline.
 */
export function getFileStatus(config: IGetFileStatusOptions): XMLHttpRequest {
    const onSuccess = getOnSuccess(config);

    return request({
        url: buildURL('pipeline-analysis', 'getFileStatus.api', config.containerPath),
        method: 'POST',
        params: {
            file: config.files,
            path: config.path,
            protocolName: config.protocolName,
            taskId: config.taskId,
        },
        success: getCallbackWrapper(function (data: any, response: ExtendedXMLHttpRequest, options: RequestOptions) {
            if (onSuccess) {
                onSuccess.call(this, data.files, data.submitType, response, options);
            }
        }, config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
        timeout: 60000000,
    });
}

export interface PipelineContainerResponse {
    /**
     * The container path in which the pipeline is defined.
     * If no pipeline has been defined in this container hierarchy, then the value of this property will be null.
     */
    containerPath: string;
    /** the WebDavURL for the pipeline root. */
    webDavURL: string;
}

export interface IGetPipelineContainerOptions extends RequestCallbackOptions<PipelineContainerResponse> {
    /** The container in which to make the request (defaults to current container) */
    containerPath?: string;
}

/**
 * Gets the container in which the pipeline for this container is defined. This may be the
 * container in which the request was made, or a parent container if the pipeline was defined
 * there.
 */
export function getPipelineContainer(config: IGetPipelineContainerOptions): XMLHttpRequest {
    return request({
        url: buildURL('pipeline', 'getPipelineContainer.api', config.containerPath),
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
    });
}

export interface IGetProtocolsOptions {
    /** The container in which to make the request (defaults to current container) */
    containerPath?: string;
    /** This will be called upon failure to complete a request. */
    failure?: RequestFailure;
    /** If true, protocols from workbooks under the selected container will also be included */
    includeWorkbooks?: boolean;
    /** relative path from the folder's pipeline root */
    path: string;
    /** A scoping object for the success and failure callback functions (default to this). */
    scope?: any;
    /**
     * The function to call with the resulting information.
     * This function will be passed a list of protocol objects, which will have the following properties:
     * - name: name of the saved protocol.
     * - description: description of the saved protocol, if provided.
     * - xmlParameters: bioml representation of the parameters defined by this protocol.
     * - jsonParameters: JSON representation of the parameters defined by this protocol.
     * - containerPath: The container path where this protocol was saved
     */
    success?: (
        protocols: any[],
        defaultProtocolName: string,
        request: ExtendedXMLHttpRequest,
        config: RequestOptions
    ) => any;
    /** Identifier for the pipeline. */
    taskId: string;
}

/**
 * Gets the protocols that have been saved for a particular pipeline.
 */
export function getProtocols(config: IGetProtocolsOptions): XMLHttpRequest {
    const onSuccess = getOnSuccess(config);

    return request({
        url: buildURL('pipeline-analysis', 'getSavedProtocols.api', config.containerPath),
        method: 'POST',
        params: {
            includeWorkbooks: !!config.includeWorkbooks,
            path: config.path,
            taskId: config.taskId,
        },
        success: getCallbackWrapper(function (data: any, response: ExtendedXMLHttpRequest, options: RequestOptions) {
            if (onSuccess) {
                onSuccess.call(this, data.protocols, data.defaultProtocolName, response, options);
            }
        }, config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
    });
}

export interface IStartAnalysisOptions extends RequestCallbackOptions {
    // optional
    allowNonExistentFiles?: boolean;
    /** The container in which to make the request (defaults to current container) */
    containerPath?: string;
    /**
     * Data IDs of files to be used as inputs for this pipeline. These correspond to the rowIds from
     * the table ext.data. They do not need to be located within the file path provided. The user does need read
     * access to the container associated with each file.
     */
    fileIds: number[];
    /** names of the file within the subdirectory described by the path property */
    files: string[];
    /**
     * JSON representation of the protocol description. Not allowed
     * if a protocol with the same name has already been saved. If no protocol with the same name exists, either
     * this property or xmlParameters must be specified.
     */
    jsonParameters?: any;

    /** relative path from the folder's pipeline root */
    path: string;
    /** description displayed in the pipeline */
    pipelineDescription?: string;
    /** description of the analysis protocol */
    protocolDescription?: string;
    /** name of the analysis protocol */
    protocolName: string;
    /**
     * if no protocol with this name already exists, whether or not to save
     * this protocol definition for future use. Defaults to true.
     */
    saveProtocol?: string;
    /** taskId Identifier for the pipeline. */
    taskId: string;
    /**
     * XML representation of the protocol description. Not allowed
     * if a protocol with the same name has already been saved. If no protocol with the same name exists, either
     * this property or jsonParameters must be specified.
     */
    xmlParameters?: string;
}

export interface IStartAnalysisParams {
    allowNonExistentFiles?: boolean;
    /**
     * JSON representation of the protocol description. Not allowed
     * if a protocol with the same name has already been saved. If no protocol with the same name exists, either
     * this property or xmlParameters must be specified.
     */
    configureJson?: any;
    /**
     * XML representation of the protocol description. Not allowed
     * if a protocol with the same name has already been saved. If no protocol with the same name exists, either
     * this property or jsonParameters must be specified.
     */
    configureXml?: string;
    /** names of the file within the subdirectory described by the path property */
    file?: string[];
    /**
     * Data IDs of files be to used as inputs for this pipeline. These correspond to the rowIds from the
     * table ext.data. They do not need to be located within the file path provided. The user does need read
     * access to the container associated with each file.
     */
    fileIds?: number[];
    /** relative path from the folder's pipeline root */
    path?: string;
    /** description displayed in the pipeline */
    pipelineDescription?: string;
    /** description of the analysis protocol */
    protocolDescription?: string;
    /** name of the analysis protocol */
    protocolName?: string;
    /**
     * if no protocol with this name already exists, whether or not to save
     * this protocol definition for future use. Defaults to true.
     */
    saveProtocol?: string | boolean;
    /** Identifier for the pipeline. */
    taskId?: string;
}

/**
 * Starts analysis of a set of files using a particular protocol definition with a particular pipeline.
 */
export function startAnalysis(config: IStartAnalysisOptions): XMLHttpRequest {
    if (!config.protocolName) {
        throw 'Invalid config, must include protocolName property';
    }

    const params: IStartAnalysisParams = {
        allowNonExistentFiles: config.allowNonExistentFiles,
        file: config.files,
        fileIds: config.fileIds,
        path: config.path,
        pipelineDescription: config.pipelineDescription,
        protocolDescription: config.protocolDescription,
        protocolName: config.protocolName,
        saveProtocol: config.saveProtocol == undefined || config.saveProtocol,
        taskId: config.taskId,
    };

    if (config.xmlParameters) {
        if (isObject(config.xmlParameters))
            throw new Error(
                'The xml configuration is deprecated, please use the jsonParameters option to specify your protocol description.'
            );
        else params.configureXml = config.xmlParameters;
    } else if (config.jsonParameters) {
        params.configureJson = isString(config.jsonParameters) ? config.jsonParameters : encode(config.jsonParameters);
    }

    return request({
        url: buildURL('pipeline-analysis', 'startAnalysis.api', config.containerPath),
        method: 'POST',
        params,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
        timeout: 60000000,
    });
}
