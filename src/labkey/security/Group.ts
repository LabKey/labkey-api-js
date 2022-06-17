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

import { Group } from './types';

export interface AddGroupMembersOptions extends RequestCallbackOptions<{ added: number[] }> {
    containerPath?: string;
    /** The id of the group to which you want to add the member. */
    groupId: number;
    /** An integer id or array of ids of the users or groups you want to add as members. */
    principalIds: number | number[];
}

/**
 * Adds a new member to an existing group.
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request.
 * In server-side scripts, this method will return the JSON response object
 * (first parameter of the success or failure callbacks.)
 */
export function addGroupMembers(config: AddGroupMembersOptions): XMLHttpRequest {
    return request({
        url: buildURL('security', 'addGroupMember.api', config.containerPath),
        method: 'POST',
        jsonData: {
            groupId: config.groupId,
            principalIds: isArray(config.principalIds) ? config.principalIds : [config.principalIds],
        },
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
    });
}

export interface CreateGroupResponse {
    /** The groupId for the group that was created */
    id: number;
    /** The name for the group that was created */
    name: string;
}

export interface CreateGroupOptions extends RequestCallbackOptions<CreateGroupResponse> {
    /**
     * An alternate container path to get permissions from. If not specified,
     * the current container path will be used.
     */
    containerPath?: string;
    /** The name of the group to create */
    groupName: string;
}

/**
 * Creates a new group. The new group will be created at the project level when the current
 * container is a folder or project, or will be created at the system level if the current
 * container is the root.
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request.
 * In server-side scripts, this method will return the JSON response object
 * (first parameter of the success or failure callbacks.)
 */
export function createGroup(config: CreateGroupOptions): XMLHttpRequest {
    return request({
        url: buildURL('security', 'createGroup.api', config.containerPath),
        method: 'POST',
        jsonData: {
            name: config.groupName,
        },
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
    });
}

export interface DeleteGroupOptions extends RequestCallbackOptions<{ deleted: number }> {
    /**
     * An alternate container path to get permissions from. If not specified,
     * the current container path will be used.
     */
    containerPath?: string;
    /** The id of the group to delete */
    groupId: number;
}

/**
 * Deletes a group.
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request.
 * In server-side scripts, this method will return the JSON response object
 * (first parameter of the success or failure callbacks.)
 */
export function deleteGroup(config: DeleteGroupOptions): XMLHttpRequest {
    return request({
        url: buildURL('security', 'deleteGroup.api', config.containerPath),
        method: 'POST',
        jsonData: {
            id: config.groupId,
        },
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
    });
}

export interface GetGroupsForCurrentUserResponse {
    /** An array of group information objects. */
    groups: Array<Pick<Group, 'id' | 'isProjectGroup' | 'isSystemGroup' | 'name'>>;
}

export interface GetGroupsForCurrentUserOptions extends RequestCallbackOptions<GetGroupsForCurrentUserResponse> {
    /**
     * An alternate container path to get permissions from. If not specified,
     * the current container path will be used.
     */
    containerPath?: string;
}

export function getGroupsForCurrentUser(config: GetGroupsForCurrentUserOptions): XMLHttpRequest {
    return request({
        url: buildURL('security', 'getGroupsForCurrentUser.api', config.containerPath),
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
    });
}

export interface RemoveGroupMembersOptions extends RequestCallbackOptions<{ removed: number[] }> {
    /**
     * An alternate container path to get permissions from. If not specified,
     * the current container path will be used.
     */
    containerPath?: string;
    /** The id of the group from which you want to remove the member. */
    groupId: number;
    /** An integer id or array of ids of the users or groups you want to remove. */
    principalIds: number | number[];
}

/**
 * Removes a member from an existing group.
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request.
 * In server-side scripts, this method will return the JSON response object
 * (first parameter of the success or failure callbacks.)
 */
export function removeGroupMembers(config: RemoveGroupMembersOptions): XMLHttpRequest {
    return request({
        url: buildURL('security', 'removeGroupMember.api', config.containerPath),
        method: 'POST',
        jsonData: {
            groupId: config.groupId,
            principalIds: isArray(config.principalIds) ? config.principalIds : [config.principalIds],
        },
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
    });
}

export interface RenameGroupResponse {
    /** The new name for the group */
    newName: string;
    /** The old name for the group */
    oldName: string;
    /** The groupId for the renamed group */
    renamed: number;
    /** Indicates if the rename was successful */
    success: boolean;
}

export interface RenameGroupOptions extends RequestCallbackOptions<RenameGroupResponse> {
    /**
     * An alternate container path to get permissions from. If not specified,
     * the current container path will be used.
     */
    containerPath?: string;
    /** The id of the group to rename */
    groupId: number;
    /** The new name for the group */
    newName: string;
}

/**
 * Renames a group.
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request.
 * In server-side scripts, this method will return the JSON response object
 * (first parameter of the success or failure callbacks.)
 */
export function renameGroup(config: RenameGroupOptions): XMLHttpRequest {
    return request({
        url: buildURL('security', 'renameGroup.api', config.containerPath),
        method: 'POST',
        jsonData: {
            id: config.groupId,
            newName: config.newName,
        },
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
    });
}
