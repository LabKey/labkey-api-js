/*
 * Copyright (c) 2019-2020 LabKey Corporation
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
import { request, RequestSuccess } from './Ajax'
import { ExtendedXMLHttpRequest, getCallbackWrapper, getOnFailure, getOnSuccess } from './Utils'
import { insertRows } from './query/Rows'

import { Run, RunGroup } from './Exp'

/**
 * The name of the protocol used by Experiment. This can be used for "protocolName".
 */
export const SAMPLE_DERIVATION_PROTOCOL = 'Sample Derivation Protocol';

/**
 * @hidden
 * @private
 */
type ExperimentFailureCallback = (errorInfo?: any, response?: XMLHttpRequest) => any;

/**
 * @hidden
 * @private
 */
type ExperimentSuccessCallback<T> = (payload?: T, response?: XMLHttpRequest) => any;

/**
 * Several Experiment API endpoints expose optional settings for the ExperimentJSONConverter.
 */
export interface ExperimentJSONConverterOptions {
    /**
     * Include run and step inputs and outputs.
     */
    includeInputsAndOutputs?: boolean

    /**
     * Include properties set on the experiment objects.
     */
    includeProperties?: boolean

    /**
     * Include run steps.
     */
    includeRunSteps?: boolean
}

/**
 * Helper to apply {ExperimentJSONConverterOptions} options to a parameter object.
 * @hidden
 * @private
 */
function applyExperimentJSONConverterOptions(options: ExperimentJSONConverterOptions): any {
    let params: any = {};

    // Consider: strictly checking option type and raising error if it does not match
    if (options.includeInputsAndOutputs !== undefined) {
        params.includeInputsAndOutputs = options.includeInputsAndOutputs;
    }
    if (options.includeProperties !== undefined) {
        params.includeProperties = options.includeProperties;
    }
    if (options.includeRunSteps !== undefined) {
        params.includeRunSteps = options.includeRunSteps;
    }

    return params;
}

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
export function createHiddenRunGroup(options: ICreateHiddenRunGroupOptions): XMLHttpRequest {
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

    return request({
        url: buildURL('experiment', 'createHiddenRunGroup.api', options.containerPath),
        method: 'POST',
        jsonData,
        success: getSuccessCallbackWrapper<RunGroup>((json) => {
            return new RunGroup(json);
        }, getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}

/**
 * @hidden
 * @private
 */
function createRunGroups(json: any): RunGroup[] {
    let batches: RunGroup[] = [];
    if (json.batches) {
        for (let i=0; i < json.batches.length; i++) {
            batches.push(new RunGroup(json.batches[i]));
        }
    }
    return batches;
}

/**
 * @hidden
 * @private
 */
function createRuns(json: any): Run[] {
    let runs: Run[] = [];
    if (json.runs) {
        for (let i = 0; i < json.runs.length; i++) {
            runs.push(new Run(json.runs[i]));
        }
    }
    return runs;
}

/**
 * @hidden
 * @private
 */
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

export interface LineageEdge {
    lsid: string
    role: string
}

export interface LineagePKFilter {
    fieldKey: string
    value: any
}

export interface LineageNode {
    absolutePath: string
    children: LineageEdge[]
    cpasType: string
    created: string
    createdBy: string
    dataFileURL: string
    distance: number
    id: number
    listURL: string
    lsid: string
    modified: string
    modifiedBy: string
    name: string
    parents: LineageEdge[]
    pipelinePath: string
    pkFilters: LineagePKFilter[]
    properties: any
    queryName: string
    schemaName: string
    type: string
    url: string
}

export interface LineageResponse {
    /**
     * Object containing all lineage nodes in this lineage result. Keyed by node LSID.
     */
    nodes: {[lsid:string]: LineageNode}

    /**
     * When request is made with "lsid" option the response will include a singluar "seed".
     * @deprecated since 19.3. Use "seeds" instead.
     */
    seed: string

    /**
     * LSID "seeds" for this lineage result.
     */
    seeds: string[]
}

export interface ILineageOptions extends ExperimentJSONConverterOptions {
    /**
     * Include children in the lineage response. Defaults to true.
     */
    children?: boolean

    /**
     * Optional LSID of a SampleSet or DataClass to filter the response. Defaults to include all.
     */
    cpasType?: string

    /**
     * An optional depth argument.  Defaults to include all.
     */
    depth?: number

    /**
     * Optional experiment type to filter response -- either "Data", "Material", or "ExperimentRun". Defaults to include all.
     */
    expType?: string

    /**
     * A reference to a function to call when an error occurs.
     */
    failure?: ExperimentFailureCallback

    /**
     * The LSID for the seed ExpData, ExpMaterials, or ExpRun.
     * @deprecated since 19.3. Use "lsids" instead.
     */
    lsid: string

    /**
     * Array of LSIDs for the seed ExpData, ExpMaterials, or ExpRun.
     */
    lsids?: string[]

    /**
     * Include parents in the lineage response.  Defaults to true.
     */
    parents?: boolean

    /**
     * A scoping object for the success and failure callback functions (default to this).
     */
    scope?: any

    /**
     * The function to call when lineage finishes successfully.
     */
    success?: RequestSuccess<LineageResponse>
}

/**
 * Get parent/child relationships of ExpData, ExpMaterial, or ExpRun.
 */
export function lineage(options: ILineageOptions): XMLHttpRequest {
    let params = Object.assign({}, applyExperimentJSONConverterOptions(options));

    if (options.lsids) {
        params.lsids = options.lsids;
    }
    else if (options.lsid) {
        // Allow singular 'lsid' for backwards compatibility with <19.3.
        // Response will include a top-level 'seed' instead of 'seeds' property.
        params.lsid = options.lsid;
    }

    if (options.hasOwnProperty('parents')) {
        params.parents = options.parents;
    }
    if (options.hasOwnProperty('children')) {
        params.children = options.children;
    }
    if (options.hasOwnProperty('depth')) {
        params.depth = options.depth;
    }

    if (options.expType) {
        params.expType = options.expType;
    }
    if (options.cpasType) {
        params.cpasType = options.cpasType;
    }

    return request({
        url: buildURL('experiment', 'lineage.api'),
        params,
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });    
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
     * A reference to a function to call when an error occurs.
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
 *
 * #### Examples
 * 
 * ```js
 * LABKEY.Experiment.loadBatch({
 *     protocolName: LABKEY.Experiment.SAMPLE_DERIVATION_PROTOCOL,
 *     batchId: 12
 * });
 * ```
 */
export function loadBatch(options: ILoadBatchOptions): XMLHttpRequest {
    return request({
        url: buildURL('assay', 'getAssayBatch.api'),
        method: 'POST',
        jsonData: {
            assayId: options.assayId,
            assayName: options.assayName,
            batchId: options.batchId,
            protocolName: options.protocolName,
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
     * Optional protocol name to be used for non-assay backed runs. Currently only SAMPLE_DERIVATION_PROTOCOL
     * is supported.
     */
    protocolName?: string

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
export function loadBatches(options: ILoadBatchesOptions): XMLHttpRequest {
    return request({
        url: buildURL('assay', 'getAssayBatches.api'),
        method: 'POST',
        jsonData: {
            assayId: options.assayId,
            assayName: options.assayName,
            batchIds: options.batchIds,
            protocolName: options.protocolName,
            providerName: options.providerName
        },
        success: getSuccessCallbackWrapper<RunGroup[]>(createRunGroups, getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}

export interface ILoadRunsOptions extends ExperimentJSONConverterOptions {
    /**
     * A reference to a function to call when an error occurs. This function will be passed the following parameters:
     */
    failure?: ExperimentFailureCallback

    /**
     * An Array of run LSIDs to fetch.
     */
    lsids?: Array<string>

    /**
     * An Array of run ids to fetch.
     */
    runIds?: Array<number>

    /**
     * A scoping object for the success and failure callback functions (default to this).
     */
    scope?: any

    /**
     * The function to call when loadRuns finishes successfully.
     */
    success: ExperimentSuccessCallback<Array<Run>>
}

export function loadRuns(options: ILoadRunsOptions): XMLHttpRequest {
    let jsonData = Object.assign({}, applyExperimentJSONConverterOptions(options));

    if (options.runIds) {
        jsonData.runIds = options.runIds;
    }
    if (options.lsids) {
        jsonData.lsids = options.lsids;
    }

    return request({
        url: buildURL('assay', 'getAssayRuns.api'),
        method: 'POST',
        jsonData,
        success: getSuccessCallbackWrapper<Run[]>(createRuns, getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}

export interface ResolveResponse {
    data: LineageNode[]
}

export interface IResolveOptions extends ExperimentJSONConverterOptions {
    /**
     * A reference to a function to call when an error occurs.
     */
    failure?: ExperimentFailureCallback

    /**
     * The list of run lsids.
     */
    lsids?: string[]

    /**
     * A scoping object for the success and failure callback functions (default to this).
     */
    scope?: any

    /**
     * The function to call when resolve finishes successfully.
     */
    success: RequestSuccess<ResolveResponse>
}

/**
 * Resolve LSIDs.
 */
export function resolve(options: IResolveOptions): XMLHttpRequest {
    let params = Object.assign({}, applyExperimentJSONConverterOptions(options));

    if (options.lsids) {
        params.lsids = options.lsids;
    }
    
    return request({
        url: buildURL('experiment', 'resolve.api'),
        params,
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}

// formerly, _saveBatches
function requestSaveBatches<SuccessPayload>(
    rawOptions: ISaveBatchOptions & ISaveBatchesOptions,
    payloadProcessor: (json: any) => SuccessPayload): XMLHttpRequest {

    return request({
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
 * @param options
 *
 * #### Examples
 * 
 * ```js
 * LABKEY.Experiment.saveBatch({
 *     protocolName: LABKEY.Experiment.SAMPLE_DERIVATION_PROTOCOL,
 *     batch: {
 *         properties: {
 *             // property URI from a Vocabulary
 *             'urn:lsid:labkey.com:Vocabulary.Folder-114:MyVocab#field1': '123'
 *         },
 *         runs: [{
 *             name: 'two',
 *             properties: {
 *                 // property URI from a Vocabulary
 *                 'urn:lsid:labkey.com:Vocabulary.Folder-114:MyVocab#field1': '123'
 *             }
 *         }]
 *     }
 * });
 * ```
 */
export function saveBatch(options: ISaveBatchOptions): XMLHttpRequest {
    return requestSaveBatches<RunGroup>(options as any, (json: any) => {
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
export function saveBatches(options: ISaveBatchesOptions): XMLHttpRequest {
    return requestSaveBatches<Array<RunGroup>>(options as any, createRunGroups);
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
    success?: RequestSuccess
}

/**
 * Saves materials.
 * @param options
 */
export function saveMaterials(options: ISaveMaterialsOptions): XMLHttpRequest {
    return insertRows({
        schemaName: 'Samples',
        queryName: options.name,
        rows: options.materials,
        success: getOnSuccess(options),
        failure: getOnFailure(options),
        scope: options.scope
    })
}

export interface ISaveRunsOptions {
    /**
     * The assay protocol id.
     */
    assayId?: number

    /**
     * The name of the assay.
     */
    assayName?: string

    /**
     * The function to call if this function encounters an error.
     */
    failure?: ExperimentFailureCallback

    /**
     * Protocol name to be used for non-assay backed runs. Currently only SAMPLE_DERIVATION_PROTOCOL
     * is supported.
     */
    protocolName?: string

    /**
     * The assay provider name.
     */
    providerName?: string

    /**
     * The runs to be saved.
     */
    runs: any // TODO: What is this type? Likely too strict to have Array<Run> as "Run-like" objects are also accepted.

    /**
     * A scoping object for the success and error callback functions (default to this).
     */
    scope?: any

    /**
     * The function to call when the function finishes successfully.
     */
    success?: ExperimentSuccessCallback<Array<Run>>
}

/**
 * Save modified runs.
 */
export function saveRuns(options: ISaveRunsOptions): XMLHttpRequest {
    return request({
        url: buildURL('assay', 'saveAssayRuns.api'),
        method: 'POST',
        jsonData: {
            assayId: options.assayId,
            assayName: options.assayName,
            protocolName: options.protocolName,
            providerName: options.providerName,
            runs: options.runs,
        },
        success: getSuccessCallbackWrapper<Run[]>(createRuns, getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}