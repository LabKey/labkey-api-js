/*
 * Copyright (c) 2018 LabKey Corporation
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
import { ExtendedXMLHttpRequest, getCallbackWrapper, getOnFailure, getOnSuccess } from './Utils'
import { insertRows } from './query/Rows'

import { RunGroup } from './Exp'

export const SAMPLE_DERIVATION_PROTOCOL = 'Sample Derivation Protocol';

type ExperimentFailureCallback = (errorInfo?: any, response?: XMLHttpRequest) => any;
type ExperimentSuccessCallback<T> = (payload?: T, response?: XMLHttpRequest) => any;

export interface ICreateHiddenRunGroupOptions {
    /**
     * An alternate container path to get permissions from. If not specified, the current container path will be used.
     */
    containerPath?: string

    /**
     * A reference to a function to call when an error occurs. This function will be passed the following parameters:
     */
    failure?: ExperimentFailureCallback

    /**
     * An array of integer ids for the runs to be members of the group. Either runIds or selectionKey must be specified.
     */
    runIds?: Array<number>

    /**
     * A scoping object for the success and failure callback functions (default to this).
     */
    scope?: any

    /**
     * The DataRegion's selectionKey to be used to resolve the runs to be members of the group.
     * Either runIds or selectionKey must be specified.
     */
    selectionKey?: string

    /**
     * A reference to a function to call with the API results.
     */
    success: ExperimentSuccessCallback<RunGroup>
}

/**
 * Create or recycle an existing run group. Run groups are the basis for some operations, like comparing
 * MS2 runs to one another.
 */
export function createHiddenRunGroup(options: ICreateHiddenRunGroupOptions): void {

    let jsonData: any = {};

    if (options.runIds && options.selectionKey) {
        throw 'Only one of runIds or selectionKey config parameter is allowed for a single call.';
    }
    else if (options.runIds) {
        jsonData.runIds = options.runIds;
    }
    else if (options.selectionKey) {
        jsonData.selectionKey = options.selectionKey
    }
    else {
        throw 'Either the runIds or the selectionKey config parameter is required';
    }

    // note, does not return request
    request({
        url: buildURL('experiment', 'createHiddenRunGroup.api', options.containerPath),
        method: 'POST',
        jsonData,
        success: getSuccessCallbackWrapper<RunGroup>((json) => {
            return new RunGroup(json);
        }, getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}

function getSuccessCallbackWrapper<SuccessPayload>(
    payloadProcessor: (json: any) => SuccessPayload,
    success: any,
    scope?: any) {

    return getCallbackWrapper((json: any, response: ExtendedXMLHttpRequest) => {
        if (success) {
            success.call(scope || this, payloadProcessor(json), response);
        }
    });
}

export interface IBaseSaveBatchOptions {
    /**
     * The assay protocol id
     */
    assayId: number

    /**
     * The name of the assay.
     */
    assayName?: string

    /**
     * A reference to a function to call when an error occurs. This function will be passed the following parameters:
     */
    failure?: ExperimentFailureCallback

    /**
     * Optional protocol name to be used for non-assay backed runs. Currently only SAMPLE_DERIVATION_PROTOCOL
     * is supported.
     */
    protocolName?: string

    /**
     * The assay provider name.
     */
    providerName?: string

    /**
     * A scoping object for the success and failure callback functions (default to this).
     */
    scope?: any
}

export interface ISaveBatchOptions extends IBaseSaveBatchOptions {
    /**
     * A modified RunGroup.
     */
    batch?: RunGroup

    /**
     * The function to call when loadBatches finishes successfully.
     */
    success?: ExperimentSuccessCallback<RunGroup>
}

export interface ISaveBatchesOptions extends IBaseSaveBatchOptions {
    /**
     * The modified RunGroups.
     */
    batches?: Array<RunGroup>

    /**
     * The function to call when loadBatches finishes successfully.
     */
    success?: ExperimentSuccessCallback<Array<RunGroup>>
}

export interface ILoadBatchOptions {
    /**
     * The assay protocol id.
     */
    assayId: number

    /**
     * The name of the assay.
     */
    assayName: string

    /**
     * The batch id.
     */
    batchId: number

    /**
     * A reference to a function to call when an error occurs. This function will be passed the following parameters:
     */
    failure?: ExperimentFailureCallback

    /**
     * The assay provider name.
     */
    providerName: string

    /**
     * A scoping object for the success and failure callback functions (default to this).
     */
    scope?: any

    /**
     * The function to call when loadBatch finishes successfully.
     */
    success: ExperimentSuccessCallback<RunGroup>
}

/**
 * Loads a batch from the server. See the [Module Assay](https://www.labkey.org/Documentation/wiki-page.view?name=moduleassay)
 * documentation for more information.
 */
export function loadBatch(options: ILoadBatchOptions): void {

    // note, does not return request
    request({
        url: buildURL('assay', 'getAssayBatch.api'),
        method: 'POST',
        jsonData: {
            assayId: options.assayId,
            assayName: options.assayName,
            batchId: options.batchId,
            providerName: options.providerName
        },
        success: getSuccessCallbackWrapper<RunGroup>((json) => {
            return new RunGroup(json.batch);
        }, getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}

export interface ILoadBatchesOptions {
    /**
     * The assay protocol id.
     */
    assayId: number

    /**
     * The name of the assay.
     */
    assayName: string

    /**
     * An Array of batch ids.
     */
    batchIds: Array<number>

    /**
     * A reference to a function to call when an error occurs. This function will be passed the following parameters:
     */
    failure?: ExperimentFailureCallback

    /**
     * The assay provider name.
     */
    providerName: string

    /**
     * A scoping object for the success and failure callback functions (default to this).
     */
    scope?: any

    /**
     * The function to call when loadBatches finishes successfully.
     */
    success: ExperimentSuccessCallback<Array<RunGroup>>
}

/**
 * Loads batches from the server. See the [Module Assay](https://www.labkey.org/Documentation/wiki-page.view?name=moduleassay)
 * documentation for more information.
 */
export function loadBatches(options: ILoadBatchesOptions): void {

    // note, does not return request
    request({
        url: buildURL('assay', 'getAssayBatches.api'),
        method: 'POST',
        jsonData: {
            assayId: options.assayId,
            assayName: options.assayName,
            batchIds: options.batchIds,
            providerName: options.providerName
        },
        success: getSuccessCallbackWrapper<Array<RunGroup>>((json) => {
            let batches: Array<RunGroup> = [];

            if (json.batches) {
                for (let i=0; i < json.batches.length; i++) {
                    batches.push(new RunGroup(json.batches[i]));
                }
            }

            return batches;
        }, getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}

// formerly, _saveBatches
function requestSaveBatches<SuccessPayload>(
    rawOptions: ISaveBatchOptions & ISaveBatchesOptions,
    payloadProcessor: (json: any) => SuccessPayload): void {

    request({
        url: buildURL('assay', 'saveAssayBatch.api'),
        method: 'POST',
        jsonData: {
            assayId: rawOptions.assayId,
            assayName: rawOptions.assayName,
            batches: rawOptions.batches ? rawOptions.batches : [rawOptions.batch],
            protocolName: rawOptions.protocolName,
            providerName: rawOptions.providerName
        },
        success: getSuccessCallbackWrapper<SuccessPayload>(payloadProcessor, getOnSuccess(rawOptions), rawOptions.scope),
        failure: getCallbackWrapper(getOnFailure(rawOptions), rawOptions.scope, true)
    })
}

/**
 * Saves a modified batch. Runs within the batch may refer to existing data and material objects,
 * either inputs or outputs, by ID or LSID. Runs may also define new data and materials objects by not
 * specifying an ID or LSID in their properties. See
 * the [Module Assay](https://www.labkey.org/Documentation/wiki-page.view?name=moduleassay) documentation for
 * more information.
 */
export function saveBatch(options: ISaveBatchOptions): void {
    requestSaveBatches<RunGroup>(options as any, (json: any) => {
        if (json.batches) {
            return new RunGroup(json.batches[0]);
        }
    });
}

/**
 * Saves an array of modified batches. Runs within the batches may refer to existing data and material objects,
 * either inputs or outputs, by ID or LSID. Runs may also define new data and materials objects by not specifying
 * an ID or LSID in their properties. See
 * the [Module Assay](https://www.labkey.org/Documentation/wiki-page.view?name=moduleassay) documentation for
 * more information.
 * @param options
 */
export function saveBatches(options: ISaveBatchesOptions): void {
    requestSaveBatches<Array<RunGroup>>(options as any, (json: any) => {
        let batches = [];
        if (json.batches) {
            for (let i = 0; i < json.batches.length; i++) {
                batches.push(new RunGroup(json.batches[i]));
            }
        }
        return batches;
    });
}

export interface ISaveMaterialsOptions {

    /**
     * The function to call if this function encounters an error.
     */
    failure?: ExperimentFailureCallback

    /**
     * An array of LABKEY.Exp.Material objects to be saved
     */
    materials: any

    /**
     * Name of the sample set
     */
    name: string

    /**
     * A scoping object for the success and error callback functions (default to this).
     */
    scope?: any

    /**
     * The function to call when the function finishes successfully.
     */
    success?: () => any
}

/**
 * Saves materials.
 */
export function saveMaterials(options: ISaveMaterialsOptions): void {
    insertRows({
        schemaName: 'Samples',
        queryName: options.name,
        rows: options.materials,
        success: getOnSuccess(options),
        failure: getOnFailure(options),
        scope: options.scope
    })
}