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
import { getOnSuccess, getCallbackWrapper, getOnFailure } from '../Utils'

import { roles } from './constants'

export interface GetGroupPermissionsOptions {
    /**
     * An alternate container path to get permissions from. If not specified,
     * the current container path will be used.
     */
    containerPath?: string
    /**
     * A reference to a function to call when an error occurs. This
     * function will be passed the following parameters:
     * - errorInfo: an object containing detailed error information (may be null)
     * - response: The XMLHttpResponse object
     * @param error
     */
    failure?: (error?: any) => any
    /** Set to true to recurse down the subfolders (defaults to false) */
    includeSubfolders?: boolean
    /** A scoping object for the success and error callback functions (default to this). */
    scope?: any
    /**
     * A reference to a function to call with the API results. This
     * function will be passed the following parameters:
     * - groupPermsInfo: an object containing properties about the container and group permissions.
     * This object will have the following shape:
     *     - container
     *         - id: the container id
     *         - name: the container name
     *         - path: the container path
     *         - isInheritingPerms: true if the container is inheriting permissions from its parent
     *         - groups: an array of group objects, each of which will have the following properties:
     *             - id: the group id
     *             - name: the group's name
     *             - type: the group's type ('g' for group, 'r' for role, 'm' for module-specific)
     *             - roleLabel: (DEPRECATED) a description of the group's permission role. This will correspond
     *             to the visible labels shown on the permissions page (e.g., 'Admin (all permissions)'.
     *             - role: (DEPRECATED) the group's role value (e.g., 'ADMIN'). Use this property for programmatic checks.
     *             - permissions: (DEPRECATED) The group's effective permissions as a bit mask.
     *             Use this with the hasPermission() method to test for specific permissions.
     *             - roles: An array of role unique names that this group is playing in the container. This replaces the
     *             existing roleLabel, role and permissions properties. Groups may now play multiple roles in a container
     *             and each role grants the user a set of permissions. Use the getRoles() method to retrieve information
     *             about the roles, including which permissions are granted by each role.
     *             -  effectivePermissions: An array of effective permission unique names the group has.
     *         - children: if includeSubfolders was true, this will contain an array of objects, each of
     *              which will have the same shape as the parent container object.
     * - response: The XMLHttpResponse object
     * @param data
     */
    success?: (data?: any) => any
}

/**
 * Get the effective permissions for all groups within the container, optionally
 * recursing down the container hierarchy.
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request
 * (see <a href="http://dev.sencha.com/deploy/dev/docs/?class=Ext.data.Connection&member=abort" target="_blank">Ext.data.Connection.abort</a>).
 * In server-side scripts, this method will return the JSON response object (first parameter of the success or failure callbacks.)
 */
export function getGroupPermissions(config: GetGroupPermissionsOptions): XMLHttpRequest {
    let params: any = {};

    if (config.includeSubfolders !== undefined) {
        params.includeSubfolders = config.includeSubfolders === true;
    }

    return request({
        url: buildURL('security', 'getGroupPerms.api', config.containerPath),
        params,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}

/**
 * Returns the name of the security role represented by the permissions passed as 'perms'.
 * The return value will be the name of a property in the LABKEY.Security.roles map.
 * This is a local function, and does not make a call to the server.
 * @param {int} perms The permissions set
 * @deprecated Do not use this anymore. Use the roles array in the various responses and the
 * getRoles() method to obtain extra information about each role.
 */
export function getRole(perms: number): string {
    for (let role in roles) {
        if (roles.hasOwnProperty(role)) {
            if (perms === roles[role]) {
                return role;
            }
        }
    }
}

export interface GetRolesOptions {
    containerPath?: string
    /**
     * A reference to a function to call when an error occurs. This
     * function will be passed the following parameters:
     * - errorInfo: an object containing detailed error information (may be null)
     * - response: The XMLHttpResponse object
     */
    failure?: (error?: any) => any
    /** A scoping object for the success and error callback functions (default to this). */
    scope?: any
    /**
     * A reference to a function to call with the API results. This
     * function will be passed the following parameters:
     * - roles: An array of role objects, each of which has the following properties:
     *     - uniqueName: The unique name of the resource (String, typically a fully-qualified class name).
     *     - name: The name of the role suitable for showing to a user.
     *     - description: The description of the role.
     *     - sourceModule: The name of the module in which the role is defined.
     *     - permissions: An array of permissions the role grants. Each permission has the following properties:
     *         - uniqueName: The unique name of the permission (String, typically a fully-qualified class name).
     *         - name: The name of the permission.
     *         - description: A description of the permission.
     *         - sourceModule: The module in which the permission is defined.
     * - response: The XMLHttpResponse object
     */
    success?: (data?: any) => any
}

export interface GetRolesResponse {
    permissions: Array<{uniqueName: string}>
    roles: Array<{permissions: Array<string>}>
}

/**
 * Returns the complete set of roles defined on the server, along with the permissions each role grants.
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request
 * (see <a href="http://dev.sencha.com/deploy/dev/docs/?class=Ext.data.Connection&member=abort" target="_blank">Ext.data.Connection.abort</a>).
 * In server-side scripts, this method will return the JSON response object (first parameter of the success or failure callbacks.)
 */
export function getRoles(config: GetRolesOptions): XMLHttpRequest {
    return request({
        url: buildURL('security', 'getRoles.api', config.containerPath),
        success: getCallbackWrapper(function(data: GetRolesResponse, req: any) {
            // roles and perms are returned in two separate blocks for efficiency
            let i: number,
                j: number,
                permMap: any = {},
                perm: any,
                role: any;

            for (i = 0; i < data.permissions.length; i++) {
                perm = data.permissions[i];
                permMap[perm.uniqueName] = perm;
            }

            for (i = 0; i < data.roles.length; i++) {
                role = data.roles[i];
                for (j = 0; j < role.permissions.length; ++j) {
                    role.permissions[j] = permMap[role.permissions[j]];
                }
            }

            const success = getOnSuccess(config);
            if (success) {
                success.call(config.scope || this, data.roles, req);
            }
        }, this),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}

export interface GetSchemaPermissionsOptions {
    /**
     * An alternate container path to get permissions from. If not specified,
     * the current container path will be used.
     */
    containerPath?: string
    /**
     * A reference to a function to call when an error occurs. This
     * function will be passed the following parameters:
     * - errorInfo: an object containing detailed error information (may be null)
     * - response: The XMLHttpResponse object
     */
    failure?: Function
    /** Name of the schema to retrieve information on. */
    schemaName: string
    /** A scoping object for the success and error callback functions (default to this). */
    scope?: any
    /**
     * A reference to a function to call with the API results. This
     * function will be passed the following parameters:
     * - data: an object with a property named "schemas" which contains a queries object.
     * The queries object property with the name of each table/queries. So
     * schemas.study.queries.Demographics would yield the following results
     *     - id: The unique id of the resource (String, typically a GUID).
     *     - name: The name of the resource suitable for showing to a user.
     *     - description: The description of the reosurce.
     *     - resourceClass: The fully-qualified Java class name of the resource.
     *     - sourceModule: The name of the module in which the resource is defined and managed
     *     - parentId: The parent resource's id (may be omitted if no parent)
     *     - parentContainerPath: The parent resource's container path (may be omitted if no parent)
     *     - children: An array of child resource objects.
     *     - effectivePermissions: An array of permission unique names the current user has on the resource. This will be
     *       present only if the includeEffectivePermissions property was set to true on the config object.
     *     - permissionMap: An object with one property per effectivePermission allowed the user. This restates
     *       effectivePermissions in a slightly more convenient way
     * - response: The XMLHttpResponse object
     */
    success?: Function
}

/**
 * EXPERIMENTAL! gets permissions for a set of tables within the study schema.
 * Currently only study tables have individual permissions so only works on the study schema
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request
 * (see <a href="http://dev.sencha.com/deploy/dev/docs/?class=Ext.data.Connection&member=abort" target="_blank">Ext.data.Connection.abort</a>).
 * In server-side scripts, this method will return the JSON response object (first parameter of the success or failure callbacks.)
 */
export function getSchemaPermissions(config: GetSchemaPermissionsOptions): XMLHttpRequest {
    if (!config.schemaName || (config.schemaName && config.schemaName !== 'study')) {
        throw 'Method only works for the study schema';
    }

    let getResourcesConfig: any = config;

    getResourcesConfig.includeEffectivePermissions = true;
    getResourcesConfig.success = function(json: any, response: any) {
        // First lets make sure there is a study in here.
        let studyResource: any = null;
        for (let i = 0; i < json.resources.children.length; i++) {
            let resource: any = json.resources.children[i];
            if (resource.resourceClass == 'org.labkey.study.model.StudyImpl') {
                studyResource = resource;
                break;
            }
        }

        if (null == studyResource) {
            config.failure.apply(config.scope || this, [{description: 'No study found in container.'}, response]);
            return;
        }

        let result: any = {
            queries: {}
        }, dataset: any;

        for (let i = 0; i < studyResource.children.length; i++) {
            dataset = studyResource.children[i];
            result.queries[dataset.name] = dataset;
            dataset.permissionMap = {};
            for (let j=0; j < dataset.effectivePermissions.length; j++) {
                dataset.permissionMap[dataset.effectivePermissions[j]] = true;
            }
        }

        config.success.apply(config.scope || this, [{schemas: {study: result}}, response]);
    };

    return getSecurableResources(getResourcesConfig);
}

export interface GetSecurableResourcesOptions {
    /**
     * An alternate container path to get permissions from. If not specified,
     * the current container path will be used.
     */
    containerPath?: string
    /**
     * A reference to a function to call when an error occurs. This
     * function will be passed the following parameters:
     * - errorInfo: an object containing detailed error information (may be null)
     * - response: The XMLHttpResponse object
     */
    failure?: Function
    /**
     * If set to true, the response will include the
     * list of effective permissions (unique names) the current user has to each resource (defaults to false).
     * These permissions are calcualted based on the current user's group memberships and role assignments, and
     * represent the actual permissions the user has to these resources at the time of the API call.
     */
    includeEffectivePermissions?: boolean
    /**
     * If set to true, the response will include subfolders
     * and their contained securable resources (defaults to false).
     */
    includeSubfolders?: boolean
    /** A scoping object for the success and error callback functions (default to this). */
    scope?: any
    /**
     * A reference to a function to call with the API results. This
     * function will be passed the following parameters:
     * - data: an object with a property named "resources" which contains the root resource.
     * Each resource has the following properties:
     *     - id: The unique id of the resource (String, typically a GUID).
     *     - name: The name of the resource suitable for showing to a user.
     *     - description: The description of the reosurce.
     *     - resourceClass: The fully-qualified Java class name of the resource.
     *     - sourceModule: The name of the module in which the resource is defined and managed
     *     - parentId: The parent resource's id (may be omitted if no parent)
     *     - parentContainerPath: The parent resource's container path (may be omitted if no parent)</li>
     *     - children: An array of child resource objects.
     *     - effectivePermissions: An array of permission unique names the current user has on the resource. This will be
     *       present only if the includeEffectivePermissions property was set to true on the config object.
     * - response: The XMLHttpResponse object
     */
    success?: Function
}

/**
 * Returns the tree of securable resources from the current container downward
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request
 * (see <a href="http://dev.sencha.com/deploy/dev/docs/?class=Ext.data.Connection&member=abort" target="_blank">Ext.data.Connection.abort</a>).
 * In server-side scripts, this method will return the JSON response object (first parameter of the success or failure callbacks.)
 */
export function getSecurableResources(config: GetSecurableResourcesOptions): XMLHttpRequest {
    let params: any = {};

    if (config.includeSubfolders != undefined) {
        params.includeSubfolders = config.includeSubfolders === true;
    }
    if (config.includeEffectivePermissions != undefined) {
        params.includeEffectivePermissions = config.includeEffectivePermissions === true;
    }

    return request({
        url: buildURL('security', 'getSecurableResources.api', config.containerPath),
        params,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    })
}

export interface GetUserPermissionsOptions {
    containerPath?: string
    /**
     * A reference to a function to call when an error occurs. This
     * function will be passed the following parameters:
     * - errorInfo: an object containing detailed error information (may be null)
     * - response: The XMLHttpResponse object
     */
    failure?: (error?: any) => any
    /** Set to true to recurse down the subfolders (defaults to false) */
    includeSubfolders?: boolean
    /** A scoping object for the success and error callback functions (default to this). */
    scope?: any
    /**
     * A reference to a function to call with the API results. This
     * function will be passed the following parameters:
     * - userPermsInfo: an object containing properties about the user's permissions.
     * This object will have the following shape:
     *     - container: information about the container and the groups the user belongs to in that container
     *         - id: the container id
     *         - name: the container name
     *         - path: the container path
     *         - roleLabel: (DEPRECATED) a description of the user's permission role in this container. This will correspond
     *           to the visible labels shown on the permissions page (e.g., 'Admin (all permissions)'.
     *         - role: (DEPRECATED) the user's role value (e.g., 'ADMIN'). Use this property for programmatic checks.
     *         - permissions: (DEPRECATED) The user's effective permissions in this container as a bit mask.
     *           Use this with the hasPermission() method to test for specific permissions.
     *         - roles: An array of role unique names that this user is playing in the container. This replaces the
     *           existing roleLabel, role and permissions properties. Users may now play multiple roles in a container
     *           and each role grants the user a set of permissions. Use the getRoles() method to retrieve information
     *           about the roles, including which permissions are granted by each role.
     *         - effectivePermissions: An array of effective permission unique names the user has.
     *         - groups: an array of group objects to which the user belongs, each of which will have the following properties:
     *             - id: the group id
     *             - name: the group's name
     *             - roleLabel: (DEPRECATED) a description of the group's permission role. This will correspond
     *               to the visible labels shown on the permissions page (e.g., 'Admin (all permissions)'.
     *             - role: (DEPRECATED) the group's role value (e.g., 'ADMIN'). Use this property for programmatic checks.
     *             - permissions: (DEPRECATED) The group's effective permissions as a bit mask.
     *               Use this with the hasPermission() method to test for specific permissions.
     *             - roles: An array of role unique names that this group is playing in the container. This replaces the
     *               existing roleLabel, role and permissions properties. Groups may now play multiple roles in a container
     *               and each role grants the user a set of permissions. Use the getRoles() method to retrieve information
     *               about the roles, including which permissions are granted by each role.
     *             - effectivePermissions: An array of effective permission unique names the group has.
     *         - children: if includeSubfolders was true, this will contain an array of objects, each of
     *           which will have the same shape as the parent container object.
     *     - user: information about the requested user
     *         - userId: the user's id
     *         - displayName: the user's display name
     * - response: The XMLHttpResponse object
     */
    success?: (data?: any) => any
    /** The email address (user name) of the user (specify only userId or userEmail, not both) */
    userEmail?: string
    /** The id of the user. Omit to get the current user's information */
    userId?: number
}

/**
 * Returns information about a user's permissions within a container. If you don't specify a user id, this
 * will return information about the current user.
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request
 * (see <a href="http://dev.sencha.com/deploy/dev/docs/?class=Ext.data.Connection&member=abort" target="_blank">Ext.data.Connection.abort</a>).
 * In server-side scripts, this method will return the JSON response object (first parameter of the success or failure callbacks.)
 */
export function getUserPermissions(config: GetUserPermissionsOptions): XMLHttpRequest {
    let params: any = {};

    // TODO: These undefined checked should be !==
    if (config.userId != undefined) {
        params.userId = config.userId;
    }
    else if (config.userEmail != undefined) {
        params.userEmail = config.userEmail;
    }

    if (config.includeSubfolders != undefined) {
        params.includeSubfolders = config.includeSubfolders === true;
    }

    return request({
        url: buildURL('security', 'getUserPerms.api', config.containerPath),
        params,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    })
}

/**
 * Returns true if the permission passed in 'desiredPermission' is in the permissions
 * array passed as 'effectivePermissions'. This is a local function and does not make a call to the server.
 * @param {Array} effectivePermissions The permission set, typically retrieved for a given user or group.
 * @param {String} desiredPermission A specific permission bit to check for.
 * @returns {boolean}
 */
export function hasEffectivePermission(effectivePermissions: Array<string>, desiredPermission: string): boolean {
    for (let i = 0; i < effectivePermissions.length; i++) {
        if (effectivePermissions[i] === desiredPermission) {
            return true;
        }
    }

    return false;
}

/**
 * Returns true if the permission passed in 'perm' is on in the permissions
 * set passed as 'perms'. This is a local function and does not make a call to the server.
 * @param {int} perms The permission set, typically retrieved for a given user or group.
 * @param {int} perm A specific permission bit to check for.
 */
export function hasPermission(perms: number, perm: number): number {
    // TODO: This says it returns true (or implied false), but it really returns 0 or 1.
    // Could change to (perms & perm) === 1, however, that would change the return type.
    return perms & perm;
}