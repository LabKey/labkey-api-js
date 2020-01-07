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
import { request } from '../Ajax'
import { buildURL } from '../ActionURL'
import { getOnSuccess, getCallbackWrapper, getOnFailure, isArray } from '../Utils'
import { getServerContext } from '../constants'

export interface CreateContainerOptions {
    /**
     * An alternate container in which to create a new container. If not specified,
     * the current container path will be used.
     */
    containerPath?: string
    /** The description of the container, used primarily for workbooks. */
    description?: string
    /**
     * A reference to a function to call when an error occurs. This
     * function will be passed the following parameters:
     * - errorInfo: an object containing detailed error information (may be null)
     * - response: The XMLHttpResponse object
     */
    failure?: () => any
    /** The name of the folder type to be applied. */
    folderType?: string
    /** Whether this a workbook should be created. Defaults to false. */
    isWorkbook?: boolean
    /** Required for projects or folders. The name of the container. */
    name?: string
    /** A scoping object for the success and error callback functions (default to this). */
    scope?: any
    /**
     * A reference to a function to call with the API results. This
     * function will be passed the following parameters:
     * - containersInfo: an object with the following properties:
     *     - id: the id of the requested container
     *     - name: the name of the requested container
     *     - path: the path of the requested container
     *     - sortOrder: the relative sort order of the requested container
     *     - description: an optional description for the container (may be null or missing)
     *     - title: an optional non-unique title for the container (may be null or missing)
     *     - isWorkbook: true if this container is a workbook. Workbooks do not appear in the left-hand project tree.
     *     - effectivePermissions: An array of effective permission unique names the group has.
     * - response: The XMLHttpResponse object
     */
    success?: () => any
    /** The title of the container, used primarily for workbooks. */
    title?: string
}

/**
 * Creates a new container, which may be a project, folder, or workbook.
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request
 * (see <a href="http://dev.sencha.com/deploy/dev/docs/?class=Ext.data.Connection&member=abort" target="_blank">Ext.data.Connection.abort</a>).
 * In server-side scripts, this method will return the JSON response object (first parameter of the success or failure callbacks.)
 */
export function createContainer(config: CreateContainerOptions): XMLHttpRequest {
    return request({
        url: buildURL('core', 'createContainer.api', config.containerPath),
        method: 'POST',
        jsonData: {
            description: config.description,
            folderType: config.folderType,
            isWorkbook: config.isWorkbook,
            name: config.name,
            title: config.title
        },
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    })
}

export interface DeleteContainerOptions {
    /** The container which should be deleted. If not specified the current container path will be deleted. */
    containerPath?: string
    /**
     * A reference to a function to call when an error occurs. This
     * function will be passed the following parameters:
     * - errorInfo: an object containing detailed error information (may be null)
     * - response: The XMLHttpResponse object
     */
    failure?: () => any
    /** A scoping object for the success and error callback functions (default to this). */
    scope?: any
    /**
     * A reference to a function to call with the API results. This
     * function will be passed the following parameter:
     * - object: Empty JavaScript object
     * - response: The XMLHttpResponse object
     */
    success?: () => any
}

/**
 * Deletes an existing container, which may be a project, folder, or workbook.
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request
 * (see <a href="http://dev.sencha.com/deploy/dev/docs/?class=Ext.data.Connection&member=abort" target="_blank">Ext.data.Connection.abort</a>).
 * In server-side scripts, this method will return the JSON response object (first parameter of the success or failure callbacks.)
 */
export function deleteContainer(config: DeleteContainerOptions): XMLHttpRequest {
    return request({
        url: buildURL('core', 'deleteContainer.api', config.containerPath),
        method: 'POST',
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}

export interface GetContainersOptions {
    /** A container id or full-path String or an Array of container id/full-path Strings.  If not present, the current container is used. */
    container?: string | Array<string>
    /**
     * An alternate container path to get permissions from. If not specified,
     * the current container path will be used.
     */
    containerPath?: string
    /** May be used to control the depth of recursion if includeSubfolders is set to true. */
    depth?: number
    /**
     * A reference to a function to call when an error occurs. This
     * function will be passed the following parameters:
     * - errorInfo: an object containing detailed error information (may be null)
     * - response: The XMLHttpResponse object
     */
    failure?: () => any
    /**
     * If set to false, the effective permissions for this container resource
     * will not be included. (defaults to true)
     */
    includeEffectivePermissions?: boolean
    /**
     * If set to true, the entire branch of containers will be returned.
     * If false, only the immediate children of the starting container will be returned (defaults to false).
     */
    includeSubfolders?: boolean
    /**
     * The names (Strings) of modules whose Module Property values should be included for each container.
     * Use "*" to get the value of all Module Properties for all modules.
     */
    moduleProperties?: Array<string>
    /** A scoping object for the success and error callback functions (default to this). */
    scope?: any
    /**
     * A reference to a function to call with the API results. This
     * function will be passed the following parameters:
     *
     * - containersInfo:
     * If `container` is an Array, an object with property
     * `containers` and value Array of 'container info' is returned.
     * If `container` is a String, a object of 'container info' is returned.
     *     - id: the id of the requested container
     *     - name: the name of the requested container
     *     - path: the path of the requested container
     *     - sortOrder: the relative sort order of the requested container
     *     - activeModules: an assay of the names (strings) of active modules in the container
     *     - folderType: the name (string) of the folder type, matched with getFolderTypes()
     *     - description: an optional description for the container (may be null or missing)
     *     - title: an optional non-unique title for the container (may be null or missing)
     *     - isWorkbook: true if this container is a workbook. Workbooks do not appear in the left-hand project tree.
     *     - isContainerTab: true if this container is a Container Tab. Container Tabs do not appear in the left-hand project tree.
     *     - userPermissions: (DEPRECATED) the permissions the current user has in the requested container.
     *          Use this value with the hasPermission() method to test for specific permissions.
     *     - effectivePermissions: An array of effective permission unique names the group has.
     *     - children: if the includeSubfolders parameter was true, this will contain
     *          an array of child container objects with the same shape as the parent object.
     *     - moduleProperties: if requested in the config object, an array of module properties for each included module:
     *          - name: the name of the Module Property.
     *          - moduleName: the name of the module specifying this property.
     *          - effectiveValue: the value of the property, including a value potentially inherited from parent containers.
     *          - value: the value of the property as set for this specific container
     * - response: The XMLHttpResponse object
     */
    success?: () => any
}

/**
 * Returns information about the specified container, including the user's current permissions within
 * that container. If the includeSubfolders config option is set to true, it will also return information
 * about all descendants the user is allowed to see.
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request
 * (see <a href="http://dev.sencha.com/deploy/dev/docs/?class=Ext.data.Connection&member=abort" target="_blank">Ext.data.Connection.abort</a>).
 * In server-side scripts, this method will return the JSON response object (first parameter of the success or failure callbacks.)
 */
export function getContainers(config: GetContainersOptions): XMLHttpRequest {
    let params: any = {};

    if (config) {
        // TODO: These undefined checked should use !==
        if (config.container != undefined) {
            if (isArray(config.container)) {
                params.multipleContainers = true;
                params.container = config.container;
            }
            else {
                params.container = [config.container];
            }
        }

        if (config.includeSubfolders != undefined) {
            params.includeSubfolders = config.includeSubfolders === true;
        }
        if (config.depth != undefined) {
            params.depth = config.depth;
        }
        if (config.moduleProperties != undefined) {
            params.moduleProperties = config.moduleProperties;
        }
        if (config.includeEffectivePermissions != undefined) {
            params.includeEffectivePermissions = config.includeEffectivePermissions === true;
        }
    }

    return request({
        url: buildURL('project', 'getContainers.api', config.containerPath),
        params,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    })
}

export interface GetFolderTypesOptions {
    containerPath?: string
    /**
     * A reference to a function to call when an error occurs. This
     * function will be passed the following parameters:
     * - errorInfo: an object containing detailed error information (may be null)
     * - response: The XMLHttpResponse object
     */
    failure?: () => any
    /** A scoping object for the success and error callback functions (default to this). */
    scope?: any
    /**
     * A reference to a function to call with the API results. This
     * function will be passed the following parameter:
     * - folderTypes: Map from folder type name to folder type object, which consists of the following properties:
     *     - name: the cross-version stable name of the folder type
     *     - description: a short description of the folder type
     *     - label: the name that's shown to the user for this folder type
     *     - defaultModule: name of the module that provides the home screen for this folder type
     *     - activeModules: an array of module names that are automatically active for this folder type
     *     - workbookType: boolean that indicates if this is specifically intended to use as a workbook type
     *     - requiredWebParts: an array of web parts that are part of this folder type and cannot be removed
     *          - name: the name of the web part
     *          - properties: a map of properties that are automatically set
     *     - preferredWebParts: an array of web parts that are part of this folder type but may be removed. Same structure as requiredWebParts
     * - response: The XMLHttpResponse object
     */
    success?: () => any
}

/**
 * Retrieves the full set of folder types that are available on the server.
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request
 * (see <a href="http://dev.sencha.com/deploy/dev/docs/?class=Ext.data.Connection&member=abort" target="_blank">Ext.data.Connection.abort</a>).
 * In server-side scripts, this method will return the JSON response object (first parameter of the success or failure callbacks.)
 */
export function getFolderTypes(config: GetFolderTypesOptions): XMLHttpRequest {
    return request({
        url: buildURL('core', 'getFolderTypes.api', config.containerPath),
        method: 'POST',
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    })
}

/**
 * Returns the name of the home container, which is automatically created when your server is set up.  It is usually 'home'
 * @returns {string} The name of the home container automatically created on this server.
 */
export function getHomeContainer(): string {
    return getServerContext().homeContainer;
}

export interface GetModulesOptions {
    containerPath?: string
    /**
     * A reference to a function to call when an error occurs. This
     * function will be passed the following parameters:
     * - errorInfo: an object containing detailed error information (may be null)
     * - response: The XMLHttpResponse object
     */
    failure?: () => any
    /** A scoping object for the success and error callback functions (default to this). */
    scope?: any
    /**
     * A reference to a function to call with the API results. This
     * function will be passed the following parameter:
     * - folderType: the folderType, based on the container used when calling this API
     * - modules: Array of all modules present on this site, each of which consists of the following properties:
     *     - name: the name of the module
     *     - required: whether this module is required in the folder type specified above
     *     - tabName: name of the tab associated with this module
     *     - active: whether this module should be active for this container
     *     - enabled: whether this module should be enabled by default for this container
     * - response: The XMLHttpResponse object
     */
    success?: () => any
}

/**
 * Retrieves the full set of modules that are installed on the server.
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request
 * (see <a href="http://dev.sencha.com/deploy/dev/docs/?class=Ext.data.Connection&member=abort" target="_blank">Ext.data.Connection.abort</a>).
 * In server-side scripts, this method will return the JSON response object (first parameter of the success or failure callbacks.)
 */
export function getModules(config: GetModulesOptions): XMLHttpRequest {
    return request({
        url: buildURL('admin', 'getModules.api', config.containerPath),
        method: 'POST',
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}

/**
 * Returns the name of the shared container, which is automatically created when your server is setup. It is usually 'Shared'
 * @returns {string} The name of the shared container automatically created on this server.
 */
export function getSharedContainer(): string {
    return getServerContext().sharedContainer;
}

export interface MoveContainerOptions {
    /** Add alias of current container path to container that is being moved (defaults to True). */
    addAlias?: boolean
    container?: string
    /**
     * The current container path of the container that is going to be moved. Additionally, the container
     * entity id is also valid.
     */
    containerPath?: string
    /**
     * The current container path of the container that is going to be moved. Additionally, the container
     * entity id is also valid.
     */
    destinationParent?: string
    /**
     * A reference to a function to call when an error occurs. This
     * function will be passed the following parameters:
     * - errorInfo: an object containing detailed error information (may be null)
     * - response: The XMLHttpResponse object
     */
    failure?: () => any
    parent?: string
    parentPath?: string
    /** A scoping object for the success and error callback functions (default to this). */
    scope?: any
    /**
     * A reference to a function to call with the API results. This function will
     * be passed the following parameters:
     * - object: Empty JavaScript object
     * - response: The XMLHttpResponse object
     */
    success?: () => any
}

/**
 * Moves an existing container, which may be a folder or workbook to be the subfolder of another folder and/or project.
 */
export function moveContainer(config: MoveContainerOptions): XMLHttpRequest {
    let params = {
        addAlias: config.addAlias !== false,
        container: config.container || config.containerPath,
        parent: config.destinationParent || config.parent || config.parentPath
    };

    if (!params.container) {
        throw "'containerPath' must be specified for LABKEY.Security.moveContainer invocation.";
    }

    if (!params.parent) {
        throw "'parent' must be specified for LABKEY.Security.moveContainer invocation.";
    }

    return request({
        url: buildURL('core', 'moveContainer.api', params.container),
        method: 'POST',
        jsonData: params,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}