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
import { getCallbackWrapper, isString } from './Utils'

// This is effectively GWTDomain
export interface DomainDesign {
    allowAttachmentProperties?: boolean
    allowFileLinkProperties?: boolean
    allowFlagProperties?: boolean
    container?: string
    domainId?: number
    domainURI?: string
    description?: string
    fields?: Array<any>
    indices?: Array<any>
    name?: string
    queryName?: string
    schemaName?: string
    templateDescription?: string
}

export interface CreateDomainOptions {
    containerPath?: string
    createDomain?: boolean
    domainDesign?: DomainDesign
    domainGroup?: string
    domainKind?: string
    domainTemplate?: string
    failure?: (error?: any) => any
    importData?: boolean
    kind?: string
    module?: string
    options?: any
    success?: (data?: any) => any
    timeout?: number
}

/**
 * Create a new domain with the given kind, domainDesign, and options or
 * specify a <a href='https://www.labkey.org/home/Documentation/wiki-page.view?name=domainTemplates'>domain template</a>
 * to use for the domain creation. Not all domain kinds can be created through this API.
 * Currently supported domain kinds are: "IntList", "VarList", "SampleSet", "DataClass", "StudyDatasetDate", "StudyDatasetVisit".
 */
export function create(config: CreateDomainOptions): void {

    let options = arguments.length > 1 ? mapCreateArguments(arguments) : config;

    request({
        url: buildURL('property', 'createDomain.api', options.containerPath),
        method: 'POST',
        jsonData: options,
        success: getCallbackWrapper(options.success),
        failure: getCallbackWrapper(options.failure, this, true)
    });
}

/**
 * @private
 */
function mapCreateArguments(args: any): CreateDomainOptions {

    let options: CreateDomainOptions = {
        failure: args[1],
        success: args[0]
    };

    if ((args.length === 4 || args.length === 5) && isString(args[3])) {
        options.containerPath = args[4];
        options.domainGroup = args[2];
        options.domainTemplate = args[3];
    }
    else {
        options.containerPath = args[5];
        options.domainDesign = args[3];
        options.kind = args[2];
        options.options = args[4];
    }

    return options;
}

export interface DropDomainOptions {
    containerPath?: string
    domainDesign?: any
    failure?: (error?: any) => any
    queryName: string
    schemaName: string
    success?: () => any
}

/**
 * Delete a domain.
 */
export function drop(config: DropDomainOptions): void {

    request({
        url: buildURL('property', 'deleteDomain.api', config.containerPath),
        method: 'POST',
        success: getCallbackWrapper(config.success),
        failure: getCallbackWrapper(config.failure, this, true),
        jsonData: {
            domainDesign: config.domainDesign,
            schemaName: config.schemaName,
            queryName: config.queryName
        }
    });
}

export interface GetDomainOptions {
    containerPath?: string
    failure?: (error?: any) => any
    queryName?: string
    schemaName?: string
    domainId?: number
    success?: (data?: any) => any
}

/**
 * Gets a domain design.
 */
export function get(config: GetDomainOptions): void {

    let options: GetDomainOptions = arguments.length > 1 ? {
        containerPath: arguments[4],
        failure: arguments[1],
        queryName: arguments[3],
        schemaName: arguments[2],
        success: arguments[0]
    } : config;

    request({
        url: buildURL('property', 'getDomain.api', options.containerPath),
        method: 'GET',
        success: getCallbackWrapper(options.success),
        failure: getCallbackWrapper(options.failure, this, true),
        params: {
            schemaName: options.schemaName,
            queryName: options.queryName,
            domainId: options.domainId
        }
    });

}

/**
 * Gets a domain design.
 */
export function getDomainDetails(config: GetDomainOptions): void {

    let options: GetDomainOptions = arguments.length > 1 ? {
        containerPath: arguments[4],
        failure: arguments[1],
        queryName: arguments[3],
        schemaName: arguments[2],
        success: arguments[0]
    } : config;

    request({
        url: buildURL('property', 'getDomainDetails.api', options.containerPath),
        method: 'GET',
        success: getCallbackWrapper(options.success),
        failure: getCallbackWrapper(options.failure, this, true),
        params: {
            schemaName: options.schemaName,
            queryName: options.queryName,
            domainId: options.domainId
        }
    });

}

export interface SaveDomainOptions {
    containerPath?: string
    domainDesign?: any
    failure?: (error?: any) => any
    queryName?: string
    schemaName?: string
    domainId?: number
    success?: (data?: any) => any,
    includeWarnings?: boolean,
    options?: any,
}

/**
 * Saves the provided domain design.
 */
export function save(config: SaveDomainOptions): void {

    let options: SaveDomainOptions = arguments.length > 1 ? {
        success: arguments[0],
        failure: arguments[1],
        domainDesign: arguments[2],
        schemaName: arguments[3],
        queryName: arguments[4],
        containerPath: arguments[5],
        includeWarnings: arguments[6],
        options: arguments[7],
    } : config;

    request({
        url: buildURL('property', 'saveDomain.api', options.containerPath),
        method: 'POST',
        success: getCallbackWrapper(options.success),
        failure: getCallbackWrapper(options.failure, this, true),
        jsonData: {
            domainDesign: options.domainDesign,
            schemaName: options.schemaName,
            queryName: options.queryName,
            domainId: options.domainId,
            includeWarnings: options.includeWarnings,
            options: options.options,
        }
    });
}

export const KINDS = {
    DATA_CLASS: 'DataClass',
    INT_LIST: 'IntList',
    SAMPLE_TYPE: 'SampleSet',
    STUDY_DATASET_DATE: 'StudyDatasetDate',
    STUDY_DATASET_VISIT: 'StudyDatasetVisit',
    VAR_LIST: 'VarList',
    UNKNOWN: 'Unknown'
};