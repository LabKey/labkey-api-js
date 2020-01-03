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
/**
 * An interface to describe the shape and fields of a domain.
 */
export interface DomainDesign {
    allowAttachmentProperties?: boolean
    allowFileLinkProperties?: boolean
    allowFlagProperties?: boolean
    container?: string
    /** The unique ID of this domain */
    domainId?: number
    /** The URI of this domain. */
    domainURI?: string
    /** The description of this domain. */
    description?: string
    /**
     * An array of objects that each describe a domain field.  Each object has the following properties:
     * - propertyId : The unique ID of this field.
     * - propertyURI:</b> The URI of this field. (string)
     * - ontologyURI:</b> The URI of the ontology this field belongs to. (string)
     * - name:</b> The name of this field. (string)
     * - description:</b> The description of this field (may be blank). (string)
     * - rangeURI:</b> The URI for this field's range definition. (string)
     * - conceptURI:</b> The URI of this field's concept. (string)
     * - label:</b> The friendly label for this field. (string)
     * - searchTerms:</b> The search terms for this field. (string)
     * - semanticType:</b> The semantic type of this field. (string)
     * - format:</b> The format string defined for this field. (string)
     * - required:</b> Indicates whether this field is required to have a value (i.e. cannot be null). (boolean)
     * - lookupContainer:</b> If this domain field is a lookup, this holds the container in which to look. (string)
     * - lookupSchema:</b> If this domain field is a lookup, this holds the schema in which to look. (string)
     * - lookupQuery:</b> if this domain field is a lookup, this holds the query in which to look. (string)
     */
    fields?: Array<any>
    /**
     * An array of objects that each designate an index upon the domain.  Each object has the following properties
     * - columnNames : An array of strings, where each string is the name of a domain field that will be an index. (array).
     * - unique : Indicates whether the domain field is allowed to contain any duplicate values. (boolean).
     */
    indices?: Array<any>
    /** The name of this domain. */
    name?: string
    queryName?: string              // consider removing, queryName & schemaName may no longer be used
    schemaName?: string
    templateDescription?: string
}

export interface CreateDomainOptions {
    /** The container path in which to create the domain. */
    containerPath?: string
    /** When using a domain template, create the domain.  Defaults to true. */
    createDomain?: boolean
    /** The domain design to save. */
    domainDesign?: DomainDesign
    /** The name of a domain template group. */
    domainGroup?: string
    /** The domain kind to create. One of "IntList", "VarList", "SampleSet", or "DataClass". */
    domainKind?: string
    /** The name of a domain template within the domain group. */
    domainTemplate?: string
    failure?: (error?: any) => any
    /** When using a domain template, import initial data associated in the template.  Defaults to true. */
    importData?: boolean
    /** The domain kind to create. One of "IntList", "VarList", "SampleSet", or "DataClass". */
    kind?: string
    /** The name of a module that contains the domain template group. */
    module?: string
    /** Arguments used to create the specific domain type. */
    options?: any
    success?: (data?: any) => any
    timeout?: number
}

/**
 * Create a new domain with the given kind, domainDesign, and options or
 * specify a [domain template](https://www.labkey.org/Documentation/wiki-page.view?name=domainTemplates)
 * to use for the domain creation. Not all domain kinds can be created through this API.
 * Currently supported domain kinds are: "IntList", "VarList", "SampleSet", "DataClass", "StudyDatasetDate", "StudyDatasetVisit".
 *
 * ```
 * LABKEY.Domain.create({
 *  kind: "IntList",
 *  domainDesign: {
 *      name: "LookupCodes",
 *      description: "integer key list",
 *      fields: [{
 *          name: "id", rangeURI: "int"
 *          },{
 *          name: "code",
 *          rangeURI: "string", scale: 4
 *      }]
 *  },
 *  options: {
 *      keyName: "id"
 *  }
 * });
 * ```
 * Create domain from a [domain template](https://www.labkey.org/Documentation/wiki-page.view?name=domainTemplates)
 * ```
 * LABKEY.Domain.create({
 *  module: "mymodule",
 *  domainGroup: "codes",
 *  domainTemplate: "LookupCodes",
 *  importData: false
 * });
 * ```
 * Import the initial data from the domain template of a previously created domain:
 * ```
 * LABKEY.Domain.create({
 *  module: "mymodule",
 *  domainGroup: "codes",
 *  domainTemplate: "LookupCodes",
 *  createDomain: false,
 *  importData: true
 * });
 * ```
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
    /** The container path in which the requested Domain is defined.
     * If not supplied, the current container path will be used.
     */
    containerPath?: string
    domainDesign?: any              // consider removing, this doesn't appear to be needed
    failure?: (error?: any) => any
    /** The domain query name. */
    queryName: string
    /** The domain schema name. */
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
    /** The container path in which the requested Domain is defined.
     * If not supplied, the current container path will be used.
     */
    containerPath?: string
    failure?: (error?: any) => any
    /** The domain query name. */
    queryName?: string
    /** The domain schema name. */
    schemaName?: string
    /** Id of the domain. This is an alternate way to identify the domain.
     * SchemaName and queryName will be ignored if this value is not undefined or null.
     */
    domainId?: number
    success?: (data?: any) => any
}

/**
 * Gets a domain design.
 *
 * ```
 *  function successHandler(domainDesign){
 *      var html = '';
 *
 *      html += '<b>' + domainDesign.name + ':</b><br> ';
 *      for (var i in domainDesign.fields){
 *          html += '   ' + domainDesign.fields[i].name + '<br>';
 *      }
 *      document.getElementById('testDiv').innerHTML = html;
 *  }
 *
 *  function errorHandler(error){
 *      alert('An error occurred retrieving data: ' + error);
 *  }
 *
 *  LABKEY.Domain.get(successHandler, errorHandler, 'study', 'StudyProperties');
 * ```
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

export interface SaveDomainOptions {
    /**
     * The container path in which the requested Domain is defined.
     * If not supplied, the current container path will be used.
     */
    containerPath?: string
    /** The domain design to save. */
    domainDesign?: any
    failure?: (error?: any) => any
    /** Name of the query. */
    queryName?: string
    /** Name of the schema. */
    schemaName?: string
    /**
     * Id of the domain. This is an alternate way to identify the domain to update.
     * SchemaName and queryName will be ignored if this value is not undefined or null.
     */
    domainId?: number
    success?: (data?: any) => any
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
        containerPath: arguments[5]
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
            domainId: options.domainId
        }
    });
}