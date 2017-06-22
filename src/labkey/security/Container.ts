/*
 * Copyright (c) 2017 LabKey Corporation
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
import { loadContext } from '../constants'

const LABKEY = loadContext();

interface CreateContainerOptions {
    containerPath?: string
    description?: string
    failure?: () => any
    folderType?: string
    isWorkbook?: boolean
    name?: string
    scope?: any
    success?: () => any
    title?: string
}

/**
 * Creates a new container, which may be a project, folder, or workbook.
 * @param config A configuration object with the following properties
 * @param {String} [config.name] Required for projects or folders. The name of the container.
 * @param {String} [config.title] The title of the container, used primarily for workbooks.
 * @param {String} [config.description] The description of the container, used primarily for workbooks.
 * @param {boolean} [config.isWorkbook] Whether this a workbook should be created. Defaults to false.
 * @param {String} [config.folderType] The name of the folder type to be applied.
 * @param {function} [config.success] A reference to a function to call with the API results. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>containersInfo:</b> an object with the following properties:
 *  <ul>
 *      <li>id: the id of the requested container</li>
 *      <li>name: the name of the requested container</li>
 *      <li>path: the path of the requested container</li>
 *      <li>sortOrder: the relative sort order of the requested container</li>
 *      <li>description: an optional description for the container (may be null or missing)</li>
 *      <li>title: an optional non-unique title for the container (may be null or missing)</li>
 *      <li>isWorkbook: true if this container is a workbook. Workbooks do not appear in the left-hand project tree.</li>
 *      <li>effectivePermissions: An array of effective permission unique names the group has.</li>
 *  </ul>
 * </li>
 * <li><b>response:</b> The XMLHttpResponse object</li>
 * </ul>
 * @param {function} [config.failure] A reference to a function to call when an error occurs. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>errorInfo:</b> an object containing detailed error information (may be null)</li>
 * <li><b>response:</b> The XMLHttpResponse object</li>
 * </ul>
 * @param {string} [config.containerPath] An alternate container in which to create a new container. If not specified,
 * the current container path will be used.
 * @param {object} [config.scope] A scoping object for the success and error callback functions (default to this).
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
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true /* isErrorCallback */)
    })
}

interface DeleteContainerOptions {
    containerPath?: string
    failure?: () => any
    scope?: any
    success?: () => any
}

/**
 * Deletes an existing container, which may be a project, folder, or workbook.
 * @param config A configuration object with the following properties
 * @param {function} [config.success] A reference to a function to call with the API results. This
 * function will be passed the following parameter:
 * <ul>
 * <li><b>object:</b> Empty JavaScript object</li>
 * <li><b>response:</b> The XMLHttpResponse object</li>
 * </ul>
 * @param {function} [config.failure] A reference to a function to call when an error occurs. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>errorInfo:</b> an object containing detailed error information (may be null)</li>
 * <li><b>response:</b> The XMLHttpResponse object</li>
 * </ul>
 * @param {string} [config.containerPath] The container which should be deleted. If not specified,
 * the current container path will be deleted.
 * @param {object} [config.scope] A scoping object for the success and error callback functions (default to this).
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
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true /* isErrorCallback */)
    });
}

interface GetContainersOptions {
    container?: string | Array<string>
    containerPath?: string
    depth?: number
    failure?: () => any
    includeEffectivePermissions?: boolean
    includeSubfolders?: boolean
    moduleProperties?: Array<string>
    scope?: any
    success?: () => any
}

/**
 * Returns information about the specified container, including the user's current permissions within
 * that container. If the includeSubfolders config option is set to true, it will also return information
 * about all descendants the user is allowed to see.
 * @param config A configuration object with the following properties
 * @param {Mixed} [config.container] A container id or full-path String or an Array of container id/full-path Strings.  If not present, the current container is used.
 * @param {boolean} [config.includeSubfolders] If set to true, the entire branch of containers will be returned.
 * If false, only the immediate children of the starting container will be returned (defaults to false).
 * @param {boolean} [config.includeEffectivePermissions] If set to false, the effective permissions for this container resource
 * will not be included. (defaults to true)
 * @param {int} [config.depth] May be used to control the depth of recursion if includeSubfolders is set to true.
 * @param {Array} [config.moduleProperties] The names (Strings) of modules whose Module Property values should be included for each container.
 * Use "*" to get the value of all Module Properties for all modules.
 * @param {function} config.success A reference to a function to call with the API results. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>containersInfo:</b>
 * If <code>config.container</code> is an Array, an object with property
 * <code>containers</code> and value Array of 'container info' is returned.
 * If <code>config.container</code> is a String, a object of 'container info' is returned.
 * <br>
 * The 'container info' properties are as follows:
 *  <ul>
 *      <li>id: the id of the requested container</li>
 *      <li>name: the name of the requested container</li>
 *      <li>path: the path of the requested container</li>
 *      <li>sortOrder: the relative sort order of the requested container</li>
 *      <li>activeModules: an assay of the names (strings) of active modules in the container</li>
 *      <li>folderType: the name (string) of the folder type, matched with getFolderTypes()</li>
 *      <li>description: an optional description for the container (may be null or missing)</li>
 *      <li>title: an optional non-unique title for the container (may be null or missing)</li>
 *      <li>isWorkbook: true if this container is a workbook. Workbooks do not appear in the left-hand project tree.</li>
 *      <li>isContainerTab: true if this container is a Container Tab. Container Tabs do not appear in the left-hand project tree.</li>
 *      <li>userPermissions: (DEPRECATED) the permissions the current user has in the requested container.
 *          Use this value with the hasPermission() method to test for specific permissions.</li>
 *      <li>effectivePermissions: An array of effective permission unique names the group has.</li>
 *      <li>children: if the includeSubfolders parameter was true, this will contain
 *          an array of child container objects with the same shape as the parent object.</li>
 *      <li>moduleProperties: if requested in the config object, an array of module properties for each included module:
 *          <ul>
 *              <li>name: the name of the Module Property.</li>
 *              <li>moduleName: the name of the module specifying this property.</li>
 *              <li>effectiveValue: the value of the property, including a value potentially inherited from parent containers.</li>
 *              <li>value: the value of the property as set for this specific container</li>
 *          </ul>
 *      </li>
 *  </ul>
 * </li>
 * <li><b>response:</b> The XMLHttpResponse object</li>
 * </ul>
 * @param {function} [config.failure] A reference to a function to call when an error occurs. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>errorInfo:</b> an object containing detailed error information (may be null)</li>
 * <li><b>response:</b> The XMLHttpResponse object</li>
 * </ul>
 * @param {string} [config.containerPath] An alternate container path to get permissions from. If not specified,
 * the current container path will be used.
 * @param {object} [config.scope] A scoping object for the success and error callback functions (default to this).
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
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true /* isErrorCallback */)
    })
}

interface GetFolderTypesOptions {
    containerPath?: string
    failure?: () => any
    scope?: any
    success?: () => any
}

/**
 * Retrieves the full set of folder types that are available on the server.
 * @param config A configuration object with the following properties
 * @param {function} config.success A reference to a function to call with the API results. This
 * function will be passed the following parameter:
 * <ul>
 * <li><b>folderTypes:</b> Map from folder type name to folder type object, which consists of the following properties:
 *  <ul>
 *      <li><b>name:</b> the cross-version stable name of the folder type</li>
 *      <li><b>description:</b> a short description of the folder type</li>
 *      <li><b>label:</b> the name that's shown to the user for this folder type</li>
 *      <li><b>defaultModule:</b> name of the module that provides the home screen for this folder type</li>
 *      <li><b>activeModules:</b> an array of module names that are automatically active for this folder type</li>
 *      <li><b>workbookType:</b> boolean that indicates if this is specifically intended to use as a workbook type
 *      <li><b>requiredWebParts:</b> an array of web parts that are part of this folder type and cannot be removed
 *          <ul>
 *              <li><b>name:</b> the name of the web part</li>
 *              <li><b>properties:</b> a map of properties that are automatically set</li>
 *          </ul>
 *      </li>
 *      <li><b>preferredWebParts:</b> an array of web parts that are part of this folder type but may be removed. Same structure as requiredWebParts</li>
 *  </ul>
 * </li>
 * <li><b>response:</b> The XMLHttpResponse object</li>
 * </ul>
 * @param {function} [config.failure] A reference to a function to call when an error occurs. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>errorInfo:</b> an object containing detailed error information (may be null)</li>
 * <li><b>response:</b> The XMLHttpResponse object</li>
 * </ul>
 * @param {object} [config.scope] A scoping object for the success and error callback functions (default to this).
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
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true /* isErrorCallback */)
    })
}

/**
 * Returns the name of the home container, which is automatically created when your server is set up.  It is usually 'home'
 * @returns {string} The name of the home container automatically created on this server.
 */
export function getHomeContainer(): string {
    return LABKEY.homeContainer;
}

interface GetModulesOptions {
    containerPath?: string
    failure?: () => any
    scope?: any
    success?: () => any
}

/**
 * Retrieves the full set of modules that are installed on the server.
 * @param config A configuration object with the following properties
 * @param {function} config.success A reference to a function to call with the API results. This
 * function will be passed the following parameter:
 * <ul>
 * <li><b>folderType:</b> the folderType, based on the container used when calling this API</li>
 * <li><b>modules:</b> Array of all modules present on this site, each of which consists of the following properties:
 *  <ul>
 *      <li><b>name:</b> the name of the module</li>
 *      <li><b>required:</b> whether this module is required in the folder type specified above</li>
 *      <li><b>tabName:</b> name of the tab associated with this module</li>
 *      <li><b>active:</b> whether this module should be active for this container</li>
 *      <li><b>enabled:</b> whether this module should be enabled by default for this container</li>
 *  </ul>
 * </li>
 * <li><b>response:</b> The XMLHttpResponse object</li>
 * </ul>
 * @param {function} [config.failure] A reference to a function to call when an error occurs. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>errorInfo:</b> an object containing detailed error information (may be null)</li>
 * <li><b>response:</b> The XMLHttpResponse object</li>
 * </ul>
 * @param {object} [config.scope] A scoping object for the success and error callback functions (default to this).
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
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true /* isErrorCallback */)
    });
}

/**
 * Returns the name of the shared container, which is automatically created when your server is setup. It is usually 'Shared'
 * @returns {string} The name of the shared container automatically created on this server.
 */
export function getSharedContainer(): string {
    return LABKEY.sharedContainer;
}

interface MoveContainerOptions {
    addAlias?: boolean
    container?: string
    containerPath?: string
    destinationParent?: string
    failure?: () => any
    parent?: string
    parentPath?: string
    scope?: any
    success?: () => any
}

/**
 * Moves an existing container, which may be a folder or workbook to be the subfolder of another folder and/or project.
 * @param config A configuration object with the following properties
 * @param {string} config.containerPath The current container path of the container that is going to be moved. Additionally, the container
 * entity id is also valid.
 * @param {string} config.destinationParent The container path of destination parent. Additionally, the destination parent entity id
 * is also valid.
 * @param {boolean} [config.addAlias] Add alias of current container path to container that is being moved (defaults to True).
 * @param {function} [config.success] A reference to a function to call with the API results. This function will
 * be passed the following parameters:
 * <ul>
 * <li><b>object:</b> Empty JavaScript object</li>
 * <li><b>response:</b> The XMLHttpResponse object</li>
 * </ul>
 * @param {function} [config.failure] A reference to a function to call when an error occurs. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>errorInfo:</b> an object containing detailed error information (may be null)</li>
 * <li><b>response:</b> The XMLHttpResponse object</li>
 * </ul>
 * @param {object} [config.scope] A scoping object for the success and error callback functions (default to this).
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
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true /* isErrorCallback */)
    });
}