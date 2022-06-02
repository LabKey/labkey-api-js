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
import { buildURL } from './ActionURL';
import { request } from './Ajax';
import { getCallbackWrapper, getOnFailure, getOnSuccess, RequestCallbackOptions } from './Utils';
import { insertRows } from './query/Rows';

import { Run, RunGroup } from './Exp';

/** The name of the protocol used by Experiment. This can be used for "protocolName". */
export const SAMPLE_DERIVATION_PROTOCOL = 'Sample Derivation Protocol';
export const SAMPLE_ALIQUOT_PROTOCOL = 'Sample Aliquot Protocol';

/**
 * Several Experiment API endpoints expose optional settings for the ExperimentJSONConverter.
 */
export interface ExperimentJSONConverterOptions {
    /** Include run and step inputs and outputs. */
    includeInputsAndOutputs?: boolean;
    /** Include properties set on the experiment objects. */
    includeProperties?: boolean;
    /** Include run steps. */
    includeRunSteps?: boolean;
}

/**
 * Helper to apply {ExperimentJSONConverterOptions} options to a parameter object.
 * @hidden
 * @private
 */
function applyExperimentJSONConverterOptions(options: ExperimentJSONConverterOptions): any {
    const params: any = {};

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

export interface CreateHiddenRunGroupOptions extends RequestCallbackOptions<RunGroup> {
    /**
     * An alternate container path to get permissions from.
     * If not specified, the current container path will be used.
     */
    containerPath?: string;
    /**
     * An array of integer ids for the runs to be members of the group.
     * Either runIds or selectionKey must be specified.
     */
    runIds?: number[];
    /**
     * The DataRegion's selectionKey to be used to resolve the runs to be members of the group.
     * Either runIds or selectionKey must be specified.
     */
    selectionKey?: string;
}

/**
 * Create or recycle an existing run group. Run groups are the basis for some operations, like comparing
 * MS2 runs to one another.
 */
export function createHiddenRunGroup(options: CreateHiddenRunGroupOptions): XMLHttpRequest {
    const jsonData: any = {};

    if (options.runIds && options.selectionKey) {
        throw 'Only one of runIds or selectionKey config parameter is allowed for a single call.';
    } else if (options.runIds) {
        jsonData.runIds = options.runIds;
    } else if (options.selectionKey) {
        jsonData.selectionKey = options.selectionKey;
    } else {
        throw 'Either the runIds or the selectionKey config parameter is required';
    }

    return request({
        url: buildURL('experiment', 'createHiddenRunGroup.api', options.containerPath),
        method: 'POST',
        jsonData,
        success: getCallbackWrapper<RunGroup>(getOnSuccess(options), options.scope, false, json => new RunGroup(json)),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
    });
}

/**
 * @hidden
 * @private
 */
function createRunGroups(json: any): RunGroup[] {
    const batches: RunGroup[] = [];
    if (json.batches) {
        for (let i = 0; i < json.batches.length; i++) {
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
    const runs: Run[] = [];
    if (json.runs) {
        for (let i = 0; i < json.runs.length; i++) {
            runs.push(new Run(json.runs[i]));
        }
    }
    return runs;
}

/**
 * @hidden
 * @ignore
 */
export function exportRuns(config: any) {
    // TODO: This needs to use DOMWrapper or be removed
    throw new Error('dom/Experiment.js required');
}

export interface BaseSaveBatchOptions {
    /** The assay protocol id. */
    assayId: number;
    /** The name of the assay. */
    assayName?: string;
    /**
     * Save batch(es) to a specific container. If not specified, the batch(es) will be saved
     * to the current container.
     */
    containerPath?: string;
    /**
     * Optional protocol name to be used for non-assay backed runs. Currently only SAMPLE_DERIVATION_PROTOCOL
     * is supported.
     */
    protocolName?: string;
    /** The assay provider name. */
    providerName?: string;
}

export interface SaveBatchOptions extends BaseSaveBatchOptions, RequestCallbackOptions<RunGroup> {
    /** A modified RunGroup. */
    batch?: RunGroup;
}

export interface SaveBatchesOptions extends BaseSaveBatchOptions, RequestCallbackOptions<RunGroup[]> {
    /** The modified RunGroups. */
    batches?: RunGroup[];
}

export interface LineageEdge {
    lsid: string;
    role: string;
}

export interface LineagePKFilter {
    fieldKey: string;
    value: any;
}

export interface LineageItemBase {
    container: string;
    cpasType?: string;
    created: string;
    createdBy: string;
    expType: string;
    id: number;
    lsid: string;
    modified: string;
    modifiedBy: string;
    name: string;
    pkFilters: LineagePKFilter[];
    queryName: string;
    schemaName: string;
    type?: string;
    url?: string;
}

export interface LineageIOConfig {
    dataInputs?: LineageItemBase[];
    dataOutputs?: LineageItemBase[];
    materialInputs?: LineageItemBase[];
    materialOutputs?: LineageItemBase[];
}

export interface LineageRunStepBase {
    activityDate: string;
    activitySequence: number;
    applicationType: string;
    protocol: LineageItemBase;
}

export type LineageRunStep = LineageItemBase & LineageIOConfig & LineageRunStepBase;

export interface LineageNodeBase {
    absolutePath: string;
    children: LineageEdge[];
    dataFileURL: string;
    distance: number;
    listURL: string;
    parents: LineageEdge[];
    pipelinePath: string;
    properties: any;
    steps?: LineageRunStep[];
}

export type LineageNode = LineageItemBase & LineageIOConfig & LineageNodeBase;

export interface LineageResponse {
    /** Object containing all lineage nodes in this lineage result. Keyed by node LSID. */
    nodes: { [lsid: string]: LineageNode };
    /**
     * When request is made with "lsid" option the response will include a singular "seed".
     * @deprecated since 19.3. Use "seeds" instead.
     */
    seed: string;
    /** LSID "seeds" for this lineage result. */
    seeds: string[];
}

export interface LineageOptions extends ExperimentJSONConverterOptions, RequestCallbackOptions<LineageResponse> {
    /** Include children in the lineage response. Defaults to true. */
    children?: boolean;
    /**
     * The path to the container in which the LSIDs are defined. If not supplied, the current container's
     * path will be used. All requested LSID's must be defined in the same container. If they are not, then
     * you should consider making separate requests per container.
     */
    containerPath?: string;
    /** Optional LSID of a SampleSet or DataClass to filter the response. Defaults to include all. */
    cpasType?: string;
    /** An optional depth argument. Defaults to include all. */
    depth?: number;
    /**
     * Optional experiment type to filter response -- either "Data", "Material", or "ExperimentRun".
     * Defaults to include all.
     */
    expType?: string;
    /**
     * The LSID for the seed ExpData, ExpMaterials, or ExpRun.
     * @deprecated since 19.3. Use "lsids" instead.
     */
    lsid: string;
    /** Array of LSIDs for the seed ExpData, ExpMaterials, or ExpRun. */
    lsids?: string[];
    /** Include parents in the lineage response. Defaults to true. */
    parents?: boolean;
    /**
     * Optional Exp Run Protocol Lsid to filter response.
     * Defaults to include all.
     */
    runProtocolLsid?: string;
}

/**
 * Get parent/child relationships of ExpData, ExpMaterial, or ExpRun.
 */
export function lineage(options: LineageOptions): XMLHttpRequest {
    const params = Object.assign({}, applyExperimentJSONConverterOptions(options));

    if (options.lsids) {
        params.lsids = options.lsids;
    } else if (options.lsid) {
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
    if (options.runProtocolLsid) {
        params.runProtocolLsid = options.runProtocolLsid;
    }

    return request({
        url: buildURL('experiment', 'lineage.api', options.containerPath),
        params,
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
    });
}

export interface LoadBatchOptions extends RequestCallbackOptions<RunGroup> {
    /** The assay protocol id. */
    assayId: number;
    /** The name of the assay. */
    assayName: string;
    /** The batch id. */
    batchId: number;
    /** Load batch from a specific container. If not specified, the batch will be loaded from the current container. */
    containerPath?: string;
    /**
     * Optional protocol name to be used for non-assay backed runs.
     * Currently only SAMPLE_DERIVATION_PROTOCOL is supported.
     */
    protocolName?: string;
    /** The assay provider name. */
    providerName: string;
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
export function loadBatch(options: LoadBatchOptions): XMLHttpRequest {
    return request({
        url: buildURL('assay', 'getAssayBatch.api', options.containerPath),
        method: 'POST',
        jsonData: {
            assayId: options.assayId,
            assayName: options.assayName,
            batchId: options.batchId,
            protocolName: options.protocolName,
            providerName: options.providerName,
        },
        success: getCallbackWrapper<RunGroup>(
            getOnSuccess(options),
            options.scope,
            false,
            (json: any) => new RunGroup(json.batch)
        ),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
    });
}

export interface LoadBatchesOptions extends RequestCallbackOptions<RunGroup[]> {
    /** The assay protocol id. */
    assayId: number;
    /** The name of the assay. */
    assayName: string;
    /** An Array of batch ids. */
    batchIds: number[];
    /**
     * Load batches from a specific container. If not specified, the batches will be loaded from
     * the current container.
     */
    containerPath?: string;
    /**
     * Optional protocol name to be used for non-assay backed runs. Currently only SAMPLE_DERIVATION_PROTOCOL
     * is supported.
     */
    protocolName?: string;
    /** The assay provider name. */
    providerName: string;
}

/**
 * Loads batches from the server. See the [Module Assay](https://www.labkey.org/Documentation/wiki-page.view?name=moduleassay)
 * documentation for more information.
 */
export function loadBatches(options: LoadBatchesOptions): XMLHttpRequest {
    return request({
        url: buildURL('assay', 'getAssayBatches.api', options.containerPath),
        method: 'POST',
        jsonData: {
            assayId: options.assayId,
            assayName: options.assayName,
            batchIds: options.batchIds,
            protocolName: options.protocolName,
            providerName: options.providerName,
        },
        success: getCallbackWrapper<RunGroup[]>(getOnSuccess(options), options.scope, false, createRunGroups),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
    });
}

export interface LoadRunsOptions extends ExperimentJSONConverterOptions, RequestCallbackOptions<Run[]> {
    /** Load runs from a specific container. If not specified, the runs will be loaded from the current container. */
    containerPath?: string;
    /** An Array of run LSIDs to fetch. */
    lsids?: string[];
    /** An Array of run ids to fetch. */
    runIds?: number[];
}

export function loadRuns(options: LoadRunsOptions): XMLHttpRequest {
    const jsonData = Object.assign({}, applyExperimentJSONConverterOptions(options));

    if (options.runIds) {
        jsonData.runIds = options.runIds;
    }
    if (options.lsids) {
        jsonData.lsids = options.lsids;
    }

    return request({
        url: buildURL('assay', 'getAssayRuns.api', options.containerPath),
        method: 'POST',
        jsonData,
        success: getCallbackWrapper<Run[]>(getOnSuccess(options), options.scope, false, createRuns),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
    });
}

export interface ResolveResponse {
    data: LineageNode[];
}

export interface ResolveOptions extends ExperimentJSONConverterOptions, RequestCallbackOptions<ResolveResponse> {
    /**
     * The path to the container in which the LSIDs are defined. If not supplied, the current container's
     * path will be used. All requested LSID's must be defined in the same container. If they are not, then
     * you should consider making separate requests per container.
     */
    containerPath?: string;
    /** The list of run lsids. */
    lsids?: string[];
}

/** Resolve LSIDs. */
export function resolve(options: ResolveOptions): XMLHttpRequest {
    const params = Object.assign({}, applyExperimentJSONConverterOptions(options));

    if (options.lsids) {
        params.lsids = options.lsids;
    }

    return request({
        url: buildURL('experiment', 'resolve.api', options.containerPath),
        params,
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
    });
}

// formerly, _saveBatches
function requestSaveBatches<SuccessPayload>(
    rawOptions: SaveBatchOptions & SaveBatchesOptions,
    payloadProcessor: (json: any) => SuccessPayload
): XMLHttpRequest {
    return request({
        url: buildURL('assay', 'saveAssayBatch.api', rawOptions.containerPath),
        method: 'POST',
        jsonData: {
            assayId: rawOptions.assayId,
            assayName: rawOptions.assayName,
            batches: rawOptions.batches ? rawOptions.batches : [rawOptions.batch],
            protocolName: rawOptions.protocolName,
            providerName: rawOptions.providerName,
        },
        success: getCallbackWrapper<SuccessPayload>(
            getOnSuccess(rawOptions),
            rawOptions.scope,
            false,
            payloadProcessor
        ),
        failure: getCallbackWrapper(getOnFailure(rawOptions), rawOptions.scope, true),
    });
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
export function saveBatch(options: SaveBatchOptions): XMLHttpRequest {
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
export function saveBatches(options: SaveBatchesOptions): XMLHttpRequest {
    return requestSaveBatches<RunGroup[]>(options as any, createRunGroups);
}

export interface SaveMaterialsOptions extends RequestCallbackOptions {
    /** An array of LABKEY.Exp.Material objects to be saved. */
    materials: any;
    /** Name of the sample set. */
    name: string;
}

/** Saves materials. */
export function saveMaterials(options: SaveMaterialsOptions): XMLHttpRequest {
    return insertRows({
        schemaName: 'Samples',
        queryName: options.name,
        rows: options.materials,
        success: getOnSuccess(options),
        failure: getOnFailure(options),
        scope: options.scope,
    });
}

export interface SaveRunsOptions extends RequestCallbackOptions {
    /** The assay protocol id. */
    assayId?: number;
    /** The name of the assay. */
    assayName?: string;
    /** Save runs to a specific container. If not specified, the runs will be saved to the current container. */
    containerPath?: string;
    /**
     * Protocol name to be used for non-assay backed runs. Currently only SAMPLE_DERIVATION_PROTOCOL
     * is supported.
     */
    protocolName?: string;
    /** The assay provider name. */
    providerName?: string;
    /** The runs to be saved. */
    runs: any; // TODO: What is this type? Likely too strict to have Array<Run> as "Run-like" objects are also accepted.
}

/** Save modified runs. */
export function saveRuns(options: SaveRunsOptions): XMLHttpRequest {
    return request({
        url: buildURL('assay', 'saveAssayRuns.api', options.containerPath),
        method: 'POST',
        jsonData: {
            assayId: options.assayId,
            assayName: options.assayName,
            protocolName: options.protocolName,
            providerName: options.providerName,
            runs: options.runs,
        },
        success: getCallbackWrapper<Run[]>(getOnSuccess(options), options.scope, false, createRuns),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
    });
}

export interface GenIdActionsOptions extends RequestCallbackOptions {
    containerPath?: string;
    genId?: number;
    kindName: 'SampleSet' | 'DataClass';
    rowId: number;
}
/**
 * Set the current genId sequence value for the data type (sampleset or dataclass)
 */
export function setGenId(config: GenIdActionsOptions): XMLHttpRequest {
    return request({
        url: buildURL('experiment', 'setGenId.api', config.containerPath),
        method: 'POST',
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
        jsonData: {
            rowId: config.rowId,
            kindName: config.kindName,
            genId: config.genId,
        },
    });
}

/**
 * Get the current genId for the data type (sampleset or dataclass)
 */
export function getGenId(config: GenIdActionsOptions): XMLHttpRequest {
    return request({
        url: buildURL('experiment', 'getGenId.api', config.containerPath),
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
        params: {
            rowId: config.rowId,
            kindName: config.kindName,
        },
    });
}
