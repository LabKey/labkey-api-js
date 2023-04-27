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
import { request } from '../Ajax';
import { buildURL } from '../ActionURL';
import { getOnSuccess, getCallbackWrapper, getOnFailure, isArray, RequestCallbackOptions } from '../Utils';
import { Container, getServerContext } from '../constants';

export interface CreateContainerOptions extends RequestCallbackOptions<Container> {
    /**
     * An alternate container in which to create a new container. If not specified,
     * the current container path will be used.
     */
    containerPath?: string;
    /** The description of the container, used primarily for workbooks. */
    description?: string;
    /** The name of the folder type to be applied. */
    folderType?: string;
    /** Whether this a workbook should be created. Defaults to false. */
    isWorkbook?: boolean;
    /** Required for projects or folders. The name of the container. */
    name: string;
    /** The title of the container, used primarily for workbooks. */
    title?: string;
}

/**
 * Creates a new container, which may be a project, folder, or workbook.
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request.
 * In server-side scripts, this method will return the JSON response object
 * (first parameter of the success or failure callbacks.)
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
            title: config.title,
        },
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
    });
}

export interface DeleteContainerOptions extends RequestCallbackOptions {
    /** A comment which will appear in the audit log on the reason for deletion. */
    comment?: string;
    /** The container which should be deleted. If not specified the current container path will be deleted. */
    containerPath?: string;
}

/**
 * Deletes an existing container, which may be a project, folder, or workbook.
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request.
 * In server-side scripts, this method will return the JSON response object
 * (first parameter of the success or failure callbacks.)
 */
export function deleteContainer(config: DeleteContainerOptions): XMLHttpRequest {
    return request({
        url: buildURL('core', 'deleteContainer.api', config.containerPath),
        method: 'POST',
        jsonData: { comment: config.comment },
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
    });
}

export interface RenameContainerOptions extends RequestCallbackOptions {
    /** The new container name. If not specified, defaults to existing name. */
    name?: string;
    /** The new container title. If not specified, defaults to name. */
    title?: string;
    /** If set to true, adds an alias for the container's current name. */
    addAlias?: boolean;
    /** The container which should be renamed. If not specified the current container path will be renamed. */
    containerPath?: string;
}

/**
 * Renames an existing container, or updates the container title.
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request.
 * In server-side scripts, this method will return the JSON response object
 * (first parameter of the success or failure callbacks.)
 */
export function renameContainer(config: RenameContainerOptions): XMLHttpRequest {
    return request({
        url: buildURL('admin', 'renameContainer.api', config.containerPath),
        method: 'POST',
        jsonData: { name: config.name, title: config.title, addAlias: config.addAlias },
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
    });
}

export interface ModuleProperty {
    /** The value of the property, including a value potentially inherited from parent containers. */
    effectiveValue: any;
    /** Name of the module specifying this property. */
    module: string;
    /** Name of the module property. */
    name: string;
    /** The value of the property as set for this specific container. */
    value: any;
}

export interface ContainerHierarchy extends Container {
    /**
     * When the includeSubfolders parameter was true this will contain an array of child
     * container objects with the same shape as the parent object.
     */
    children: ContainerHierarchy[];
    /**
     * An array of effective permission unique names the group has. Only available if
     * includeEffectivePermissions parameter is set to true.
     */
    effectivePermissions?: string[];
    /**
     * If requested in the config object, an array of module properties for each included module.
     */
    moduleProperties: ModuleProperty[];
    /**
     * @deprecated
     * The permissions the current user has in the container.
     */
    userPermissions: number;
}

// TODO: getContainers return type varies based on parameters. If "container" property is a string
// it will return a ContainerHierarchy. If "container" property is string[] it will return
// { containers: ContainerHierarchy[] }. We should consider making return type consistent (e.g. always an array).
// For this reason the <ContainerHierarchy> type is commented out below leaving this API's response untyped.
export interface GetContainersOptions extends RequestCallbackOptions /* <ContainerHierarchy>*/ {
    /**
     * A container id or full-path String or an Array of container id/full-path Strings.
     * If not present, the current container is used.
     */
    container?: string | string[];
    /**
     * An alternate container path to get permissions from. If not specified,
     * the current container path will be used.
     */
    containerPath?: string;
    /** May be used to control the depth of recursion if includeSubfolders is set to true. */
    depth?: number;
    /**
     * If set to false, the effective permissions for this container resource
     * will not be included. (defaults to true)
     */
    includeEffectivePermissions?: boolean;
    /**
     * If set to true, all of the container's standard properties will be included. (defaults to true)
     * If set to false, only the base set of properties (i.e. id, name, and path) will be included.
     */
    includeStandardProperties?: boolean;
    /**
     * If set to true, the entire branch of containers will be returned.
     * If false, only the immediate children of the starting container will be returned (defaults to false).
     */
    includeSubfolders?: boolean;
    /**
     * If set to false, child containers of type "workbook" will not be included. (defaults to true)
     */
    includeWorkbookChildren?: boolean;
    /**
     * The names (Strings) of modules whose Module Property values should be included for each container.
     * Use "*" to get the value of all Module Properties for all modules.
     */
    moduleProperties?: string[];
}

/**
 * Returns information about the specified container, including the user's current permissions within
 * that container. If the includeSubfolders config option is set to true, it will also return information
 * about all descendants the user is allowed to see.
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request.
 * In server-side scripts, this method will return the JSON response object
 * (first parameter of the success or failure callbacks.)
 */
export function getContainers(config: GetContainersOptions): XMLHttpRequest {
    const params: any = {};

    if (config) {
        // TODO: These undefined checked should use !==
        if (config.container != undefined) {
            if (isArray(config.container)) {
                params.multipleContainers = true;
                params.container = config.container;
            } else {
                params.container = [config.container];
            }
        }

        if (config.includeSubfolders != undefined) {
            params.includeSubfolders = config.includeSubfolders;
        }
        if (config.depth != undefined) {
            params.depth = config.depth;
        }
        if (config.moduleProperties != undefined) {
            params.moduleProperties = config.moduleProperties;
        }
        if (config.includeEffectivePermissions != undefined) {
            params.includeEffectivePermissions = config.includeEffectivePermissions;
        }
        if (config.includeWorkbookChildren != undefined) {
            params.includeWorkbookChildren = config.includeWorkbookChildren;
        }
        if (config.includeStandardProperties != undefined) {
            params.includeStandardProperties = config.includeStandardProperties;
        }
    }

    return request({
        url: buildURL('project', 'getContainers.api', config.containerPath),
        params,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
    });
}

export type FolderTypeWebParts = {
    /** Name of the web part */
    name: string;
    /** Map of properties that are automatically set */
    properties: Record<string, any>;
};

export type FolderType = {
    /** Array of module names that are automatically active for this folder type */
    activeModules: string[];
    /** Name of the module that provides the home screen for this folder type */
    defaultModule: string;
    /** Short description of the folder type */
    description: string;
    /** Name that's shown to the user for this folder type */
    label: string;
    /** Cross-version stable name of the folder type */
    name: string;
    /** Array of web parts that are part of this folder type but may be removed */
    preferredWebParts: FolderTypeWebParts[];
    /** Array of web parts that are part of this folder type and cannot be removed */
    requiredWebParts: FolderTypeWebParts[];
    /** Indicates if this is specifically intended to use as a workbook type */
    workbookType: boolean;
};

export type GetFolderTypesResponse = {
    [folderType: string]: FolderType;
};

export interface GetFolderTypesOptions extends RequestCallbackOptions<GetFolderTypesResponse> {
    containerPath?: string;
}

/**
 * Retrieves the full set of folder types that are available on the server.
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request.
 * In server-side scripts, this method will return the JSON response object
 * (first parameter of the success or failure callbacks.)
 */
export function getFolderTypes(config: GetFolderTypesOptions): XMLHttpRequest {
    return request({
        url: buildURL('core', 'getFolderTypes.api', config.containerPath),
        method: 'POST',
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
    });
}

/**
 * Returns the name of the home container, which is automatically created when your server is set up.  It is usually 'home'
 * @returns {string} The name of the home container automatically created on this server.
 */
export function getHomeContainer(): string {
    return getServerContext().homeContainer;
}

export type GetModulesModules = {
    /** whether this module should be active for this container */
    active: boolean;

    /** whether this module should be enabled by default for this container */
    enabled: boolean;

    /** Name of the module */
    name: string;

    /** Indicates if this module requires site permission */
    requireSitePermission: boolean;

    /** Whether this module is required in the folder type specified above */
    required: boolean;

    /** name of the tab associated with this module */
    tabName: string;
};

export interface GetModulesResponse {
    /** the folderType, based on the container used when calling this API */
    folderType: string;

    /** All modules present on this site */
    modules: GetModulesModules[];
}

export interface GetModulesOptions extends RequestCallbackOptions<GetModulesResponse> {
    containerPath?: string;
}

/**
 * Retrieves the full set of modules that are installed on the server.
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request.
 * In server-side scripts, this method will return the JSON response object
 * (first parameter of the success or failure callbacks.)
 */
export function getModules(config: GetModulesOptions): XMLHttpRequest {
    return request({
        url: buildURL('admin', 'getModules.api', config.containerPath),
        method: 'POST',
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
    });
}

export interface GetReadableContainersOptions extends RequestCallbackOptions<string[]> {
    /**
     * A container id, full-path string, or an Array of container id/full-path
     * Strings (only the first will be used). If not present, the current container is used.
     */
    container?: any;

    /**
     * An alternate container from which to request readable containers. If not specified,
     * the current container path will be used.
     */
    containerPath?: string;

    /**
     * May be used to control the depth of recursion if includeSubfolders is set to true.
     */
    depth?: number;

    /**
     * If set to true, the entire branch of containers will be returned.
     * If false, only the immediate children of the starting container will be returned (defaults to false).
     */
    includeSubfolders?: boolean;
}

/**
 * Returns information about the container paths visible to the current user.
 */
export function getReadableContainers(options: GetReadableContainersOptions): XMLHttpRequest {
    const params: any = {};

    if (undefined !== options.container) {
        if (isArray(options.container)) {
            if (options.container.length > 0) {
                options.container = [options.container[0]];
            } else {
                delete options.container;
            }
        } else {
            options.container = [options.container];
        }
        params.container = options.container;
    }
    if (undefined !== options.includeSubfolders) {
        params.includeSubfolders = options.includeSubfolders;
    }
    if (undefined !== options.depth) {
        params.depth = options.depth;
    }

    return request({
        url: buildURL('project', 'getReadableContainers.api', options.containerPath),
        params,
        success: getCallbackWrapper(getOnSuccess(options), options.scope, false, (o: any) => o.containers),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
    });
}

/**
 * Returns the name of the shared container, which is automatically created when your server is setup. It is usually 'Shared'
 * @returns {string} The name of the shared container automatically created on this server.
 */
export function getSharedContainer(): string {
    return getServerContext().sharedContainer;
}

export interface MoveContainerOptions extends RequestCallbackOptions {
    /** Add alias of current container path to container that is being moved (defaults to True). */
    addAlias?: boolean;

    container?: string;

    /**
     * The current container path of the container that is going to be moved. Additionally, the container
     * entity id is also valid.
     */
    containerPath?: string;
    /**
     * The current container path of the container that is going to be moved. Additionally, the container
     * entity id is also valid.
     */
    destinationParent?: string;

    parent?: string;

    parentPath?: string;
}

/**
 * Moves an existing container, which may be a folder or workbook to be the subfolder of another folder and/or project.
 */
export function moveContainer(config: MoveContainerOptions): XMLHttpRequest {
    const params = {
        addAlias: config.addAlias !== false,
        container: config.container || config.containerPath,
        parent: config.destinationParent || config.parent || config.parentPath,
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
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
    });
}
