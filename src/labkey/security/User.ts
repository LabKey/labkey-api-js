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
import { getLocation, getServerContext, setGlobalUser } from '../constants'

declare let window: Window;

export interface CreateNewUserOptions {
    containerPath?: string
    email: string
    failure?: () => any
    scope?: any
    sendEmail?: boolean
    success?: () => any
}

/**
 * Creates a new user account
 * @param config A configuration object with the following properties:
 * @param {String} config.email The new user's email address.
 * @param {Boolean} config.sendEmail Set to false to stop the server from sending a welcome email to the user.
 * @param {Function} config.success A reference to a function to call with the API results. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>data:</b> a simple object with three properties: userId, email, and message.</li>
 * <li><b>response:</b> The XMLHttpResponse object</li>
 * </ul>
 * @param {Function} [config.failure] A reference to a function to call when an error occurs. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>errorInfo:</b> an object containing detailed error information (may be null)</li>
 * <li><b>response:</b> The XMLHttpResponse object</li>
 * </ul>
 * @param {Object} [config.scope] A scoping object for the success and error callback functions (default to this).
 * @param {string} [config.containerPath] An alternate container path to get permissions from. If not specified,
 * the current container path will be used.
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request
 * (see <a href="http://dev.sencha.com/deploy/dev/docs/?class=Ext.data.Connection&member=abort" target="_blank">Ext.data.Connection.abort</a>).
 * In server-side scripts, this method will return the JSON response object (first parameter of the success or failure callbacks.)
 */
export function createNewUser(config: CreateNewUserOptions): XMLHttpRequest {
    return request({
        url: buildURL('security', 'createNewUser.api', config.containerPath),
        method: 'POST',
        jsonData: {
            email: config.email,
            sendEmail: config.sendEmail === true
        },
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    })
}

export interface EnsureLoginOptions {
    failure?: Function
    force?: boolean
    scope?: any
    success?: Function
    useSiteLoginPage?: boolean
}

/**
 * Ensures that the current user is logged in.
 * @param {object} config A configuration object with the following properties:
 * @param {boolean} [config.useSiteLoginPage] Set to true to redirect the browser to the normal site login page.
 * After the user logs in, the browser will be redirected back to the current page, and the current user information
 * will be available via {@link LABKEY.Security.currentUser}. If omitted or set to false, this function
 * will attempt to login via an AJAX request, which will cause the browser to display the basic authentication
 * dialog. After the user logs in successfully, the config.success function will be called.
 * @param {function} config.success A reference to a function that will be called after a successful login.
 * It is passed the following parameters:
 * <ul>
 *  <li>results: an object with the following properties:
 *      <ul>
 *          <li>currentUser: a reference to the current user. See {@link LABKEY.Security.currentUser} for more details.</li>
 *      </ul>
 *  </li>
 * </ul>
 * Note that if the current user is already logged in, the successCallback function will be called immediately,
 * passing the current user information from {@link LABKEY.Security.currentUser}.
 * @param {function} [config.failure] A reference to a function to call when an error occurs. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>errorInfo:</b> an object containing detailed error information (may be null)</li>
 * <li><b>response:</b> The XMLHttpResponse object</li>
 * </ul>
 * @param {object} [config.scope] A scoping object for the success and error callback functions (default to this).
 * @param {boolean} [config.force] Set to true to force a login even if the user is already logged in.
 * This is useful for keeping a session alive during a long-lived page. To do so, call this function
 * with config.force set to true, and config.useSiteLoginPage to false (or omit).
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request
 * (see <a href="http://dev.sencha.com/deploy/dev/docs/?class=Ext.data.Connection&member=abort" target="_blank">Ext.data.Connection.abort</a>).
 * In server-side scripts, this method will return the JSON response object (first parameter of the success or failure callbacks.)
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

export interface GetUsersOptions {
    active?: boolean
    allMembers?: boolean
    containerPath?: string
    failure?: () => any
    group?: string
    groupId?: number
    name?: string
    permissions?: string | Array<string>
    scope?: any
    success?: () => any
}

/**
 * Returns a list of users given selection criteria. This may be called by any logged-in user.
 * @param config A configuration object containing the following properties
 * @param {int} [config.groupId] The id of a project group for which you want the members.
 * @param {string} [config.group] The name of a project group for which you want the members (specify groupId or group, not both).
 * @param {string} [config.name] The first part of the user name, useful for user name completion. If specified,
 * only users whose email address or display name starts with the value supplied will be returned.
 * @param {boolean} [config.allMembers] This value is used to fetch all members in subgroups.
 * @param {boolean} [config.active] This value is used to filter members based on activity (defaults to false).
 * @param {Mixed} [config.permissions] A permissions string or an Array of permissions strings.
 * If not present, no permission filtering occurs. If multiple permissions, all permissions are required.
 * @param {function} config.success A reference to a function to call with the API results. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>usersInfo:</b> an object with the following shape:
 *  <ul>
 *      <li>users: an array of user objects in the following form:
 *          <ul>
 *              <li>userId: the user's id</li>
 *              <li>displayName: the user's display name</li>
 *              <li>email: the user's email address</li>
 *          </ul>
 *      </li>
 *      <li>container: the path of the requested container</li>
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
export function getUsers(config: GetUsersOptions): XMLHttpRequest {
    let params: any = {};

    // TODO: These undefined checked should be !==
    if (config.groupId != undefined) {
        params.groupId = config.groupId;
    }
    else if (config.group != undefined) {
        params.group = config.group;
    }

    if (config.name != undefined) {
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
        url: buildURL('user', 'getUsers.api', config.containerPath),
        params,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    })
}
