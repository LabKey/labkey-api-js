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
import { request } from './Ajax'
import { encode, getCallbackWrapper, getOnFailure, getOnSuccess, isString } from './Utils'

export interface IGetFileStatusOptions {
    // required
    /** names of the file within the subdirectory described by the path property */
    files: Array<string>
    /** relative path from the folder's pipeline root */
    path: string
    /** name of the analysis protocol */
    protocolName: string
    /** Identifier for the pipeline. */
    taskId: string

    // optional
    /** The container in which to make the request (defaults to current container) */
    containerPath?: string
    /**
     * A function to call if an error occurs. This function
     * will receive one parameter of type object with the following properties:
     * - exception: The exception message.
     */
    failure?: () => any
    includeWorkbooks?: boolean
    /** The scope to use when calling the callbacks (defaults to this). */
    scope?: any
    /**
     * The function to call with the resulting information.
     * This function will be passed two arguments, a list of file status objects (described below) and the
     * name of the action that would be performed on the files if the user initiated processing
     * ('Retry' or 'Analyze', for example).
     * - name: name of the file, a String.
     * - status: status of the file, a String
     */
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
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
        timeout: 60000000
    });
}

export interface IGetPipelineContainerOptions {
    /** The container in which to make the request (defaults to current container) */
    containerPath?: string
    /**
     * A function to call if an error occurs. This function
     * will receive one parameter of type object with the following properties:
     * - exception: The exception message.
     */
    failure?: Function
    /** The scope to use when calling the callbacks (defaults to this). */
    scope?: any
    /**
     * The function to call with the resulting information.
     * This function will be passed a single parameter of type object, which will have the following
     * properties:
     * - containerPath: the container path in which the pipeline is defined. If no pipeline has
     * been defined in this container hierarchy, the value of this property will be null.
     * - webDavURL: the WebDavURL for the pipeline root.
     */
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
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}

export interface IGetProtocolsOptions {
    // required
    /** relative path from the folder's pipeline root */
    path: string
    /** Identifier for the pipeline. */
    taskId: string

    // optional
    /** The container in which to make the request (defaults to current container) */
    containerPath?: string
    /**
     * A function to call if an error occurs. This function
     * will receive one parameter of type object with the following properties:
     * - exception: The exception message.
     */
    failure?: Function
    /** If true, protocols from workbooks under the selected container will also be included */
    includeWorkbooks?: boolean
    /** The scope to use when calling the callbacks (defaults to this). */
    scope?: any
    /**
     * The function to call with the resulting information.
     * This function will be passed a list of protocol objects, which will have the following properties:
     * - name: name of the saved protocol.
     * - description: description of the saved protocol, if provided.
     * - xmlParameters: bioml representation of the parameters defined by this protocol.
     * - jsonParameters: JSON representation of the parameters defined by this protocol.
     * - containerPath: The container path where this protocol was saved
     */
    success?: Function
}

/**
 * Gets the protocols that have been saved for a particular pipeline.
 */
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
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}

export interface IStartAnalysisOptions {
    // required
    /** names of the file within the subdirectory described by the path property */
    files: Array<string>
    /** data IDs of files be to used as inputs for this pipeline.  these correspond to the rowIds from the table ext.data.  they do not need to be located within the file path provided.  the user does need read access to the container associated with each file. */
    fileIds: Array<number>
    /** relative path from the folder's pipeline root */
    path: string
    /** name of the analysis protocol */
    protocolName: string
    /** taskId Identifier for the pipeline. */
    taskId: string

    // optional
    allowNonExistentFiles?: boolean
    /** The container in which to make the request (defaults to current container) */
    containerPath?: string
    /**
     * A function to call if an error occurs. This function
     * will receive one parameter of type object with the following properties:
     * - exception: The exception message.
     */
    failure?: () => any
    /**
     * JSON representation of the protocol description. Not allowed
     * if a protocol with the same name has already been saved. If no protocol with the same name exists, either
     * this property or xmlParameters must be specified.
     */
    jsonParameters?: any
    /** description displayed in the pipeline */
    pipelineDescription?: string
    /** description of the analysis protocol */
    protocolDescription?: string
    /**
     * if no protocol with this name already exists, whether or not to save
     * this protocol definition for future use. Defaults to true.
     */
    saveProtocol?: string
    /** The scope to use when calling the callbacks (defaults to this). */
    scope?: any
    /** A function to call if this operation is successful. */
    success?: () => any
    /**
     * XML representation of the protocol description. Not allowed
     * if a protocol with the same name has already been saved. If no protocol with the same name exists, either
     * this property or jsonParameters must be specified.
     */
    xmlParameters?: string
}

export interface IStartAnalysisParams {
    allowNonExistentFiles?: boolean
    /**
     * JSON representation of the protocol description. Not allowed
     * if a protocol with the same name has already been saved. If no protocol with the same name exists, either
     * this property or xmlParameters must be specified.
     */
    configureJson?: any
    /**
     * XML representation of the protocol description. Not allowed
     * if a protocol with the same name has already been saved. If no protocol with the same name exists, either
     * this property or jsonParameters must be specified.
     */
    configureXml?: string
    /** names of the file within the subdirectory described by the path property */
    file?: Array<string>
    /** data IDs of files be to used as inputs for this pipeline.  these correspond to the rowIds from the table ext.data.  they do not need to be located within the file path provided.  the user does need read access to the container associated with each file. */
    fileIds?: Array<number>
    /** relative path from the folder's pipeline root */
    path?: string
    /** description displayed in the pipeline */
    pipelineDescription?: string
    /** description of the analysis protocol */
    protocolDescription?: string
    /** name of the analysis protocol */
    protocolName?: string
    /**
     * if no protocol with this name already exists, whether or not to save
     * this protocol definition for future use. Defaults to true.
     */
    saveProtocol?: string | boolean
    /** Identifier for the pipeline. */
    taskId?: string
}

/**
 * Starts analysis of a set of files using a particular protocol definition with a particular pipeline.
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
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
        timeout: 60000000
    });
}