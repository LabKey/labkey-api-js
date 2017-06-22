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

interface AddGroupMembersOptions {
    containerPath?: string
    failure?: () => any
    groupId: number
    principalIds: number | Array<number>
    scope?: any
    success?: () => any
}

/**
 * Adds a new member to an existing group.
 * @param config A configuration object with the following properties:
 * @param {int} config.groupId The id of the group to which you want to add the member.
 * @param {int|int[]} config.principalIds An integer id or array of ids of the users or groups you want to add as members.
 * @param {Function} config.success A reference to a function to call with the API results. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>data:</b> a simple object with a property named "added" that contains the added principal id.</li>
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
export function addGroupMembers(config: AddGroupMembersOptions): XMLHttpRequest {
    return request({
        url: buildURL('security', 'addGroupMember.api', config.containerPath),
        method: 'POST',
        jsonData: {
            groupId: config.groupId,
            principalIds: isArray(config.principalIds) ? config.principalIds : [config.principalIds]
        },
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true /* isErrorCallback */)
    });
}

interface CreateGroupOptions {
    containerPath?: string
    failure?: () => any
    groupName: string
    scope?: any
    success?: () => any
}

/**
 * Creates a new group. The new group will be created at the project level when the current
 * container is a folder or project, or will be created at the system level if the current
 * container is the root.
 * @param config A configuration object with the following properties:
 * @param {String} config.groupName The name of the group to create
 * @param {Function} config.success A reference to a function to call with the API results. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>data:</b> a simple object with two properties: id and name (the new group id and name respectively)</li>
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
export function createGroup(config: CreateGroupOptions): XMLHttpRequest {
    return request({
        url: buildURL('security', 'createGroup.api', config.containerPath),
        method: 'POST',
        jsonData: {
            name: config.groupName
        },
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true /* isErrorCallback */)
    });
}

interface DeleteGroupOptions {
    containerPath?: string
    failure?: () => any
    groupId: number
    scope?: any
    success?: () => any
}

/**
 * Deletes a group.
 * @param config A configuration object with the following properties:
 * @param {int} config.groupId The id of the group to delete
 * @param {Function} config.success A reference to a function to call with the API results. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>data:</b> a simple object with a property named "deleted" that contains the deleted group id.</li>
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
export function deleteGroup(config: DeleteGroupOptions): XMLHttpRequest {
    return request({
        url: buildURL('security', 'deleteGroup.api', config.containerPath),
        method: 'POST',
        jsonData: {
            id: config.groupId
        },
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true /* isErrorCallback */)
    });
}

interface RemoveGroupMembersOptions {
    containerPath?: string
    failure?: () => any
    groupId: number
    principalIds: number | Array<number>
    scope?: any
    success?: () => any
}

/**
 * Removes a member from an existing group.
 * @param config A configuration object with the following properties:
 * @param {int} config.groupId The id of the group from which you want to remove the member.
 * @param {int|int[]} config.principalIds An integer id or array of ids of the users or groups you want to remove.
 * @param {Function} config.success A reference to a function to call with the API results. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>data:</b> a simple object with a property named "removed" that contains the removed principal id.</li>
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
export function removeGroupMembers(config: RemoveGroupMembersOptions): XMLHttpRequest {
    return request({
        url: buildURL('security', 'removeGroupMember.api', config.containerPath),
        method: 'POST',
        jsonData: {
            groupId: config.groupId,
            principalIds: isArray(config.principalIds) ? config.principalIds : [config.principalIds]
        },
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true /* isErrorCallback */)
    });
}

interface RenameGroupOptions {
    containerPath?: string
    failure?: () => any
    groupId: number
    newName: string
    scope?: any
    success?: () => any
}

/**
 * Renames a group.
 * @param config A configuration object with the following properties:
 * @param {int} config.groupId The id of the group to delete
 * @param {String} config.newName The new name for the group
 * @param {Function} config.success A reference to a function to call with the API results. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>data:</b> a simple object with the following properties: 'renamed'=the group id; 'oldName'=the old name; 'newName'=the new name.</li>
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
export function renameGroup(config: RenameGroupOptions): XMLHttpRequest {
    return request({
        url: buildURL('security', 'renameGroup.api', config.containerPath),
        method: 'POST',
        jsonData: {
            id: config.groupId,
            newName: config.newName
        },
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true /* isErrorCallback */)
    });
}