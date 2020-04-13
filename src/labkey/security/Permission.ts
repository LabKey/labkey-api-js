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
import { getOnSuccess, getCallbackWrapper, getOnFailure, RequestCallbackOptions } from '../Utils'

import { roles } from './constants'
import { Group, SecurableResource } from './types'

export interface PermissionsContainer {
    /** If includeSubfolders is true, then this will contain child containers. */
    children?: PermissionsContainer[]
    /** An array of group objects. */
    groups: Group[]
    /** The container id. */
    id: string
    /** True if the container is inheriting permissions from its parent. This is not always provided. */
    isInheritingPerms?: boolean
    /** The container name. */
    name: string
    /** The container path. */
    path: string
}

export interface PermissionsResponse {
    /** Information object describing the container's permission. */
    container: PermissionsContainer
}

export interface GetGroupPermissionsOptions extends RequestCallbackOptions<PermissionsResponse> {
    /**
     * An alternate container path to get permissions from. If not specified,
     * the current container path will be used.
     */
    containerPath?: string
    /** Set to true to recurse down the subfolders (defaults to false) */
    includeSubfolders?: boolean
}

/**
 * Get the effective permissions for all groups within the container, optionally
 * recursing down the container hierarchy.
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request.
 * In server-side scripts, this method will return the JSON response object
 * (first parameter of the success or failure callbacks.)
 */
export function getGroupPermissions(config: GetGroupPermissionsOptions): XMLHttpRequest {
    let params: any = {};

    if (config.includeSubfolders != undefined) {
        params.includeSubfolders = config.includeSubfolders;
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

export interface RolePermission {
    /** The description of the permission. */
    description: string
    /** The name of the permission. */
    name: string
    /** The name of the module in which the permission is defined. */
    sourceModule: string
    /** The unique name of the resource (String, typically a fully-qualified class name). */
    uniqueName: string
}

export interface Role {
    /** The description of the role. */
    description: string
    /** Principals excluded from this role by id. */
    excludedPrincipals: number[]
    /** The name of the role suitable for showing to a user. */
    name: string
    /** An array of permissions the role grants. */
    permissions: RolePermission[]
    /** The name of the module in which the role is defined. */
    sourceModule: string
    /** The unique name of the resource (String, typically a fully-qualified class name). */
    uniqueName: string
}

export interface GetRolesOptions extends RequestCallbackOptions<Role[]> {
    /**
     * An alternate container path to get permissions from. If not specified,
     * the current container path will be used.
     */
    containerPath?: string
}

/**
 * Returns the complete set of roles defined on the server, along with the permissions each role grants.
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request.
 * In server-side scripts, this method will return the JSON response object
 * (first parameter of the success or failure callbacks.)
 */
export function getRoles(config: GetRolesOptions): XMLHttpRequest {
    return request({
        url: buildURL('security', 'getRoles.api', config.containerPath),
        success: getCallbackWrapper(function(data: any, req: any) {
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

export interface SecurableResourceWithPermissions extends SecurableResource {
    /** An object with one property per effectivePermission allowed the user. */
    permissionMap: { [permission:string]: boolean }
}

export interface SchemaPermissionsResponse {
    schemas: {
        study: {
            /** The queries object property with the name of each table/queries. */
            queries: { [queryName:string]: SecurableResourceWithPermissions }
        }
    }
}

export interface GetSchemaPermissionsOptions extends RequestCallbackOptions<SchemaPermissionsResponse> {
    /**
     * An alternate container path to get permissions from. If not specified,
     * the current container path will be used.
     */
    containerPath?: string
    /** Name of the schema to retrieve information on. Currently only works for "study". */
    schemaName: 'study'
}

/**
 * EXPERIMENTAL! gets permissions for a set of tables within the study schema.
 * Currently only study tables have individual permissions so only works on the study schema
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request.
 * In server-side scripts, this method will return the JSON response object
 * (first parameter of the success or failure callbacks.)
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

export interface GetSecurableResourcesOptions extends RequestCallbackOptions<{resources: SecurableResource}> {
    /**
     * An alternate container path to get permissions from. If not specified,
     * the current container path will be used.
     */
    containerPath?: string
    /**
     * If set to true, the response will include the
     * list of effective permissions (unique names) the current user has to each resource (defaults to false).
     * These permissions are calculated based on the current user's group memberships and role assignments, and
     * represent the actual permissions the user has to these resources at the time of the API call.
     */
    includeEffectivePermissions?: boolean
    /**
     * If set to true, the response will include subfolders
     * and their contained securable resources (defaults to false).
     */
    includeSubfolders?: boolean
}

/**
 * Returns the tree of securable resources from the current container downward.
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request.
 * In server-side scripts, this method will return the JSON response object
 * (first parameter of the success or failure callbacks.)
 */
export function getSecurableResources(config: GetSecurableResourcesOptions): XMLHttpRequest {
    let params: any = {};

    if (config.includeSubfolders != undefined) {
        params.includeSubfolders = config.includeSubfolders;
    }
    if (config.includeEffectivePermissions != undefined) {
        params.includeEffectivePermissions = config.includeEffectivePermissions;
    }

    return request({
        url: buildURL('security', 'getSecurableResources.api', config.containerPath),
        params,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    })
}

export interface UserPermissionsContainer extends PermissionsContainer {
    /** An array of effective permission unique names the user has in this container. */
    effectivePermissions: string[]
    /**
     * @deprecated
     * The permissions the current user has in the container.
     */
    permissions: number
    /**
     * @deprecated
     * The user's role value (e.g., 'READER'). Use this property for programmatic checks.
     */
    role: string
    /**
     * @deprecated
     * A description of the group's permission role. This will correspond
     * to the visible labels shown on the permissions page (e.g., 'Admin (all permissions)'.
     */
    roleLabel: string
    /**
     * An array of role unique names that this group is playing in the container. This replaces the
     * existing roleLabel, role and permissions properties. Groups may now play multiple roles in a container
     * and each role grants the user a set of permissions. Use the getRoles() method to retrieve information
     * about the roles, including which permissions are granted by each role.
     */
    roles: string[]
}

export interface GetUserPermissionsResponse {
    /** Information object describing the container's permission. */
    container: UserPermissionsContainer
    /** Information object describing the user. */
    user: {
        /** The user's display name. */
        displayName: string
        /** The user's id. */
        userId: number
    }
}

export interface GetUserPermissionsOptions extends RequestCallbackOptions<GetUserPermissionsResponse> {
    /**
     * An alternate container path to get permissions from. If not specified,
     * the current container path will be used.
     */
    containerPath?: string
    /** Set to true to recurse down the subfolders (defaults to false) */
    includeSubfolders?: boolean
    /** The email address (user name) of the user (specify only userId or userEmail, not both) */
    userEmail?: string
    /** The id of the user. Omit to get the current user's information */
    userId?: number
}

/**
 * Returns information about a user's permissions within a container.
 * If an user id is not specified, then this will return information about the current user.
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request.
 * In server-side scripts, this method will return the JSON response object
 * (first parameter of the success or failure callbacks.)
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
        params.includeSubfolders = config.includeSubfolders;
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
 * @param effectivePermissions The permission set, typically retrieved for a given user or group.
 * @param desiredPermission A specific permission bit to check for.
 */
export function hasEffectivePermission(effectivePermissions: string[], desiredPermission: string): boolean {
    return effectivePermissions.some((ep) => ep === desiredPermission);
}

/**
 * Returns 1 if the permission passed in 'perm' is on in the permissions
 * set passed as 'perms'. This is a local function and does not make a call to the server.
 * @param perms The permission set, typically retrieved for a given user or group.
 * @param perm A specific permission bit to check for.
 */
export function hasPermission(perms: number, perm: number): number {
    // TODO: This says it returns true (or implied false), but it really returns 0 or 1.
    // Could change to (perms & perm) === 1, however, that would change the return type.
    return perms & perm;
}