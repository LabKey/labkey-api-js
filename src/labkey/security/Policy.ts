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
import { getOnSuccess, getCallbackWrapper, getOnFailure, RequestCallbackOptions, RequestFailure } from '../Utils'

export interface DeletePolicyOptions extends RequestCallbackOptions {
    /**
     * An alternate container path to get permissions from. If not specified,
     * the current container path will be used.
     */
    containerPath?: string
    /** The unique id of the securable resource. */
    resourceId: string
}

/**
 * Deletes the security policy for the requested resource id. This will cause resource to inherit its
 * security policy from its parent resource.
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request.
 * In server-side scripts, this method will return the JSON response object
 * (first parameter of the success or failure callbacks.)
 */
export function deletePolicy(config: DeletePolicyOptions): XMLHttpRequest {
    return request({
        url: buildURL('security', 'deletePolicy.api', config.containerPath),
        method: 'POST',
        jsonData: {
            resourceId: config.resourceId
        },
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}

export interface Policy {
    assignments: {
        role: string
        userId: number
    }[]
    modified: string
    modifiedMillis: number
    resourceId: string
    requestedResourceId: string
}

export interface GetPolicyOptions {
    /**
     * An alternate container path to get permissions from. If not specified,
     * the current container path will be used.
     */
    containerPath?: string
    /** A reference to a function to call when an error occurs. */
    failure?: RequestFailure
    /** The unique id of the securable resource. */
    resourceId: string
    /** A scoping object for the success and error callback functions (default to this). */
    scope?: any
    /** A reference to a function to call with the API results. */
    success?: (policy?: Policy, relevantRoles?: string[], request?: XMLHttpRequest) => any;
}

/**
 * Retrieves the security policy for the requested resource id. Note that this will return the
 * policy in effect for this resource, which might be the policy from a parent resource if there
 * is no explicit policy set on the requested resource. Use the isInherited method on the returned
 * LABKEY.SecurityPolicy object to determine if the policy is inherited or not.
 * Note that the securable resource must be within the current container, or one of its descendants.

 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request.
 * In server-side scripts, this method will return the JSON response object
 * (first parameter of the success or failure callbacks.)
 */
export function getPolicy(config: GetPolicyOptions): XMLHttpRequest {
    return request({
        url: buildURL('security', 'getPolicy.api', config.containerPath),
        jsonData: {
            resourceId: config.resourceId
        },
        success: getCallbackWrapper((data: { policy: Policy, relevantRoles: string[] }, req: XMLHttpRequest) => {
            data.policy.requestedResourceId = config.resourceId;
            getOnSuccess(config).call(config.scope || this, data.policy, data.relevantRoles, req);
        }, this),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}

export interface SavePolicyOptions extends RequestCallbackOptions {
    /**
     * An alternate container path to get permissions from. If not specified,
     * the current container path will be used.
     */
    containerPath?: string
    /** The LABKEY.SecurityPolicy object. */
    policy: any
}

/**
 * Saves the supplied security policy. This object should be a LABKEY.SecurityPolicy object. This
 * method will completely overwrite the existing policy for the resource. If another user has changed
 * the policy in between the time it was selected and this method is called, the save will fail with
 * an optimistic concurrency exception. To force your policy over the other, call the setModified()
 * method on the policy passing null.
 *
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request.
 * In server-side scripts, this method will return the JSON response object
 * (first parameter of the success or failure callbacks.)
 */
export function savePolicy(config: SavePolicyOptions): XMLHttpRequest {
    return request({
        url: buildURL('security', 'savePolicy.api', config.containerPath),
        method: 'POST',
        jsonData: config.policy.policy,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}