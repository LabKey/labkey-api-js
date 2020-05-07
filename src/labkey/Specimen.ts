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
import { buildURL } from './ActionURL'
import { request } from './Ajax'
import {
    displayAjaxErrorResponse,
    getCallbackWrapper,
    getOnFailure,
    getOnSuccess,
    isFunction,
    RequestCallbackOptions,
    RequestFailure,
    RequestSuccess
} from './Utils'

export interface AddSamplesToRequestOptions extends RequestCallbackOptions {
    containerPath?: string
    preferredLocation: number
    requestId: number
    specimenHashArray: any[]
}

/**
 * Adds multiple vials to a request based on an array of hash codes uniquely identifying the primary specimens.
 * The vials will be selected based on availability and current location. If called by a non-administrator,
 * the target request must be owned by the calling user, and the request must be in an open (not yet submitted)
 * state. Administrators may add vials to any request at any time.
 * @param options
 */
export function addSamplesToRequest(options: AddSamplesToRequestOptions): XMLHttpRequest {
    if (remapArguments(options, arguments)) {
        options = {
            success: arguments[0],
            requestId: arguments[1],
            specimenHashArray: arguments[2],
            preferredLocation: arguments[3],
            failure: arguments[4],
            containerPath: arguments[5]
        };
    }

    return request({
        url: buildURL('study-samples-api', 'addSamplesToRequest.api', options.containerPath),
        method: 'POST',
        jsonData: {
            preferredLocation: options.preferredLocation,
            requestId: options.requestId,
            specimenHashes: options.specimenHashArray
        },
        success: getCallbackWrapper(onSpecimenSuccess(options), options.scope),
        failure: getCallbackWrapper(rebindFailure(getOnFailure(options)), options.scope, true)
    });
}

export interface AddVialsToRequestOptions extends RequestCallbackOptions {
    containerPath?: string
    idType?: string
    requestId: number
    vialIdArray: any[]
}

/**
 * Adds multiple vials to a request based on an array of unique unique vial IDs.  If called by a non-administrator,
 * the target request must be owned by the calling user, and the request must be in an open (not yet submitted)
 * state.  Administrators may add vials to any request at any time.
 * @param options
 */
export function addVialsToRequest(options: AddVialsToRequestOptions): XMLHttpRequest {
    if (remapArguments(options, arguments)) {
        options = {
            success: arguments[0],
            requestId: arguments[1],
            vialIdArray: arguments[2],
            idType: arguments[3],
            failure: arguments[4],
            containerPath: arguments[5]
        };
    }

    if (!options.idType) {
        options.idType = 'GlobalUniqueId';
    }

    return request({
        url: buildURL('study-samples-api', 'addVialsToRequest.api', options.containerPath),
        method: 'POST',
        jsonData: {
            idType: options.idType,
            requestId: options.requestId,
            vialIds: options.vialIdArray
        },
        success: getCallbackWrapper(onSpecimenSuccess(options), options.scope),
        failure: getCallbackWrapper(rebindFailure(getOnFailure(options)), options.scope, true)
    });
}

export interface CancelRequestOptions extends RequestCallbackOptions {
    containerPath?: string
    requestId: number
}

/**
 * Completely and permanently cancels a request. THIS ACTION CANNOT BE UNDONE.
 * If called by a non-administrator, the target request must be owned by the
 * calling user, and the request must be in an open (not yet submitted) state. Administrators may delete
 * requests at any time.
 * @param options
 */
export function cancelRequest(options: CancelRequestOptions): XMLHttpRequest {
    if (remapArguments(options, arguments)) {
        options = {
            success: arguments[0],
            requestId: arguments[1],
            failure: arguments[2],
            containerPath: arguments[3]
        };
    }

    return request({
        url: buildURL('study-samples-api', 'cancelRequest.api', options.containerPath),
        method: 'POST',
        jsonData: {
            requestId: options.requestId
        },
        success: getCallbackWrapper(onSpecimenSuccess(options), options.scope),
        failure: getCallbackWrapper(rebindFailure(getOnFailure(options)), options.scope, true)
    });
}

export interface GetOpenRequestsOptions extends RequestCallbackOptions {
    containerPath?: string
    allUsers?: boolean
}

/**
 * Retrieves an array of open (non-final) specimen requests, including all requests that are in "shopping cart"
 * status as well as those that have been submitted for processing but are not yet complete.
 * @param options
 */
export function getOpenRequests(options: GetOpenRequestsOptions): XMLHttpRequest {
    if (remapArguments(options, arguments)) {
        options = {
            success: arguments[0],
            allUsers: arguments[1],
            failure: arguments[2],
            containerPath: arguments[3]
        };
    }

    return request({
        url: buildURL('study-samples-api', 'getOpenRequests.api', options.containerPath),
        method: 'POST',
        jsonData: {
            allUsers: options.allUsers
        },
        success: getCallbackWrapper(
            onSpecimenSuccess(options),
            options.scope,
            false,
            (data) => data.requests),
        failure: getCallbackWrapper(rebindFailure(getOnFailure(options)), options.scope, true)
    });
}

export interface GetProvidingLocationsOptions extends RequestCallbackOptions {
    containerPath?: string
    specimenHashArray: string[]
}

/**
 * Retrieves an array of locations that could provide vials from all identified primary specimens.
 * @param options
 */
export function getProvidingLocations(options: GetProvidingLocationsOptions): XMLHttpRequest {
    if (remapArguments(options, arguments)) {
        options = {
            success: arguments[0],
            specimenHashArray: arguments[1],
            failure: arguments[2],
            containerPath: arguments[3]
        };
    }

    return request({
        url: buildURL('study-samples-api', 'getProvidingLocations.api', options.containerPath),
        method: 'POST',
        jsonData: {
            specimenHashes: options.specimenHashArray
        },
        success: getCallbackWrapper(
            onSpecimenSuccess(options),
            options.scope,
            false,
            (data) => data.locations),
        failure: getCallbackWrapper(rebindFailure(getOnFailure(options)), options.scope, true)
    });
}

export interface GetRepositoriesOptions extends RequestCallbackOptions {
    containerPath?: string
}

/**
 * Retrieves an array of locations that are identified as specimen repositories.
 * @param options
 */
export function getRepositories(options: GetRepositoriesOptions): XMLHttpRequest {
    if (remapArguments(options, arguments)) {
        options = {
            success: arguments[0],
            failure: arguments[1],
            containerPath: arguments[2]
        }
    }

    return request({
        url: buildURL('study-samples-api', 'getRepositories.api', options.containerPath),
        method: 'POST',
        // No jsonData, still json request
        headers: {
            'Content-Type': 'application/json'
        },
        success: getCallbackWrapper(
            onSpecimenSuccess(options),
            options.scope,
            false,
            (data) => data.repositories),
        failure: getCallbackWrapper(rebindFailure(getOnFailure(options)), options.scope, true)
    });
}

export interface GetRequestOptions extends RequestCallbackOptions {
    containerPath?: string
    requestId: number
}

/**
 * Retrieves a specimen request for a given specimen request ID.
 * @param options
 */
export function getRequest(options: GetRequestOptions): XMLHttpRequest {
    if (remapArguments(options, arguments)) {
        options = {
            success: arguments[0],
            requestId: arguments[1],
            failure: arguments[2],
            containerPath: arguments[3]
        }
    }

    return request({
        url: buildURL('study-samples-api', 'getRequest.api', options.containerPath),
        method: 'POST',
        jsonData: {
            requestId: options.requestId
        },
        success: getCallbackWrapper(
            onSpecimenSuccess(options),
            options.scope,
            false,
            (data) => data.request),
        failure: getCallbackWrapper(rebindFailure(getOnFailure(options)), options.scope, true)
    });
}

export interface GetSpecimenWebPartGroupsOptions extends RequestCallbackOptions {
    containerPath?: string
}

/**
 * Retrieves a specimen request for a given specimen request ID.
 * @param options
 */
export function getSpecimenWebPartGroups(options: GetSpecimenWebPartGroupsOptions): XMLHttpRequest {
    return request({
        url: buildURL('study-samples-api', 'getSpecimenWebPartGroups.api', options.containerPath),
        method: 'POST',
        // No jsonData, still json request
        headers: {
            'Content-Type': 'application/json'
        },
        success: getCallbackWrapper(onSpecimenSuccess(options), options.scope),
        failure: getCallbackWrapper(rebindFailure(getOnFailure(options)), options.scope, true)
    });
}

export interface GetVialsByRowIdOptions extends RequestCallbackOptions {
    containerPath?: string
    vialRowIdArray: any[]
}

/**
 * Retrieves an array of vials that correspond to an array of unique vial row ids.
 * @param options
 */
export function getVialsByRowId(options: GetVialsByRowIdOptions): XMLHttpRequest {
    if (remapArguments(options, arguments)) {
        options = {
            success: arguments[0],
            vialRowIdArray: arguments[1],
            failure: arguments[2],
            containerPath : arguments[3]
        };
    }

    return request({
        url: buildURL('study-samples-api', 'getVialsByRowId.api', options.containerPath),
        method: 'POST',
        jsonData: {
            rowIds: options.vialRowIdArray
        },
        success: getCallbackWrapper(
            onSpecimenSuccess(options),
            options.scope,
            false,
            (data) => data.vials),
        failure: getCallbackWrapper(rebindFailure(getOnFailure(options)), options.scope, true)
    });
}

export interface GetVialTypeSummaryOptions extends RequestCallbackOptions {
    containerPath?: string
}

/**
 * Retrieves a specimen request for a given specimen request ID.
 * @param options
 */
export function getVialTypeSummary(options: GetVialTypeSummaryOptions): XMLHttpRequest {
    return request({
        url: buildURL('study-samples-api', 'getVialTypeSummary.api', options.containerPath),
        method: 'POST',
        // No jsonData, still json request
        headers: {
            'Content-Type': 'application/json'
        },
        success: getCallbackWrapper(onSpecimenSuccess(options), options.scope),
        failure: getCallbackWrapper(rebindFailure(getOnFailure(options)), options.scope, true)
    });
}

export interface RemoveVialsFromRequestOptions extends RequestCallbackOptions {
    containerPath?: string
    idType?: string
    requestId: number
    vialIdArray: any[]
}

/**
 * Removes multiple vials from a request based on an array of vial row IDs.  If called by a non-administrator,
 * the target request must be owned by the calling user, and the request must be in an open (not yet submitted)
 * state.  Administrators may remove vials from any request at any time.
 * @param options
 */
export function removeVialsFromRequest(options: RemoveVialsFromRequestOptions): XMLHttpRequest {
    if (remapArguments(options, arguments)) {
        options = {
            success: arguments[0],
            requestId: arguments[1],
            vialIdArray: arguments[2],
            idType: arguments[3],
            failure: arguments[4],
            containerPath: arguments[5]
        };
    }

    if (!options.idType) {
        options.idType = 'GlobalUniqueId';
    }

    return request({
        url: buildURL('study-samples-api', 'removeVialsFromRequest', options.containerPath),
        method: 'POST',
        jsonData: {
            idType: options.idType,
            requestId: options.requestId,
            vialIds: options.vialIdArray
        },
        success: getCallbackWrapper(onSpecimenSuccess(options), options.scope),
        failure: getCallbackWrapper(rebindFailure(getOnFailure(options)), options.scope, true)
    });
}

/**
 * @hidden
 * @private
 */
function onSpecimenSuccess(options: RequestCallbackOptions): RequestSuccess {
    const success = getOnSuccess(options);
    const { scope } = options;

    if (success) {
        if (scope) {
            // Explicit scope requested. Let getCallbackWrapper() handle scoped callback.
            return success;
        } else {
            // backward compatibility: maintain caller's scope.
            // Cannot use "return success" as this would alter scope.
            return function(data, request, requestOptions): void {
                success(data, request, requestOptions);
            };
        }
    }

    // success not specified
    return undefined;
}

/**
 * @hidden
 * @private
 */
function remapArguments(options: any, args: IArguments): boolean {
    return options && (isFunction(options) || args.length > 1);
}

/**
 * @hidden
 * @private
 */
const REBIND: RequestFailure = (err, response): any => displayAjaxErrorResponse(response, err);

/**
 * @hidden
 * @private
 */
function rebindFailure(failure?: RequestFailure): RequestFailure {
    return failure ?? REBIND;
}