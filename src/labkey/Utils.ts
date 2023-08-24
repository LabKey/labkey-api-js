/*
 * Copyright (c) 2016-2018 LabKey Corporation
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
import { getServerContext } from './constants';
import { AjaxHandler, RequestOptions } from './Ajax';
import { buildURL } from './ActionURL';

export interface ExtendedXMLHttpRequest extends XMLHttpRequest {
    responseJSON: any;
}

export type RequestFailure<E = any> = (errorInfo: E, response: XMLHttpRequest) => any;
export type RequestSuccess<D = any> = (data: D, request: ExtendedXMLHttpRequest, config: RequestOptions) => any;

export interface RequestCallbackOptions<S = any, F = any, SC = any> {
    /**
     * This will be called upon failure to complete a request.
     */
    failure?: RequestFailure<F>;

    /**
     * A scoping object for the success and failure callback functions (default to this).
     */
    scope?: SC;

    /**
     * This will be called upon successfully completing a request.
     */
    success?: RequestSuccess<S>;
}

/**
 * Private array of chars to use for UUID generation
 * @private
 */
const CHARS = '0123456789abcdefghijklmnopqrstuvwxyz'.split('');

/**
 * @private
 */
const ENUMERABLES = [
    'hasOwnProperty',
    'valueOf',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'toLocaleString',
    'toString',
    'constructor',
];

/**
 * @private
 */
const ID_PREFIX = 'lk-gen';

/**
 * @private
 */
let idSeed = 100;

/**
 * When using Ext dateFields you can use DATEALTFORMATS for the altFormat: config option.
 * @private
 */
const DATEALTFORMATS_Either = [
    'j-M-y g:i a|j-M-Y g:i a|j-M-y G:i|j-M-Y G:i|',
    'j-M-y|j-M-Y|',
    'Y-n-d H:i:s|Y-n-d|',
    'Y/n/d H:i:s|Y/n/d|',
    'j M Y G:i:s O|', // 10 Sep 2009 11:24:12 -0700
    'j M Y H:i:s|c',
].join('');

/**
 * @private
 */
const DATEALTFORMATS_MonthDay = [
    'n/j/y g:i:s a|n/j/Y g:i:s a|n/j/y G:i:s|n/j/Y G:i:s|',
    'n-j-y g:i:s a|n-j-Y g:i:s a|n-j-y G:i:s|n-j-Y G:i:s|',
    'n/j/y g:i a|n/j/Y g:i a|n/j/y G:i|n/j/Y G:i|',
    'n-j-y g:i a|n-j-Y g:i a|n-j-y G:i|n-j-Y G:i|',
    'n/j/y|n/j/Y|',
    'n-j-y|n-j-Y|',
    DATEALTFORMATS_Either,
].join('');

/**
 * @private
 */
const DATEALTFORMATS_DayMonth = [
    'j/n/y g:i:s a|j/n/Y g:i:s a|j/n/y G:i:s|j/n/Y G:i:s|',
    'j-n-y g:i:s a|j-n-Y g:i:s a|j-n-y G:i:s|j-n-Y G:i:s|',
    'j/n/y g:i a|j/n/Y g:i a|j/n/y G:i|j/n/Y G:i|',
    'j-n-y g:i a|j-n-Y g:i a|j-n-y G:i|j-n-Y G:i|',
    'j/n/y|j/n/Y|',
    'j-n-y|j-n-Y|',
    'j-M-y|j-M-Y|',
].join('');

/**
 * 24 hr format with milliseconds
 * @private
 */
const DATETIMEFORMAT_WithMS = 'Y-m-d H:i:s.u';

/**
 * @private
 */
function _copy(o: any, depth: any): any {
    if (depth == 0 || !isObject(o)) {
        return o;
    }
    const copy: any = {};
    for (const key in o) {
        copy[key] = _copy(o[key], depth - 1);
    }
    return copy;
}

// like a general version of Ext.apply() or mootools.merge()
/**
 * @private
 */
function _merge(to: any, from: any, overwrite: any, depth: any): void {
    for (const key in from) {
        if (from.hasOwnProperty(key)) {
            if (isObject(to[key]) && isObject(from[key])) {
                _merge(to[key], from[key], overwrite, depth - 1);
            } else if (undefined === to[key] || overwrite) {
                to[key] = _copy(from[key], depth - 1);
            }
        }
    }
}

/**
 * Applies config properties to the specified object.
 */
export function apply(object: any, config: any): any {
    if (object && config && typeof config === 'object') {
        let i, j, k;

        for (i in config) {
            object[i] = config[i];
        }

        for (j = ENUMERABLES.length; j--; ) {
            k = ENUMERABLES[j];
            if (config.hasOwnProperty(k)) {
                object[k] = config[k];
            }
        }
    }

    return object;
}

/**
 * Applies properties from the source object to the target object, translating
 * the property names based on the translation map. The translation map should
 * have an entry per property that you wish to rename when it is applied on
 * the target object. The key should be the name of the property on the source object
 * and the value should be the desired name on the target object. The value may
 * also be set to null or false to prohibit that property from being applied.
 * By default, this function will also apply all other properties on the source
 * object that are not listed in the translation map, but you can override this
 * by supplying false for the applyOthers parameter.
 * @param target The target object
 * @param source The source object
 * @param translationMap A map listing property name translations
 * @param applyOthers Set to false to prohibit application of properties
 * not explicitly mentioned in the translation map.
 * @param applyFunctions Set to false to prohibit application of properties
 * that are functions
 */
export function applyTranslated(
    target: any,
    source: any,
    translationMap: any,
    applyOthers?: boolean,
    applyFunctions?: boolean
): void {
    if (undefined === target) {
        target = {};
    }
    if (undefined === applyOthers) {
        applyOthers = true;
    }
    if (undefined == applyFunctions && applyOthers) {
        applyFunctions = true;
    }

    let targetPropName;
    for (const prop in source) {
        if (source.hasOwnProperty(prop)) {
            // special case: Ext adds a "constructor" property to every object, which we don't want to apply
            if (prop == 'constructor' || isFunction(prop)) {
                continue;
            }

            targetPropName = translationMap[prop];
            if (targetPropName) {
                target[translationMap[prop]] = source[prop];
            } else if (undefined === targetPropName && applyOthers && (applyFunctions || !isFunction(source[prop]))) {
                target[prop] = source[prop];
            }
        }
    }
}

// needed for DOMWrapper
declare const LABKEY: any;

// DOMWrapper's are cached to avoid infinite calls to the wrapper
const DOMWrappers: Record<string, any> = {};

/**
 * Provides a function that wraps a stub implementation. If the concrete implementation is available at
 * run-time it will call that with the arguments applied, otherwise, it will log a warning to the console.
 * @hidden
 * @private
 * @param fnName
 */
function DOMWrapper<T>(fnName: string): T {
    if (!fnName) {
        throw new Error('DOMWrapper must wrap a named function.');
    }

    if (DOMWrappers.hasOwnProperty(fnName)) {
        throw new Error(`DOMWrapper cannot wrap "${fnName}" more than once.`);
    }

    DOMWrappers[fnName] = function () {
        if (
            LABKEY &&
            LABKEY.Utils &&
            isFunction(LABKEY.Utils[fnName]) &&
            LABKEY.Utils[fnName] !== DOMWrappers[fnName]
        ) {
            LABKEY.Utils[fnName].apply(this, arguments);
        } else {
            console.warn(
                `Utils.${fnName}: This is just a stub implementation. ` +
                    'Request the DOM version of the client API, ' +
                    'clientapi_dom.lib.xml, to get the concrete implementation.'
            );
        }
    };

    return DOMWrappers[fnName];
}

/** Display an error dialog. */
export const alert = DOMWrapper<(title: string, msg: string) => void>('alert');

/**
 * Returns the string value with the first char capitalized.
 * @param {String} value The string value to capitalize
 * @return {String}
 */
export function capitalize(value: string): string {
    if (value && isString(value) && value.length > 0) {
        return value.charAt(0).toUpperCase() + value.substr(1);
    }
    return value;
}

/**
 * Returns true if the arguments are case-insensitive equal.
 * Note: the method converts arguments to strings for the purposes of comparing numbers,
 * which means that it will return odd behaviors with objects
 * (ie. `LABKEY.Utils.caseInsensitiveEquals({t: 3}, '[object Object]') // returns true`)
 *
 * @param a The first item to test
 * @param b The second item to test
 * @return True if arguments are case-insensitive equal, false if not
 */
export function caseInsensitiveEquals(a: any, b: any): boolean {
    return String(a).toLowerCase() == String(b).toLowerCase();
}

// TODO: Need to remove this from the upper level namespace
export function ensureRegionName(regionName?: string): string {
    return regionName && isString(regionName) ? regionName : 'query';
}

/**
 * Decodes (parses) a JSON string to an object
 * @param data
 */
export function decode(data: any): any {
    return JSON.parse(data + '');
}

/**
 * Deletes a cookie. Note that 'name' and 'pageOnly' should be exactly the same as when the cookie was set.
 * @param name The name of the cookie to be deleted.
 * @param pageOnly Whether the cookie is scoped to the entire site, or just this page.
 * Deleting a site-level cookie has no impact on page-level cookies, and deleting page-level cookies
 * has no impact on site-level cookies, even if the cookies have the same name.
 */
export function deleteCookie(name: string, pageOnly: boolean): void {
    // TODO: Move this method to DOM utils
    setCookie(name, '', pageOnly, -1);
}

// These arguments didn't originally exist but usages in core are expecting arguments to be available, pulled up
// from dom/Utils.js implementation
/**
 * Shows an error dialog box to the user in response to an error from an AJAX request, including
 * any error messages from the server.
 * @param response The XMLHttpRequest object containing the response data.
 * @param exception A JavaScript Error object caught by the calling code.
 * @param showExceptionClass Flag to display the java class of the exception.
 * @param msgPrefix Prefix to the error message (defaults to: 'An error occurred trying to load:')
 */
export const displayAjaxErrorResponse =
    DOMWrapper<(response?: any, exception?: any, showExceptionClass?: any, msgPrefix?: any) => void>(
        'displayAjaxErrorResponse'
    );

export function encode(data: any): string {
    return JSON.stringify(data);
}

/**
 * Encodes the html passed in and converts it to a String so that it will not be interpreted as HTML
 * by the browser. For example, if your input string was "&lt;p&gt;Hello&lt;/p&gt;" the output would be
 * "&amp;lt;p&amp;gt;Hello&amp;lt;/p&amp;gt;". If you set an element's innerHTML property
 * to this string, the HTML markup will be displayed as literal text rather than being
 * interpreted as HTML. By default this function will return an empty string if a value
 * of undefined or null is passed it. To prevent this default, you can pass in a second
 * optional parameter value of true to retain the empty value's type.
 *
 * @param html The HTML to encode and return as a String value. If the value of this parameter is null or undefined, an empty string will be returned by default.
 * @param retainEmptyValueTypes Optional boolean parameter indicating that the empty values (null and undefined) should be returned as is from this function.
 * @return The encoded HTML
 */
export function encodeHtml(html: string, retainEmptyValueTypes?: boolean): string {
    // Issue 39628: default to returning an empty string when this function is called with a value of undefined or null
    if (html === undefined || html === null) {
        return retainEmptyValueTypes ? html : '';
    }

    // http://stackoverflow.com/questions/1219860/html-encoding-in-javascript-jquery
    return String(html)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\\/g, "&#92");
}

export function escapeRe(s: string): string {
    return s.replace(/([-.*+?\^${}()|\[\]\/\\])/g, '\\$1');
}

/**
 * Returns true if value ends with ending
 * @param value the value to examine
 * @param ending the ending to look for
 */
export function endsWith(value: string, ending: string): boolean {
    if (!value || !ending) {
        return false;
    }
    if (value.length < ending.length) {
        return false;
    }
    return value.substring(value.length - ending.length) == ending;
}

/**
 * @deprecated
 * @hidden
 * @private
 */
export function ensureBoxVisible(): void {
    console.warn(
        'ensureBoxVisible() has been migrated to the appropriate Ext scope. Consider LABKEY.ext.Utils.ensureBoxVisible or LABKEY.ext4.Util.ensureBoxVisible'
    );
}

/**
 * Returns a universally unique identifier, of the general form: "92329D39-6F5C-4520-ABFC-AAB64544E172"
 * NOTE: Do not use this for DOM id's as it does not meet the requirements for DOM id specification.
 * Based on original Math.uuid.js (v1.4)
 * http://www.broofa.com
 * mailto:robert@broofa.com
 * Copyright (c) 2010 Robert Kieffer
 * Dual licensed under the MIT and GPL licenses.
 */
export function generateUUID(): string {
    const { uuids } = getServerContext();

    // First see if there are any server-generated UUIDs available to return
    if (uuids && uuids.length > 0) {
        return uuids.pop();
    }

    // From the original Math.uuidFast implementation
    let uuid = new Array(36),
        rnd = 0,
        r;
    for (let i = 0; i < 36; i++) {
        if (i == 8 || i == 13 || i == 18 || i == 23) {
            uuid[i] = '-';
        } else if (i == 14) {
            uuid[i] = '4';
        } else {
            if (rnd <= 0x02) {
                rnd = (0x2000000 + Math.random() * 0x1000000) | 0;
            }
            r = rnd & 0xf;
            rnd = rnd >> 4;
            uuid[i] = CHARS[i == 19 ? (r & 0x3) | 0x8 : r];
        }
    }

    return uuid.join('');
}

/**
 * This is used to automatically parse returned JSON and call another success function passing that parsed JSON.
 * @param fn The callback function to wrap.
 * @param scope The scope for the callback function.
 * @param isErrorCallback Set to true if the function is an error callback. If true, and you do not provide a
 * separate callback, alert will popup showing the error message.
 * @param responseTransformer Function to be invoked to transform the response object before invoking the
 * primary callback function.
 */
export function getCallbackWrapper<T = any>(
    fn: Function, // TODO: Improve this type -- (data: T, response: ExtendedXMLHttpRequest, options: RequestOptions) => any
    scope?: any,
    isErrorCallback?: boolean,
    responseTransformer?: (json?: any) => T
): AjaxHandler {
    // Due to prior behavior the scope may not be explicitly specified (i.e. specified in the "scope"
    // parameter) and still expect to be respected when applied via function.apply(). Thus, this
    // return function cannot use => syntax and must return a classic function.
    return function (response: ExtendedXMLHttpRequest, options: RequestOptions) {
        let json = response.responseJSON;

        if (!json) {
            // ensure response is JSON before trying to decode
            if (isJSONResponse(response)) {
                try {
                    json = decode(response.responseText);
                } catch (error) {
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
            json.exception = response && response.statusText ? response.statusText : 'Communication failure.';
        }

        if (responseTransformer) {
            json = responseTransformer.call(scope || this, json);
        }

        if (fn) {
            fn.call(scope || this, json, response, options);
        } else if (isErrorCallback && response.status != 0) {
            // Don't show an error dialog if the user cancelled the request in the browser,
            // like navigating to another page
            alert('Error', json.exception);
        }
    };
}

/**
 * Retrieves a cookie. Useful for retrieving non-essential state to provide a better
 * user experience. Note that some browser settings may prevent cookies from being saved,
 * and users can clear browser cookies at any time, so previously saved cookies should not be assumed
 * to be available.
 * @param name The name of the cookie to be retrieved.
 * @param defaultValue The value to be returned if no cookie with the specified name is found on the client.
 */
export function getCookie(name: string, defaultValue: string): string {
    // TODO: Move this method to DOM utils
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');

    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) == 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }

    return defaultValue;
}

/**
 * Returns date formats for use in an Ext.form.DateField. Useful when using a DateField in an Ext object,
 * it contains a very large set of date formats, which helps make a DateField more robust. For example, a
 * user would be allowed to enter dates like 6/1/2011, 06/01/2011, 6/1/11, etc.
 */
export function getDateAltFormats(): string {
    const { useMDYDateParsing } = getServerContext();
    return useMDYDateParsing ? DATEALTFORMATS_MonthDay : DATEALTFORMATS_DayMonth;
}

/**
 * Returns date format with timestamp including milliseconds. Useful for parsing the date in
 * "yyyy-MM-dd HH:mm:ss.SSS" format as returned by DateUtil.getJsonDateTimeFormatString().
 * ex. Ext4.Date.parse("2019-02-15 17:15:10.123", 'Y-m-d H:i:s.u')
 */
export function getDateTimeFormatWithMS(): string {
    return DATETIMEFORMAT_WithMS;
}

/**
 * Returns a URL to the appropriate file icon image based on the specified file name.
 * Note that file name can be a full path or just the file name and extension.
 * If the file name does not include an extension, the URL for a generic image will be returned
 * @return The URL suitable for use in the src attribute of an img element.
 */
export function getFileIconUrl(fileName: string): string {
    const idx = fileName.lastIndexOf('.');
    return buildURL('core', 'getAttachmentIcon', '', {
        extension: idx >= 0 ? fileName.substring(idx + 1) : '_generic',
    });
}

export function getMeasureAlias(measure: any, override?: boolean): string {
    // TODO: Move this function out of Utils -- visualization specific
    if (measure.alias && !override) {
        return measure.alias;
    }

    const alias = measure.schemaName + '_' + measure.queryName + '_' + measure.name;
    return alias.replace(/\//g, '_');
}

/**
 * Generates a display string from the response to an error from an AJAX request
 */
export function getMsgFromError(response: XMLHttpRequest, exceptionObj: any, config: any): string {
    config = config || {};
    let error;
    const prefix = config.msgPrefix || 'An error occurred trying to load:\n';

    if (response && response.responseText && response.getResponseHeader('Content-Type')) {
        const contentType = response.getResponseHeader('Content-Type');

        if (contentType.indexOf('application/json') >= 0) {
            const jsonResponse = decode(response.responseText);

            if (jsonResponse && jsonResponse.exception) {
                error = prefix + jsonResponse.exception;
                if (config.showExceptionClass)
                    error +=
                        '\n(' +
                        (jsonResponse.exceptionClass ? jsonResponse.exceptionClass : 'Exception class unknown') +
                        ')';
            }
        }
        // HTML handling has been migrated to dom/Util's override of this method
    }
    if (!error) {
        error = prefix + 'Status: ' + response.statusText + ' (' + response.status + ')';
    }
    if (exceptionObj && exceptionObj.message) {
        error += '\n' + exceptionObj.name + ': ' + exceptionObj.message;
    }

    return error;
}

/**
 *
 * Standard documented name for error callback arguments is "failure" but various other names have been employed in past.
 * This function provides reverse compatibility by picking the failure callback argument out of a config object
 * be it named failure, failureCallback or errorCallback.
 */
export function getOnFailure(config: { errorCallback?: any; failure?: any; failureCallback?: any }): any {
    return config.failure || config.errorCallback || config.failureCallback;
    // maybe it be desirable for this fall all the way back to returning LABKEY.Utils.displayAjaxErrorResponse?
}

/**
 * Standard documented name for success callback arguments is "success" but various names have been employed in past.
 * This function provides reverse compatibility by picking the success callback argument out of a config object,
 * be it named success or successCallback.
 */
export function getOnSuccess(config: { success?: any; successCallback?: any }): any {
    return config.success || config.successCallback;
}

/**
 * Retrieves the current LabKey Server session ID. Note that this may only be made available when the
 * session ID cookie is marked as httpOnly = false.
 * @returns The current session id. Defaults to ''.
 * @see {@link https://www.owasp.org/index.php/HttpOnly|OWASP HttpOnly}
 * @see {@link https://tomcat.apache.org/tomcat-7.0-doc/config/context.html#Common_Attributes|Tomcat Attributes}
 */
export function getSessionID(): string {
    return getCookie('JSESSIONID', '');
}

/**
 * Will generate a unique id. If you provide a prefix, consider making it DOM safe so it can be used as
 * an element id.
 * @param prefix Optional prefix to start the identifier. Defaults to "lk-gen".
 */
export function id(prefix?: string): string {
    if (prefix) {
        return String(prefix) + ++idSeed;
    }
    return ID_PREFIX + ++idSeed;
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
    const upperVal = value.toString().toUpperCase();
    if (
        upperVal == 'TRUE' ||
        value == '1' ||
        upperVal == 'Y' ||
        upperVal == 'YES' ||
        upperVal == 'ON' ||
        upperVal == 'T' ||
        upperVal == 'FALSE' ||
        value == '0' ||
        upperVal == 'N' ||
        upperVal == 'NO' ||
        upperVal == 'OFF' ||
        upperVal == 'F'
    ) {
        return true;
    }
}

export function isDate(value: any): boolean {
    return Object.prototype.toString.call(value) === '[object Date]';
}

export function isNumber(value: any): boolean {
    return typeof value === 'number' && Number.isFinite(value);
}

export function isDefined(value: any): boolean {
    return typeof value !== 'undefined';
}

/**
 * Returns true if the passed object is empty (ie. `{}`) and false if not.
 * @param obj The object to test
 * @return The result of the test
 */
export function isEmptyObj(obj: any): boolean {
    // Note, this returns true for undefined, null, and empty Array as well. Consider revising
    // or removing in future version.
    for (const i in obj) {
        return false;
    }
    return true;
}

export function isFunction(value: any): boolean {
    // http://stackoverflow.com/questions/5999998/how-can-i-check-if-a-javascript-variable-is-function-type
    const getType = {};
    return value !== null && value !== undefined && getType.toString.call(value) === '[object Function]';
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
    return typeof value === 'object' && Object.prototype.toString.call(value) === '[object Object]';
}

/**
 * Returns true if the passed value is a string.
 *
 * @param value
 * @returns {boolean}
 */
export function isString(value: any): value is string {
    return typeof value === 'string';
}

/**
 * Apply properties from b, c, ...  to a.  Properties of each subsequent
 * object overwrites the previous.
 *
 * The first object is modified.
 *
 * Use `merge({}, o)` to create a deep copy of o.
 */
export function merge(...props: any[]): any {
    const o = props[0];
    for (let i = 1; i < props.length; i++) {
        _merge(o, props[i], true, 50);
    }
    return o;
}

export function mergeIf(...props: any[]): any {
    const o = props[0];
    for (let i = 1; i < props.length; i++) {
        _merge(o, props[i], false, 50);
    }
    return o;
}

export const onError = DOMWrapper<(error: any) => void>('onError');
export const onReady = DOMWrapper<(config: any) => void>('onReady');

export interface IOnTrueOptions extends RequestCallbackOptions {
    errorArguments?: any[];
    maxTests?: number;
    successArguments?: any[];
    testArguments?: any[];
    testCallback: Function;
}

/**
 * Iteratively calls a tester function you provide, calling another callback function once the
 * tester function returns true. This function is useful for advanced JavaScript scenarios, such
 * as cases where you are including common script files dynamically using the requiresScript()
 * method, and need to wait until classes defined in those files are parsed and ready for use.
 */
export function onTrue(options: IOnTrueOptions): void {
    // TODO: 2.x Remove this method
    options.maxTests = options.maxTests || 1000;
    try {
        if (options.testCallback.apply(options.scope || this, options.testArguments || [])) {
            getOnSuccess(options).apply(options.scope || this, options.successArguments || []);
        } else {
            if (options.maxTests <= 0) {
                throw 'Maximum number of tests reached!';
            } else {
                --options.maxTests;
                // TODO: Figure out how this is presently working...defer() is not a built-in function property
                // onTrue.defer(10, this, [options]);
            }
        }
    } catch (e) {
        if (getOnFailure(options)) {
            getOnFailure(options).apply(options.scope || this, [e, options.errorArguments]);
        }
    }
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
    } else {
        _input = input as string;
    }

    let pd = '';
    if (length > _input.length) {
        for (let i = 0; i < length - _input.length; i++) {
            pd += padChar;
        }
    }

    return pd + _input;
}

export function parseDateString(dateString: string): Date {
    try {
        if (!!(window as any).MSInputMethodContext && !!(document as any).documentMode) {
            // This method call can throw exceptions, either due to string split on undefined or if any of the
            // date or time parts are NaN after parseInt.
            return parseDateStringIE11(dateString);
        } else {
            // Note: This is not actually the best way to parse a date in JS, browser vendors recommend using a
            // date parsing library of sorts. See more information at MDN:
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
            return new Date(dateString);
        }
    } catch (e) {
        throw 'Date string not in expected format. Expecting yyyy-MM-dd HH:mm:ss.SSS';
    }
}

/**
 * Parses a date string returned from LabKey Server which should be in the format of: "yyyy-MM-dd HH:mm:ss.SSS"
 * On IE 11 does not support this syntax view new Date(), while all other browsers that we support do (as of April
 * 2019). This requires us to manually parse the date string and use the alternate Date constructor.
 *
 * @param dateString String in the format of: "yyyy-MM-dd HH:mm:ss.SSS"
 * @returns {Date}
 * @hidden
 * @private
 */
function parseDateStringIE11(dateString: string): Date {
    const parts = dateString.split(' ');
    const dateParts = parts[0].split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // Months start at 0.
    const day = parseInt(dateParts[2], 10);
    const timeParts = parts[1].split(':');
    const hour = parseInt(timeParts[0], 10);
    const minute = parseInt(timeParts[1], 10);
    const secondParts = timeParts[2].split('.');
    const second = parseInt(secondParts[0], 10);
    const millisecond = parseInt(secondParts[1], 10);
    const values = [year, month, day, hour, minute, second, millisecond];

    if (values.some(isNaN)) {
        throw 'Invalid date string';
    }

    return new Date(year, month, day, hour, minute, second, millisecond);
}

export function pluralBasic(count: number, singlar: string): string {
    return pluralize(count, singlar, singlar + 's');
}

export function pluralize(count: number, singular: string, plural: string): string {
    return count.toLocaleString() + ' ' + (count === 1 ? singular : plural);
}

/**
 * Includes a Cascading Style Sheet (CSS) file into the page. If the file was already included by some other code, this
 * function will simply ignore the call. This may be used to include CSS files defined in your module's web/ directory.
 * @param filePath The path to the script file to include. This path should be relative to the web application
 * root. So for example, if you wanted to include a file in your module's web/mymodule/styles/ directory,
 * the path would be "mymodule/styles/mystyles.css"
 */
export function requiresCSS(filePath: string): void {
    // TODO: 2.x Remove this method
    const { requiresCss } = getServerContext();
    requiresCss(filePath);
}

/**
 * Loads JavaScript file(s) from the server.
 * @param file A file or Array of files to load.
 * @param callback Callback for when all dependencies are loaded.
 * @param scope Scope of callback.
 * @param inOrder True to load the scripts in the order they are passed in. Default is false.
 * ```html
 * <script type="text/javascript">
 *     LABKEY.Utils.requiresScript("myModule/myScript.js", function() {
 *         // your script is loaded
 *     });
 * </script>
 * ```
 */
export function requiresScript(file: string | string[], callback: Function, scope?: any, inOrder?: boolean): void {
    // TODO: 2.x Remove this method
    const { requiresScript } = getServerContext();
    requiresScript(file, callback, scope, inOrder);
}

/**
 * This method has been migrated to specific instances for both Ext 3.4.1 and Ext 4.2.1.
 * For Ext 3.4.1 see LABKEY.ext.Utils.resizeToViewport
 * For Ext 4.2.1 see LABKEY.ext4.Util.resizeToViewport
 * @deprecated
 * @hidden
 * @private
 */
export function resizeToViewport(): void {
    console.warn('LABKEY.Utils.resizeToViewport has been migrated. See JavaScript API documentation for details.');
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

/**
 * Sets a client-side cookie. Useful for saving non-essential state to provide a better
 * user experience. Note that some browser settings may prevent cookies from being saved,
 * and users can clear browser cookies at any time, so cookies are not a substitute for
 * database persistence.
 * @param name The name of the cookie to be saved.
 * @param value The value of the cookie to be saved.
 * @param pageOnly Whether this cookie should be scoped to the entire site, or just this page.
 * Page scoping considers the entire URL without parameters; all URL contents after the '?' are ignored.
 * @param days The number of days the cookie should be saved on the client.
 */
export function setCookie(name: string, value: string, pageOnly: boolean, days: number): void {
    // TODO: Move this method to DOM utils
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = '; expires=' + date.toUTCString();
    }

    let path = '/';
    if (pageOnly) {
        path = location.pathname.substring(0, location.pathname.lastIndexOf('/'));
    }

    document.cookie = name + '=' + value + expires + '; path=' + path;
}

export interface ITextLinkOptions {
    href?: string;
    onClick?: string;
    text?: string;
}

/**
 * Returns a string containing a well-formed html anchor that will apply theme specific styling. The configuration
 * takes any property value pair and places them on the anchor.
 * @param options
 * @returns {string}
 */
export function textLink(options: ITextLinkOptions): string {
    if (options.href === undefined && options.onClick === undefined) {
        throw 'href AND/OR onClick required in call to LABKEY.Utils.textLink()';
    }

    let attributes = ' ';
    if (options) {
        for (const i in options) {
            if (options.hasOwnProperty(i)) {
                if (i.toString() != 'text' && i.toString() != 'class') {
                    attributes += i.toString() + '="' + (options as any)[i] + '" ';
                }
            }
        }

        return '<a class="labkey-text-link"' + attributes + '>' + (options.text != null ? options.text : '') + '</a>';
    }

    throw 'Config object not found for textLink.';
}
