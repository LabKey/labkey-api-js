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
import { buildURL } from './ActionURL'
import { AjaxHandler, request } from './Ajax'
import { displayAjaxErrorResponse, getCallbackWrapper, getOnFailure, getOnSuccess, isFunction } from './Utils'

interface APIOptions {
    containerPath?: string
    failure?: Function
    success: Function
}

interface IAddSamplesToRequestOptions extends APIOptions {
    preferredLocation: number
    requestId: number
    specimenHashArray: Array<any>
}

/**
 * Adds multiple vials to a request based on an array of hash codes uniquely identifying the primary specimens.  The vials will
 * be selected based on availability and current location.  If called by a non-administrator, the target request must be owned by the
 * calling user, and the request must be in an open (not yet submitted) state.  Administrators may add vials
 * to any request at any time.
 * @param options
 */
export function addSamplesToRequest(options: IAddSamplesToRequestOptions): void {


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

    request({
        url: buildURL('study-samples-api', 'addSamplesToRequest', options.containerPath),
        method: 'POST',
        jsonData: {
            preferredLocation: options.preferredLocation,
            requestId: options.requestId,
            specimenHashes: options.specimenHashArray
        },
        success: getSuccessCallbackWrapper(getOnSuccess(options)),
        failure: getCallbackWrapper(rebindFailure(getOnFailure(options)), this, true /* isErrorCallback */)
    });
}

interface IAddVialsToRequestOptions extends APIOptions {
    idType?: string
    requestId: number
    vialIdArray: Array<any>
}

/**
 * Adds multiple vials to a request based on an array of unique unique vial IDs.  If called by a non-administrator,
 * the target request must be owned by the calling user, and the request must be in an open (not yet submitted)
 * state.  Administrators may add vials to any request at any time.
 * @param options
 */
export function addVialsToRequest(options: IAddVialsToRequestOptions): void {

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

    request({
        url: buildURL('study-samples-api', 'addVialsToRequest', options.containerPath),
        method: 'POST',
        jsonData: {
            idType: options.idType,
            requestId: options.requestId,
            vialIds: options.vialIdArray
        },
        success: getSuccessCallbackWrapper(options.success),
        failure: getCallbackWrapper(rebindFailure(options.failure), this, true /* isErrorCallback */)
    });
}

interface ICancelRequestOptions extends APIOptions {
    requestId: number
}

/**
 * Completely and permanently cancels a request. THIS ACTION CANNOT BE UNDONE.
 * If called by a non-administrator, the target request must be owned by the
 * calling user, and the request must be in an open (not yet submitted) state. Administrators may delete
 * requests at any time.
 * @param options
 */
export function cancelRequest(options: ICancelRequestOptions): void {

    if (remapArguments(options, arguments)) {
        options = {
            success: arguments[0],
            requestId: arguments[1],
            failure: arguments[2],
            containerPath: arguments[3]
        };
    }

    request({
        url: buildURL('study-samples-api', 'cancelRequest', options.containerPath),
        method: 'POST',
        jsonData: {
            requestId: options.requestId
        },
        success: getSuccessCallbackWrapper(options.success),
        failure: getCallbackWrapper(rebindFailure(options.failure), this, true /* isErrorCallback */)
    });
}

interface IGetOpenRequestsOptions extends APIOptions {
    allUsers?: boolean
}

/**
 * Retrieves an array of open (non-final) specimen requests, including all requests that are in "shopping cart"
 * status as well as those that have been submitted for processing but are not yet complete.
 * @param options
 */
export function getOpenRequests(options: IGetOpenRequestsOptions): void {

    if (remapArguments(options, arguments)) {
        options = {
            success: arguments[0],
            allUsers: arguments[1],
            failure: arguments[2],
            containerPath: arguments[3]
        };
    }

    request({
        url: buildURL('study-samples-api', 'getOpenRequests', options.containerPath),
        method: 'POST',
        jsonData: {
            allUsers: options.allUsers
        },
        success: getSuccessCallbackWrapper(options.success, 'requests'),
        failure: getCallbackWrapper(rebindFailure(options.failure), this, true /* isErrorCallback */)
    });
}

interface IGetProvidingLocationsOptions extends APIOptions {
    specimenHashArray: Array<string>
}

/**
 * Retrieves an array of locations that could provide vials from all identified primary specimens.
 * @param options
 */
export function getProvidingLocations(options: IGetProvidingLocationsOptions): void {

    if (remapArguments(options, arguments)) {
        options = {
            success: arguments[0],
            specimenHashArray: arguments[1],
            failure: arguments[2],
            containerPath: arguments[3]
        };
    }

    request({
        url: buildURL('study-samples-api', 'getProvidingLocations', options.containerPath),
        method: 'POST',
        jsonData: {
            specimenHashes: options.specimenHashArray
        },
        success: getSuccessCallbackWrapper(options.success, 'locations'),
        failure: getCallbackWrapper(rebindFailure(options.failure), this, true /* isErrorCallback */)
    });
}

/**
 * Retrieves an array of locations that are identified as specimen repositories.
 * @param options
 */
export function getRepositories(options: APIOptions): void {

    if (remapArguments(options, arguments)) {
        options = {
            success: arguments[0],
            failure: arguments[1],
            containerPath: arguments[2]
        }
    }

    request({
        url: buildURL('study-samples-api', 'getRespositories', options.containerPath),
        method: 'POST',
        // No jsonData, still json request
        headers: {
            'Content-Type': 'application/json'
        },
        success: getSuccessCallbackWrapper(options.success, 'repositories'),
        failure: getCallbackWrapper(options.failure || displayAjaxErrorResponse, this, true /* isErrorCallback */)
    });
}

interface IGetRequestOptions extends APIOptions {
    requestId: number
}

/**
 * Retrieves a specimen request for a given specimen request ID.
 * @param options
 */
export function getRequest(options: IGetRequestOptions): void {

    if (remapArguments(options, arguments)) {
        options = {
            success: arguments[0],
            requestId: arguments[1],
            failure: arguments[2],
            containerPath: arguments[3]
        }
    }

    request({
        url: buildURL('study-samples-api', 'getRequest', options.containerPath),
        method: 'POST',
        jsonData: {
            requestId: options.requestId
        },
        success: getSuccessCallbackWrapper(options.success, 'request'),
        failure: getCallbackWrapper(rebindFailure(options.failure), this, true /* isErrorCallback */)
    });
}

/**
 * Retrieves a specimen request for a given specimen request ID.
 * @param options
 */
export function getSpecimenWebPartGroups(options: APIOptions): void {

    request({
        url: buildURL('study-samples-api', 'getSpecimenWebPartGroups', options.containerPath),
        method: 'POST',
        // No jsonData, still json request
        headers: {
            'Content-Type': 'application/json'
        },
        success: getSuccessCallbackWrapper(options.success),
        failure: getCallbackWrapper(rebindFailure(options.failure), this, true /* isErrorCallback */)
    });
}

function getSuccessCallbackWrapper(success: any, root?: string): AjaxHandler {

    return getCallbackWrapper((data: any) => {
        success(root ? data[root] : data);
    }, this);
}

interface IGetVialsByRowIdOptions extends APIOptions {
    vialRowIdArray: Array<any>
}

/**
 * Retrieves an array of vials that correspond to an array of unique vial row ids.
 * @param options
 */
export function getVialsByRowId(options: IGetVialsByRowIdOptions): void {

    if (remapArguments(options, arguments)) {
        options = {
            success: arguments[0],
            vialRowIdArray: arguments[1],
            failure: arguments[2],
            containerPath : arguments[3]
        };
    }

    request({
        url: buildURL('study-samples-api', 'getVialsByRowId', options.containerPath),
        method: 'POST',
        jsonData: {
            rowIds: options.vialRowIdArray
        },
        success: getSuccessCallbackWrapper(options.success, 'vials'),
        failure: getCallbackWrapper(options.failure || displayAjaxErrorResponse, this, true /* isErrorCallback */)
    });
}

/**
 * Retrieves a specimen request for a given specimen request ID.
 * @param options
 */
export function getVialTypeSummary(options: APIOptions): void {

    request({
        url: buildURL('study-samples-api', 'getVialTypeSummary', options.containerPath),
        method: 'POST',
        // No jsonData, still json request
        headers: {
            'Content-Type': 'application/json'
        },
        success: getSuccessCallbackWrapper(options.success),
        failure: getCallbackWrapper(rebindFailure(options.failure), this, true /* isErrorCallback */)
    });
}

const REBIND = (err: any, response: any): any => {
    return displayAjaxErrorResponse(response, err);
};

/**
 * Unfortunately, we need to reverse our parameter order here- LABKEY.Utils uses inconsistent
 * ordering for its default callback and callback wrapper functions.
 * @param failure
 * @returns {any}
 */
function rebindFailure(failure?: Function): Function {

    if (failure) {
        return failure;
    }

    return REBIND;
}

interface IRemoveVialsFromRequestOptions extends APIOptions {
    idType?: string
    requestId: number
    vialIdArray: Array<any>
}

/**
 * Removes multiple vials from a request based on an array of vial row IDs.  If called by a non-administrator,
 * the target request must be owned by the calling user, and the request must be in an open (not yet submitted)
 * state.  Administrators may remove vials from any request at any time.
 * @param options
 */
export function removeVialsFromRequest(options: IRemoveVialsFromRequestOptions): void {

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

    request({
        url: buildURL('study-samples-api', 'removeVialsFromRequest', options.containerPath),
        method: 'POST',
        jsonData: {
            idType: options.idType,
            requestId: options.requestId,
            vialIds: options.vialIdArray
        },
        success: getSuccessCallbackWrapper(options.success),
        failure: getCallbackWrapper(rebindFailure(options.failure), this, true /* isErrorCallback */)
    });
}

function remapArguments(options: any, args: any): boolean {
    return options && (isFunction(options) || args.length > 1);
}