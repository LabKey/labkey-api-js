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

export interface ICreateHiddenRunGroupOptions {
    /**
     * An alternate container path to get permissions from. If not specified, the current container path will be used.
     */
    containerPath?: string

    /**
     * A reference to a function to call when an error occurs. This function will be passed the following parameters:
     */
    failure?: (errorInfo?: any, response?: XMLHttpRequest) => any

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
    success: (runGroup?: RunGroup, response?: XMLHttpRequest) => any
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

    const success = getOnSuccess(options);

    // note, does not return request
    request({
        url: buildURL('experiment', 'createHiddenRunGroup.api', options.containerPath),
        method: 'POST',
        jsonData,
        success: getCallbackWrapper((json: any, response: ExtendedXMLHttpRequest) => {
            if (success) {
                success.call(options.scope || this, new RunGroup(json), response);
            }
        }),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}

export interface ILoadBatchOptions {
    /**
     * The assay protocol id.
     */
    assayId: number;

    /**
     * The name of the assay.
     */
    assayName: string;

    /**
     * The batch id.
     */
    batchId: number;

    /**
     * A reference to a function to call when an error occurs. This function will be passed the following parameters:
     */
    failure?: (errorInfo?: any, response?: XMLHttpRequest) => any

    /**
     * The assay provider name.
     */
    providerName: string;

    /**
     * A scoping object for the success and failure callback functions (default to this).
     */
    scope?: any

    /**
     * The function to call when loadBatch finishes successfully.
     */
    success: (batch?: RunGroup, response?: XMLHttpRequest) => any
}

/**
 * Loads a batch from the server. See the [Module Assay](https://www.labkey.org/Documentation/wiki-page.view?name=moduleassay)
 * documentation for more information.
 */
export function loadBatch(options: ILoadBatchOptions): void {

    const success = getOnSuccess(options);

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
        success: getCallbackWrapper((json: any, response: ExtendedXMLHttpRequest) => {
            if (success) {
                success.call(options.scope || this, new RunGroup(json.batch), response);
            }
        }),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}

export interface ILoadBatchesOptions {
    /**
     * The assay protocol id.
     */
    assayId: number;

    /**
     * The name of the assay.
     */
    assayName: string;

    /**
     * An Array of batch ids.
     */
    batchIds: Array<number>;

    /**
     * A reference to a function to call when an error occurs. This function will be passed the following parameters:
     */
    failure?: (errorInfo?: any, response?: XMLHttpRequest) => any

    /**
     * The assay provider name.
     */
    providerName: string;

    /**
     * A scoping object for the success and failure callback functions (default to this).
     */
    scope?: any

    /**
     * The function to call when loadBatches finishes successfully.
     */
    success: (batches?: Array<RunGroup>, response?: XMLHttpRequest) => any
}

/**
 * Loads batches from the server. See the [Module Assay](https://www.labkey.org/Documentation/wiki-page.view?name=moduleassay)
 * documentation for more information.
 */
export function loadBatches(options: ILoadBatchesOptions): void {

    const success = getOnSuccess(options);

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
        success: getCallbackWrapper((json: any, response: ExtendedXMLHttpRequest) => {
            if (success) {
                let batches: Array<RunGroup> = [];

                if (json.batches) {
                    for (let i=0; i < json.batches.length; i++) {
                        batches.push(new RunGroup(json.batches[i]));
                    }
                }

                success.call(options.scope || this, batches, response);
            }
        }),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}

export interface ISaveMaterialsOptions {

    /**
     * The function to call if this function encounters an error.
     */
    failure?: () => any

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