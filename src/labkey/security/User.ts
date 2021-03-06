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
import { getOnSuccess, getCallbackWrapper, getOnFailure, isArray, RequestCallbackOptions } from '../Utils'
import { getLocation, getServerContext, setGlobalUser, User } from '../constants'

declare let window: Window;

export interface NewUser {
    /** The user's email address. */
    email: string
    /** Indicates if the user is newly created. */
    isNew: boolean
    /** HTML message describing how the system handled creation of the user. */
    message: string
    /** The userId of the new user. */
    userId: number
}

export interface CreateNewUserResponse {
    /**
     * The new user's email address.
     * This property will not be available when creating multiple users in same request.
     */
    email?: string
    /**
     * HTML message describing how the system handled creation of the user.
     * This property will not be available when creating multiple users in same request.
     */
    message?: string
    /** Indicates if the user(s) were created successfully. */
    success: boolean
    /**
     * The userId of the new user.
     * This property will not be available when creating multiple users in same request.
     */
    userId?: number
    /** Array of information objects for each user that was created. */
    users: NewUser[]
}

export interface CreateNewUserOptions extends RequestCallbackOptions<CreateNewUserResponse> {
    /**
     * An alternate container path to get permissions from. If not specified,
     * the current container path will be used.
     */
    containerPath?: string
    /** The new user's email address, or a semicolon separated list of email addresses. */
    email: string
    /** An optional message to include in the new user registration email. */
    optionalMessage?: string
    /** Set to false to stop the server from sending a welcome email to the user. */
    sendEmail?: boolean
}

/**
 * Creates a new user account.
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request.
 * In server-side scripts, this method will return the JSON response object
 * (first parameter of the success or failure callbacks.)
 */
export function createNewUser(config: CreateNewUserOptions): XMLHttpRequest {
    return request({
        url: buildURL('security', 'createNewUser.api', config.containerPath),
        method: 'POST',
        jsonData: {
            email: config.email,
            sendEmail: config.sendEmail,
            optionalMessage: config.optionalMessage
        },
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    })
}

export interface EnsureLoginOptions extends RequestCallbackOptions<{currentUser: User}> {
    /**
     * Set to true to force a login even if the user is already logged in. This is useful for
     * keeping a session alive during a long-lived page. To do so, call this function with
     * force set to true, and useSiteLoginPage to false (or omit).
     */
    force?: boolean
    /**
     * Set to true to redirect the browser to the normal site login page. After the user logs in,
     * the browser will be redirected back to the current page, and the current user information
     * will be available via {@link LABKEY.Security.currentUser}. If omitted or set to false,
     * this function will attempt to login via an AJAX request, which will cause the browser to
     * display the basic authentication dialog. After the user logs in successfully, the success
     * function will be called.
     */
    useSiteLoginPage?: boolean
}

/**
 * Ensures that the current user is logged in.
 *
 * Note that if the current user is already logged in, the success function will be called immediately,
 * passing the current user information from {@link LABKEY.Security.currentUser}.
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request.
 * In server-side scripts, this method will return the JSON response object
 * (first parameter of the success or failure callbacks.)
 */
export function ensureLogin(config: EnsureLoginOptions): XMLHttpRequest | void {
    if (getServerContext().user.isGuest || config.force) {
        if (config.useSiteLoginPage) {
            if (typeof(window) !== undefined) {
                window.location.href = buildURL('login', 'login') + '?returnUrl=' + getLocation()
            }
        }
        else {
            return request({
                url: buildURL('security', 'ensureLogin.api'),
                success: getCallbackWrapper(function(data: any, req: any) {
                    if (data.currentUser) {
                        setGlobalUser(data.currentUser);
                    }

                    if (getOnSuccess(config)) {
                        getOnSuccess(config).call(config.scope || this, data, req);
                    }
                }, this),
                failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
            })
        }
    }
    else {
        getOnSuccess(config).call(config.scope);
    }
}

export interface GetUsersResponse {
    /** The path of the requested container. */
    container: string
    /** If "name" property is specified on request, then it's value will be included in the response. */
    name?: string
    /** An array of users matching the request criteria. */
    users: User[]
}

export interface GetUsersOptions extends RequestCallbackOptions<GetUsersResponse> {
    /** This value is used to filter members based on activity (defaults to false). */
    active?: boolean
    /** This value is used to fetch all members in subgroups. */
    allMembers?: boolean
    /**
     * An alternate container path to get permissions from. If not specified,
     * the current container path will be used.
     */
    containerPath?: string
    /** The name of a project group for which you want the members (specify groupId or group, not both). */
    group?: string
    /** The id of a project group for which you want the members. */
    groupId?: number
    /**
     * The first part of the user name, useful for user name completion. If specified,
     * only users whose email address or display name starts with the value supplied will be returned.
     */
    name?: string
    /**
     * A permissions string or an Array of permissions strings.
     * If not present, no permission filtering occurs. If multiple permissions, all permissions are required.
     */
    permissions?: string | string[]
}

/**
 * Returns a list of users given selection criteria. This may be called by any logged-in user.
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request.
 * In server-side scripts, this method will return the JSON response object
 * (first parameter of the success or failure callbacks.)
 */
export function getUsers(config: GetUsersOptions): XMLHttpRequest {
    return getUsersRequest('getUsers.api', config);
}

export interface GetUsersWithPermissionsOptions extends GetUsersOptions {
    /**
     * A permissions string or an Array of permissions strings.
     * If multiple permissions are specified, then all returned users will have all specified permissions.
     */
    permissions: string | string[]
}

/**
 * Retrieves the set of users that have all of a specified set of permissions.  A group
 * may be provided and only users within that group will be returned.  A name (prefix) may be
 * provided and only users whose email or display name starts with the prefix will be returned.
 * This will not return any deactivated users (since they do not have permissions of any sort).
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request.
 * In server-side scripts, this method will return the JSON response object
 * (first parameter of the success or failure callbacks.)
 */
export function getUsersWithPermissions(config: GetUsersWithPermissionsOptions): XMLHttpRequest {
    return getUsersRequest('getUsersWithPermissions.api', config);
}

/**
 * @hidden
 * @private
 */
function getUsersRequest(endpoint: string, config: GetUsersOptions): XMLHttpRequest {
    let params: any = {};

    // TODO: These undefined checked should be !==
    if (config.groupId != undefined) {
        params.groupId = config.groupId;
    }
    else if (config.group != undefined) {
        params.group = config.group;
    }

    if (config.name) {
        params.name = config.name;
    }

    if (config.allMembers != undefined) {
        params.allMembers = config.allMembers;
    }

    if (config.active != undefined) {
        params.active = config.active;
    }

    if (config.permissions != undefined) {
        if (isArray(config.permissions)) {
            params.permissions = config.permissions;
        }
        else {
            params.permissions = [config.permissions];
        }
    }

    return request({
        url: buildURL('user', endpoint, config.containerPath),
        params,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}