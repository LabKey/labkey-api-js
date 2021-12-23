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
import {
    getCallbackWrapper,
    getOnFailure,
    getOnSuccess,
    isString,
    RequestCallbackOptions,
} from './Utils'
import { LineageItemBase } from './Experiment';
import { appendFilterParams, IFilter } from './filter/Filter';

// This is effectively GWTDomain
/**
 * An interface to describe the shape and fields of a domain.
 */
export interface DomainDesign {
    allowAttachmentProperties?: boolean
    allowFileLinkProperties?: boolean
    allowFlagProperties?: boolean
    container?: string
    defaultDefaultValueType?: string
    defaultValueOptions?: string[]
    /** The unique ID of this domain */
    domainId?: number
    /** The URI of this domain. */
    domainURI?: string
    /** The description of this domain. */
    description?: string
    /**
     * An array of objects that each describe a domain field.  Each object has the following properties:
     * - conceptURI:</b> The URI of this field's concept. (string)
     * - description:</b> The description of this field (may be blank). (string)
     * - format:</b> The format string defined for this field. (string)
     * - label:</b> The friendly label for this field. (string)
     * - lookupContainer:</b> If this domain field is a lookup, this holds the container in which to look. (string)
     * - lookupSchema:</b> If this domain field is a lookup, this holds the schema in which to look. (string)
     * - lookupQuery:</b> if this domain field is a lookup, this holds the query in which to look. (string)
     * - name:</b> The name of this field. (string)
     * - propertyId : The unique ID of this field.
     * - propertyURI:</b> The URI of this field. (string)
     * - ontologyURI:</b> The URI of the ontology this field belongs to. (string)
     * - rangeURI:</b> The URI for this field's range definition. Accepted values:
     *   - attachment
     *   - binary
     *   - boolean
     *   - date
     *   - dateTime
     *   - decimal
     *   - double
     *   - fileLink
     *   - float
     *   - int
     *   - long
     *   - multiLine
     *   - Resource
     *   - string
     *   - text-xml
     *   - time
     * - required:</b> Indicates whether this field is required to have a value (i.e. cannot be null). (boolean)
     * - searchTerms:</b> The search terms for this field. (string)
     * - semanticType:</b> The semantic type of this field. (string)
     */
    fields?: any[] // TODO: Convert this into a type "DomainField[]"
    /**
     * An array of objects that each designate an index upon the domain.  Each object has the following properties
     * - columnNames : An array of strings, where each string is the name of a domain field that will be an index. (array).
     * - unique : Indicates whether the domain field is allowed to contain any duplicate values. (boolean).
     */
    indices?: any[]
    instructions?: string
    /** The name of this domain. */
    name?: string
    queryName?: string              // consider removing, queryName & schemaName may no longer be used
    schemaName?: string
    showDefaultValueSettings?: boolean
    templateDescription?: string
}

export interface CreateDomainOptions extends RequestCallbackOptions {
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
    /** When using a domain template, import initial data associated in the template.  Defaults to true. */
    importData?: boolean
    /**
     * The domain kind to create. Currently supported:
     * - DataClass
     * - IntList
     * - SampleSet
     * - StudyDatasetDate
     * - StudyDatasetVisit
     * - VarList
     */
    kind?: string
    /** The name of a module that contains the domain template group. */
    module?: string
    /** Arguments used to create the specific domain type. */
    options?: any
    timeout?: number
}

/**
 * Create a new domain with the given kind, domainDesign, and options or
 * specify a [domain template](https://www.labkey.org/Documentation/wiki-page.view?name=domainTemplates)
 * to use for the domain creation. Not all domain kinds can be created through this API. See {@link CreateDomainOptions.kind}
 * for supported domain kinds.
 *
 * For each domain you can specify each field's metadata. The properties for field's can be found on {@link DomainDesign.fields}.
 *
 * ```js
 * LABKEY.Domain.create({
 *    kind: 'IntList',
 *    domainDesign: {
 *        name: 'LookupCodes',
 *        description: 'integer key list',
 *        fields: [{
 *            name: 'id',
 *            rangeURI: 'int',
 *        },{
 *            name: 'code',
 *            rangeURI: 'string',
 *            scale: 4,
 *        }]
 *    },
 *    // Domain kind specific options
 *    options: {
 *        // These options are specific to an 'IntList'
 *        keyName: 'id',
 *        keyType: 'Integer', // or 'AutoIncrementInteger'
 *    },
 * });
 * ```
 * Create domain from a [domain template](https://www.labkey.org/Documentation/wiki-page.view?name=domainTemplates):
 * ```js
 * LABKEY.Domain.create({
 *    module: 'mymodule',
 *    domainGroup: 'codes',
 *    domainTemplate: 'LookupCodes',
 *    importData: false,
 * });
 * ```
 * Import the initial data from the domain template of a previously created domain:
 * ```js
 * LABKEY.Domain.create({
 *    module: 'mymodule',
 *    domainGroup: 'codes',
 *    domainTemplate: 'LookupCodes',
 *    createDomain: false,
 *    importData: true,
 * });
 * ```
 */
export function create(config: CreateDomainOptions): XMLHttpRequest {

    let options = arguments.length > 1 ? mapCreateArguments(arguments) : config;

    return request({
        url: buildURL('property', 'createDomain.api', options.containerPath),
        method: 'POST',
        jsonData: options,
        success: getCallbackWrapper(getOnSuccess(options), config.scope),
        failure: getCallbackWrapper(getOnFailure(options), config.scope, true)
    });
}

/**
 * @private
 */
function mapCreateArguments(args: IArguments): CreateDomainOptions {

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

export interface DropDomainOptions extends RequestCallbackOptions {
    /**
     * The container path in which the requested Domain is defined.
     * If not supplied, the current container path will be used.
     */
    containerPath?: string
    domainDesign?: any              // consider removing, this doesn't appear to be needed
    /** The domain query name. */
    queryName: string
    /** The domain schema name. */
    schemaName: string
}

/**
 * Delete a domain.
 */
export function drop(config: DropDomainOptions): XMLHttpRequest {

    return request({
        url: buildURL('property', 'deleteDomain.api', config.containerPath),
        method: 'POST',
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
        jsonData: {
            domainDesign: config.domainDesign,
            schemaName: config.schemaName,
            queryName: config.queryName
        }
    });
}

export interface BaseGetDomainOptions {
    /**
     * The container path in which the requested Domain is defined.
     * If not supplied, the current container path will be used.
     */
    containerPath?: string
    /**
     * Id of the domain. This is an alternate way to identify the domain.
     * SchemaName and queryName will be ignored if this value is not undefined or null.
     */
    domainId?: number
    /** The domain query name. */
    queryName?: string
    /** The domain schema name. */
    schemaName?: string
}

export interface GetDomainDetailsResponse {
    domainDesign: DomainDesign
    domainKindName: string
    options?: any
}

export interface GetDomainDetailsOptions extends
    BaseGetDomainOptions, RequestCallbackOptions<GetDomainDetailsResponse> {
    /** The domain kind, used for the create domain case when you want to get the details/options for the given domain kind. */
    domainKind?: string
}

/**
 * Gets a domain design.
 *
 * ```js
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
 *  LABKEY.Domain.getDomainDetails({
 *      schemaName: 'study',
 *      queryName: 'StudyProperties',
 *      success: successHandler,
 *      failure: errorHandler
 *  });
 * ```
 */
export function getDomainDetails(config: GetDomainDetailsOptions): XMLHttpRequest {

    let options: GetDomainDetailsOptions = arguments.length > 1 ? {
        containerPath: arguments[4],
        failure: arguments[1],
        queryName: arguments[3],
        schemaName: arguments[2],
        success: arguments[0]
    } : config;

    return request({
        url: buildURL('property', 'getDomainDetails.api', options.containerPath),
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        params: {
            schemaName: options.schemaName,
            queryName: options.queryName,
            domainId: options.domainId,
            domainKind: options.domainKind
        }
    });
}

export interface GetDomainOptions extends BaseGetDomainOptions, RequestCallbackOptions<DomainDesign> { }

/**
 * Gets a domain design. This is a deprecated. Use [[getDomainDetails]] instead.
 * @deprecated
 */
export function get(config: GetDomainOptions): XMLHttpRequest {
    let options: GetDomainOptions = arguments.length > 1 ? {
        containerPath: arguments[4],
        failure: arguments[1],
        queryName: arguments[3],
        schemaName: arguments[2],
        success: arguments[0]
    } : config;

    return request({
        url: buildURL('property', 'getDomain.api', options.containerPath),
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        params: {
            schemaName: options.schemaName,
            queryName: options.queryName,
            domainId: options.domainId
        }
    });
}

export interface SaveDomainOptions extends RequestCallbackOptions {
    /**
     * The container path in which the requested Domain is defined.
     * If not supplied, the current container path will be used.
     */
    containerPath?: string
    /** The domain design to save. */
    domainDesign?: any
    /**
     * Id of the domain. This is an alternate way to identify the domain to update.
     * SchemaName and queryName will be ignored if this value is not undefined or null.
     */
    domainId?: number
    /** Set to true to prevent save from completing when a server side warning occurs. */
    includeWarnings?: boolean
    /**
     * Domain Kind specific properties. If not supplied, will be ignored.
     * Note: Certain domain kind specific properties are read-only and cannot be updated.
     * Read-only properties for 'IntList' & 'VarList' domain kinds: listId, domainId, keyName, keyType, and lastIndexed.
     */
    options?: any
    /** Name of the query. */
    queryName?: string
    /** Name of the schema. */
    schemaName?: string
}

/**
 * Saves the provided domain design.
 */
export function save(config: SaveDomainOptions): XMLHttpRequest {

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

    return request({
        url: buildURL('property', 'saveDomain.api', options.containerPath),
        method: 'POST',
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
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

export interface ValidateDomainNameExpressionOptions extends CreateDomainOptions {
    includeNamePreview: boolean
}
/**
 * Validate name expression(s) for domain design.
 */
export function validateNameExpressions(config: ValidateDomainNameExpressionOptions): XMLHttpRequest {

    return request({
        url: buildURL('property', 'validateNameExpressions.api', config.containerPath),
        method: 'POST',
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
        jsonData: {
            domainDesign: config.domainDesign,
            options: config.options,
            kind: config.kind
        }
    });
}

/**
 * Get preview name(s) generated from name expressions for domain design.
 */
export function getDomainNamePreviews(config: GetDomainDetailsOptions): XMLHttpRequest {

    return request({
        url: buildURL('property', 'getDomainNamePreviews.api', config.containerPath),
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
        params: {
            schemaName: config.schemaName,
            queryName: config.queryName,
            domainId: config.domainId
        }
    });
}

export interface UpdateDomainParams {
    createFields?: []
    deleteFields?: number[]
    domainId: number
    includeWarnings?: boolean
    updateFields?: []
}

export interface UpdateDomainOptions extends UpdateDomainParams, RequestCallbackOptions {
    containerPath?: string
}

/**
 * Add, update, or delete fields from an existing domain.
 */
export function updateDomain(config: UpdateDomainOptions): XMLHttpRequest {
    const params: UpdateDomainParams = {
        domainId: config.domainId,
        includeWarnings: config.includeWarnings
    };

    if (config.createFields)
        params.createFields = config.createFields;

    if (config.updateFields)
        params.updateFields = config.updateFields;

    if (config.deleteFields)
        params.deleteFields = config.deleteFields;

    return request({
        url: buildURL('property', 'updateDomain.api', config.containerPath),
        method: 'POST',
        jsonData: params,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}

export interface ListDomainsParams {
    domainKinds?: string[]
    includeFields?: boolean
    includeProjectAndShared?: boolean
}

export interface ListDomainsResponse {
    data: DomainDesign[]
    success: boolean
}

export interface ListDomainsOptions extends ListDomainsParams, RequestCallbackOptions<ListDomainsResponse> {
    containerPath?: string
}

/**
 * List domains by domain kind and optionally include the field definitions.
 */
export function listDomains(config: ListDomainsOptions): XMLHttpRequest {
    const params: ListDomainsParams = { };

    if (config.domainKinds)
        params.domainKinds = config.domainKinds;

    if (config.includeFields !== undefined)
        params.includeFields = config.includeFields;

    if (config.includeProjectAndShared !== undefined)
        params.includeProjectAndShared = config.includeProjectAndShared;

    return request({
        url: buildURL('property', 'listDomains.api', config.containerPath),
        params,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}

interface GetPropertiesParams {
    /**
     * Get properties from the given set of domains.
     */
    domainIds?: number[]
    /**
     * Get properties from the given set of domain kinds. For example, "Vocabulary" or "SampleSet"
     */
    domainKinds?: string[]
    /**
     * Get properties matching the query filters.
     * For example, `Filter.create('measure', true)` will find all measure properties.
     */
    filters?: IFilter[]
    maxRows?: number;
    offset?: number;
    /**
     * Get the properties for the property IDs.
     */
    propertyIds?: number[]
    /**
     * Get the properties for the property URIs.
     */
    propertyURIs?: string[]
    /**
     * Get properties that match the search term.  The property `name`, `label`, `description`,
     * and `importAliases` will be considered when searching.
     */
    search?: string;
    /**
     * Property descriptor field to sort the results by.
     * By default, the results will be returned in `propertyId` order.
     */
    sort?: string;
}

export interface GetPropertiesOptions extends GetPropertiesParams, RequestCallbackOptions {
    containerPath?: string
}

/**
 * Find properties that match the criteria.
 */
export function getProperties(config: GetPropertiesOptions): XMLHttpRequest {
    const params: Omit<GetPropertiesParams, "filters"> & { filters?: string[] } = {};

    if (config.domainIds)
        params.domainIds = config.domainIds;

    if (config.domainKinds)
        params.domainKinds = config.domainKinds;

    if (config.filters) {
        // convert the IFilter array into a string array (e.g. ["query.measure~eq=true"] )
        params.filters = config.filters.map(f => f.getURLParameterName('query') + '=' + f.getURLParameterValue());
    }

    if (config.maxRows !== undefined)
        params.maxRows = config.maxRows;

    if (config.offset !== undefined)
        params.offset = config.offset;

    if (config.propertyIds)
        params.propertyIds = config.propertyIds;

    if (config.propertyURIs)
        params.propertyURIs = config.propertyURIs;

    if (config.search)
        params.search = config.search;

    if (config.sort)
        params.sort = config.sort;

    return request({
        url: buildURL('property', 'getProperties.api', config.containerPath),
        method: 'POST',
        jsonData: params,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}

export interface PropertyUsagesParams {
    maxUsageCount?: number
    propertyIds?: number[]
    propertyURIs?: string[]
}

export interface PropertyUsages {
    propertyId: number,
    propertyURI: string,
    usageCount: number,
    objects: LineageItemBase[]
}
export interface PropertyUsagesResponse {
    data: PropertyUsages[]
}

export interface PropertyUsagesOptions extends PropertyUsagesParams, RequestCallbackOptions<PropertyUsages[]> {
    containerPath?: string
}

/**
 * Get usages of one or more properties.  Up to <code>maxUsageCount</code> objects
 * will be included in the response.
 */
export function getPropertyUsages(config: PropertyUsagesOptions): XMLHttpRequest {
    const params: PropertyUsagesParams = { };

    if (config.maxUsageCount !== undefined)
        params.maxUsageCount = config.maxUsageCount;

    if (config.propertyIds)
        params.propertyIds = config.propertyIds;

    if (config.propertyURIs)
        params.propertyURIs = config.propertyURIs;

    return request({
        url: buildURL('property', 'propertyUsages.api', config.containerPath),
        params,
        success: getCallbackWrapper(getOnSuccess(config), config.scope, false, (json: any) => json.data),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    })
}

export enum KINDS {
    DATA_CLASS = 'DataClass',
    INT_LIST = 'IntList',
    SAMPLE_TYPE = 'SampleSet',
    STUDY_DATASET_DATE = 'StudyDatasetDate',
    STUDY_DATASET_VISIT = 'StudyDatasetVisit',
    VAR_LIST = 'VarList',
    UNKNOWN = 'Unknown',
}