/*
 * Copyright (c) 2016 LabKey Corporation
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
import { AjaxHandler, RequestOptions } from './Ajax'

interface ExtendedXMLHttpRequest extends XMLHttpRequest {
    responseJSON: any
}

var idSeed = 100;

export function alert(title: string, msg: string) {
    console.warn('alert: This is just a stub implementation, request the dom version of the client API : clientapi_dom.lib.xml to get the concrete implementation');
    console.warn(title + ':', msg);
}

/**
 * Returns true if the arguments are case-insensitive equal.
 * Note: the method converts arguments to strings for the purposes of comparing numbers,
 * which means that it will return odd behaviors with objects
 * (ie. LABKEY.Utils.caseInsensitiveEquals({t: 3}, '[object Object]') returns true)
 *
 * @param {String/Number} a The first item to test
 * @param {String/Number} b The second item to test
 * @return {boolean} True if arguments are case-insensitive equal, false if not
 */
export function caseInsensitiveEquals(a: any, b: any): boolean {
    return String(a).toLowerCase() == String(b).toLowerCase();
}

// TODO: Need to remove this from the upper level namespace
export function ensureRegionName(regionName?: string) {
    return regionName || 'query';
}

/**
 * Decodes (parses) a JSON string to an object
 * @param data
 * @returns {}
 */
export function decode(data: any): any {
    return JSON.parse(data + '');
}

export function encode(data: any): string {
    return JSON.stringify(data);
}

/**
 * This is used internally by other class methods to automatically parse returned JSON
 * and call another success function passing that parsed JSON.
 * @param fn The callback function to wrap
 * @param scope The scope for the callback function
 * @param {boolean} [isErrorCallback=false] Set to true if the function is an error callback. If true, and you do not provide a separate callback, alert will popup showing the error message
 */
export function getCallbackWrapper(fn: Function, scope?: any, isErrorCallback?: boolean): AjaxHandler {
    return (response: ExtendedXMLHttpRequest, options: RequestOptions) => {
        let json = response.responseJSON;

        if (!json) {
            // ensure response is JSON before trying to decode
            if (isJSONResponse(response)) {
                try {
                    json = decode(response.responseText);
                }
                catch (error) {
                    // we still want to proceed even if we cannot decode the JSON
                }
            }

            response.responseJSON = json;
        }

        if (!json && isErrorCallback) {
            json = {};
        }

        if (json && !json.exception && isErrorCallback) {
            // Try to make sure we don't show an empty error message
            json.exception = (response && response.statusText ? response.statusText : 'Communication failure.');
        }

        if (fn) {
            fn.call(scope || this, json, response, options);
        }
        else if (isErrorCallback && response.status != 0) {
            // Don't show an error dialog if the user cancelled the request in the browser,
            // like navigating to another page
            alert('Error', json.exception);
        }
    }
}

/**
 *
 * Standard documented name for error callback arguments is "failure" but various other names have been employed in past.
 * This function provides reverse compatibility by picking the failure callback argument out of a config object
 * be it named failure, failureCallback or errorCallback.
 *
 * @param config
 */
export function getOnFailure(config: {errorCallback?: Function, failure?: Function, failureCallback?: Function}): Function {
    return config.failure || config.errorCallback || config.failureCallback;
    // maybe it be desirable for this fall all the way back to returning LABKEY.Utils.displayAjaxErrorResponse?
}

/**
 * Standard documented name for success callback arguments is "success" but various names have been employed in past.
 * This function provides reverse compatibility by picking the success callback argument out of a config object,
 * be it named success or successCallback.
 *
 * @param config
 */
export function getOnSuccess(config: {success?: Function, successCallback?: Function}): Function {
    return config.success || config.successCallback;
}

/**
 * Will generate a unique id. If you provide a prefix, consider making it DOM safe so it can be used as
 * an element id.
 * @param {string} [prefix=lk-gen] - Optional prefix to start the identifier.
 * @returns {string}
 */
export function id(prefix: string): string {
    return (prefix || 'lk-gen') + (++idSeed);
}

export function isArray(value: any): boolean {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
    return Object.prototype.toString.call(value) === '[object Array]';
}

/**
 * Tests whether the passed value can be used as boolean, using a loose definition.
 * Acceptable values for true are: 'true', 'yes', 1, 'on' or 't'.
 * Acceptable values for false are: 'false', 'no', 0, 'off' or 'f'.
 * Values are case-insensitive.
 * @param value The value to test
 * @returns {boolean}
 */
export function isBoolean(value: any): boolean {
    var upperVal = value.toString().toUpperCase();
    if (upperVal == 'TRUE' || value == '1' || upperVal == 'Y' || upperVal == 'YES' || upperVal == 'ON' || upperVal == 'T'
        || upperVal == 'FALSE' || value == '0' || upperVal == 'N' || upperVal == 'NO' || upperVal == 'OFF' || upperVal == 'F') {
        return true;
    }
}

export function isDate(value: any): boolean {
    return Object.prototype.toString.call(value) === '[object Date]';
}

export function isDefined(value: any): boolean {
    return typeof value !== 'undefined';
}

/**
 * Returns true if the passed object is empty (ie. {}) and false if not.
 *
 * @param {Object} obj The object to test
 * @return {Boolean} the result of the test
 */
export function isEmptyObj(obj: any): boolean {
    for (var i in obj) {
        return false;
    }
    return true;
}

export function isFunction(value: any): boolean {
    // http://stackoverflow.com/questions/5999998/how-can-i-check-if-a-javascript-variable-is-function-type
    var getType = {};
    return value && getType.toString.call(value) === '[object Function]';
}

function isJSONResponse(response: ExtendedXMLHttpRequest): boolean {
    return (
        response &&
        response.getResponseHeader &&
        response.getResponseHeader('Content-Type') &&
        response.getResponseHeader('Content-Type').indexOf('application/json') >= 0
    );
}

export function isObject(value: any): boolean {
    return typeof value == "object" && Object.prototype.toString.call(value) === '[object Object]';
}

/**
 * Returns true if the passed value is a string.
 *
 * @param value
 * @returns {boolean}
 */
export function isString(value: any): boolean {
    return typeof value === 'string';
}

export function onError(error: any): void {
    console.warn('onError: This is just a stub implementation, request the dom version of the client API : clientapi_dom.lib.xml to get the concrete implementation');
}

export function onReady(config: any): void {
    console.warn('onReady: This is just a stub implementation, request the dom version of the client API : clientapi_dom.lib.xml to get the concrete implementation');
}

/**
 * Will pad the input string with zeros to the desired length.
 *
 * @param {Number/String} input The input string / number
 * @param {Integer} length The desired length
 * @param {String} padChar The character to use for padding.
 * @return {String} The padded string
 */
export function padString(input: string | number, length: number, padChar: string): string {
    let _input: string;
    if (!isString(input)) {
        _input = input.toString();
    }
    else {
        _input = input as string;
    }

    var pd = '';
    if (length > _input.length) {
        for (var i=0; i < (length - _input.length); i++) {
            pd += padChar;
        }
    }

    return pd + _input;
}

/**
 * Rounds the passed number to the specified number of decimals
 *
 * @param {Number} input The number to round
 * @param {Number} dec The number of decimal places to use
 * @return {Number} The rounded number
 */
export function roundNumber(input: number, dec: number): number {
    return Math.round(input * Math.pow(10, dec)) / Math.pow(10, dec);
}