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
import { getOnSuccess, getCallbackWrapper, getOnFailure } from '../Utils'
import { loadContext } from '../constants'

const LABKEY = loadContext();

interface DeletePolicyOptions {
    containerPath?: string
    failure?: Function
    resourceId: string
    scope?: any
    success?: Function
}

/**
 * Deletes the security policy for the requested resource id. This will cause resource to inherit its
 * security policy from its parent resource.
 * @param config A configuration object with the following properties
 * @param {String} config.resourceId The unique id of the securable resource.
 * @param {Function} config.success A reference to a function to call with the API results. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>data:</b> a simple object with one property called 'success' which will be set to true.</li>
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
export function deletePolicy(config: DeletePolicyOptions): XMLHttpRequest {
    return request({
        url: buildURL('security', 'deletePolicy.api', config.containerPath),
        method: 'POST',
        jsonData: {
            resourceId: config.resourceId
        },
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true /* isErrorCallback */)
    });
}

interface GetPolicyOptions {
    containerPath?: string
    failure?: Function
    resourceId: string
    scope?: any
    success?: Function
}

interface GetPolicyResponse {
    policy: any
    relevantRoles: any
}

/**
 * Retrieves the security policy for the requested resource id. Note that this will return the
 * policy in effect for this resource, which might be the policy from a parent resource if there
 * is no explicit policy set on the requested resource. Use the isInherited method on the returned
 * LABKEY.SecurityPolicy object to determine if the policy is inherited or not.
 * Note that the securable resource must be within the current container, or one of its descendants.
 * @param config A configuration object with the following properties
 * @param {String} config.resourceId The unique id of the securable resource.
 * @param {Function} config.success A reference to a function to call with the API results. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>policy:</b> an instance of a LABKEY.SecurityPolicy object.</li>
 * <li><b>relevantRoles:</b> an array of role ids that are relevant for the given resource.</li>
 * <li><b>response:</b> The XMLHttpResponse object</li>
 * </ul>
 * @param {Function} [config.failure] A reference to a function to call when an error occurs. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>errorInfo:</b> an object containing detailed error information (may be null)</li>
 * <li><b>response:</b> The XMLHttpResponse object</li>
 * </ul>
 * @param {object} [config.scope] A scoping object for the success and error callback functions (default to this).
 * @param {string} [config.containerPath] An alternate container path to get permissions from. If not specified,
 * the current container path will be used.
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request
 * (see <a href="http://dev.sencha.com/deploy/dev/docs/?class=Ext.data.Connection&member=abort" target="_blank">Ext.data.Connection.abort</a>).
 * In server-side scripts, this method will return the JSON response object (first parameter of the success or failure callbacks.)
 */
export function getPolicy(config: GetPolicyOptions): XMLHttpRequest {
    return request({
        url: buildURL('security', 'getPolicy.api', config.containerPath),
        jsonData: {
            resourceId: config.resourceId
        },
        success: getCallbackWrapper(function(data: GetPolicyResponse, req: any) {
            data.policy.requestedResourceId = config.resourceId;
            // TODO: This is an Ext3 class -- should probably just deprecate this entirely and just hand back the response.
            let policy = new LABKEY.SecurityPolicy(data.policy);
            getOnSuccess(config).call(config.scope || this, policy, data.relevantRoles, req);
        }, this),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true /* isErrorCallback */)
    });
}

interface SavePolicyOptions {
    containerPath?: string
    failure?: Function
    policy: any
    scope?: any
    success?: Function
}

/**
 * Saves the supplied security policy. This object should be a LABKEY.SecurityPolicy object. This
 * method will completely overwrite the existing policy for the resource. If another user has changed
 * the policy in between the time it was selected and this method is called, the save will fail with
 * an optimistic concurrency exception. To force your policy over the other, call the setModified()
 * method on the policy passing null.
 * @param config A configuration object with the following properties
 * @param {String} config.policy The LABKEY.SecurityPolicy object
 * @param {Function} config.success A reference to a function to call with the API results. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>data:</b> a simple object with one property called 'success' which will be set to true.</li>
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
export function savePolicy(config: SavePolicyOptions): XMLHttpRequest {
    return request({
        url: buildURL('security', 'savePolicy.api', config.containerPath),
        method: 'POST',
        jsonData: config.policy.policy,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true /* isErrorCallback */)
    });
}