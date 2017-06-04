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
import { loadContext } from './constants'
import { AjaxHandler, RequestOptions } from './Ajax'

const { uuids } = loadContext();

interface ExtendedXMLHttpRequest extends XMLHttpRequest {
    responseJSON: any
}

const CHARS = '0123456789abcdefghijklmnopqrstuvwxyz'.split('');
const ENUMERABLES = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'constructor'];
const ID_PREFIX = 'lk-gen';
let idSeed = 100;

function _copy(o: any, depth: any): any {
    if (depth == 0 || !isObject(o)) {
        return o;
    }
    let copy: any = {};
    for (let key in o) {
        copy[key] = _copy(o[key], depth-1);
    }
    return copy;
}

// like a general version of Ext.apply() or mootools.merge()
function _merge(to: any, from: any, overwrite: any, depth: any): void {
    for (let key in from) {
        if (from.hasOwnProperty(key)) {
            if (isObject(to[key]) && isObject(from[key])) {
                _merge(to[key], from[key], overwrite, depth-1);
            }
            else if (undefined === to[key] || overwrite) {
                to[key] = _copy(from[key], depth-1);
            }
        }
    }
}

/**
 * Applies config properties to the specified object.
 * @param object
 * @param config
 * @returns {any}
 */
export function apply(object: any, config: any): any {

    if (object && config && typeof config === 'object') {
        let i, j, k;

        for (i in config) {
            object[i] = config[i];
        }

        for (j = ENUMERABLES.length; j--;) {
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
export function applyTranslated(target: any, source: any, translationMap: any, applyOthers?: boolean, applyFunctions?: boolean): void {

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
    for (let prop in source) {
        if (source.hasOwnProperty(prop)) {
            //special case: Ext adds a "constructor" property to every object, which we don't want to apply
            if (prop == 'constructor' || isFunction(prop)) {
                continue;
            }

            targetPropName = translationMap[prop];
            if (targetPropName) {
                target[translationMap[prop]] = source[prop];
            }
            else if (undefined === targetPropName && applyOthers && (applyFunctions || !isFunction(source[prop]))) {
                target[prop] = source[prop];
            }
        }
    }
}

export function alert(title: string, msg: string): void {
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
export function ensureRegionName(regionName?: string): string {
    return regionName && isString(regionName) ? regionName : 'query';
}

/**
 * Decodes (parses) a JSON string to an object
 * @param data
 * @returns {}
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
    setCookie(name, '', pageOnly, -1);
}

// These arguments didn't originally exist but usages in core are expecting arguments to be available, pulled up
// from dom/Utils.js implementation
export function displayAjaxErrorResponse(response?: any, exception?: any, showExceptionClass?: any, msgPrefix?: any) {
    console.warn('displayAjaxErrorResponse: This is just a stub implementation, request the dom version of the client API : clientapi_dom.lib.xml to get the concrete implementation');
}

export function encode(data: any): string {
    return JSON.stringify(data);
}

/**
 * Encodes the html passed in so that it will not be interpreted as HTML by the browser.
 * For example, if your input string was "&lt;p&gt;Hello&lt;/p&gt;" the output would be
 * "&amp;lt;p&amp;gt;Hello&amp;lt;/p&amp;gt;". If you set an element's innerHTML property
 * to this string, the HTML markup will be displayed as literal text rather than being
 * interpreted as HTML.
 *
 * @param {String} html The HTML to encode
 * @return {String} The encoded HTML
 */
export function encodeHtml(html: string): string {
    // http://stackoverflow.com/questions/1219860/html-encoding-in-javascript-jquery
    return String(html)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

export function escapeRe(s: string): string {
    return s.replace(/([-.*+?\^${}()|\[\]\/\\])/g, "\\$1");
}

/**
 * Returns true if value ends with ending
 * @param value the value to examine
 * @param ending the ending to look for
 * @returns {boolean}
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
 * Returns a universally unique identifier, of the general form: "92329D39-6F5C-4520-ABFC-AAB64544E172"
 * NOTE: Do not use this for DOM id's as it does not meet the requirements for DOM id specification.
 * Based on original Math.uuid.js (v1.4)
 * http://www.broofa.com
 * mailto:robert@broofa.com
 * Copyright (c) 2010 Robert Kieffer
 * Dual licensed under the MIT and GPL licenses.
 */
export function generateUUID(): string {
    // First see if there are any server-generated UUIDs available to return
    if (uuids && uuids.length > 0) {
        return uuids.pop();
    }

    // From the original Math.uuidFast implementation
    let uuid = new Array(36), rnd = 0, r;
    for (let i = 0; i < 36; i++) {
        if (i == 8 || i == 13 || i == 18 || i == 23) {
            uuid[i] = '-';
        }
        else if (i == 14) {
            uuid[i] = '4';
        }
        else {
            if (rnd <= 0x02) {
                rnd = 0x2000000 + (Math.random() * 0x1000000) | 0
            }
            r = rnd & 0xf;
            rnd = rnd >> 4;
            uuid[i] = CHARS[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
    }

    return uuid.join('');
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
 * Retrieves a cookie. Useful for retrieving non-essential state to provide a better
 * user experience. Note that some browser settings may prevent cookies from being saved,
 * and users can clear browser cookies at any time, so previously saved cookies should not be assumed
 * to be available.
 * @param name The name of the cookie to be retrieved.
 * @param defaultValue The value to be returned if no cookie with the specified name is found on the client.
 * @returns {string}
 */
export function getCookie(name: string, defaultValue: string): string {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');

    for (let i=0; i < ca.length; i++) {
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
 * Generates a display string from the response to an error from an AJAX request
 */
export function getMsgFromError(response: XMLHttpRequest, exceptionObj: any, config: any): string {
    config = config || {};
    let error;
    let prefix = config.msgPrefix || 'An error occurred trying to load:\n';

    if (response &&
        response.responseText &&
        response.getResponseHeader('Content-Type') &&
        response.getResponseHeader('Content-Type').indexOf('application/json') >= 0) {
        const jsonResponse = decode(response.responseText);
        if (jsonResponse && jsonResponse.exception) {
            error = prefix + jsonResponse.exception;
            if (config.showExceptionClass) {
                error += '\n(' + (jsonResponse.exceptionClass ? jsonResponse.exceptionClass : 'Exception class unknown') + ')';
            }
        }
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
 * Retrieves the current LabKey Server session ID. Note that this may only be made available when the
 * session ID cookie is marked as httpOnly = false.
 * @returns {string} The current session id. Defaults to ''.
 * @see {@link https://www.owasp.org/index.php/HttpOnly|OWASP HttpOnly}
 * @see {@link https://tomcat.apache.org/tomcat-7.0-doc/config/context.html#Common_Attributes|Tomcat Attributes}
 */
export function getSessionID(): string {
    return getCookie('JSESSIONID', '');
}

/**
 * Will generate a unique id. If you provide a prefix, consider making it DOM safe so it can be used as
 * an element id.
 * @param {string} [prefix=lk-gen] - Optional prefix to start the identifier.
 * @returns {string}
 */
export function id(prefix?: string): string {
    if (prefix) {
        return String(prefix) + (++idSeed);
    }
    return ID_PREFIX + (++idSeed);
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
    // Note, this returns true for undefined, null, and empty Array as well. Consider revising
    // or removing in future version.
    for (let i in obj) {
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

/**
 * Apply properties from b, c, ...  to a.  Properties of each subsequent
 * object overwrites the previous.
 *
 * The first object is modified.
 *
 * Use merge({}, o) to create a deep copy of o.
 */
export function merge(...props: Array<any>): any {
    let o = props[0];
    for (let i=1; i < props.length; i++) {
        _merge(o, props[i], true, 50);
    }
    return o;
}

export function onError(error: any): void {
    console.warn('onError: This is just a stub implementation, request the dom version of the client API : clientapi_dom.lib.xml to get the concrete implementation');
}

export function onReady(config: any): void {
    console.warn('onReady: This is just a stub implementation, request the dom version of the client API : clientapi_dom.lib.xml to get the concrete implementation');
}

interface IOnTrueOptions {
    errorArguments?: Array<any>
    failure?: Function
    maxTests?: number
    scope?: any
    successArguments?: Array<any>
    success: Function
    testArguments?: Array<any>
    testCallback: Function
}

/**
 * Iteratively calls a tester function you provide, calling another callback function once the
 * tester function returns true. This function is useful for advanced JavaScript scenarios, such
 * as cases where you are including common script files dynamically using the requiresScript()
 * method, and need to wait until classes defined in those files are parsed and ready for use.
 */
export function onTrue(options: IOnTrueOptions): void {
    // TODO: Get rid of this entire method
    options.maxTests = options.maxTests || 1000;
    try {
        if (options.testCallback.apply(options.scope || this, options.testArguments || [])) {
            getOnSuccess(options).apply(options.scope || this, options.successArguments || []);
        }
        else {
            if (options.maxTests <= 0) {
                throw 'Maximum number of tests reached!';
            }
            else {
                --options.maxTests;
                // TODO: Figure out how this is presently working...defer() is not a built-in function property
                // onTrue.defer(10, this, [options]);
            }
        }
    }
    catch(e) {
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
    }
    else {
        _input = input as string;
    }

    let pd = '';
    if (length > _input.length) {
        for (let i=0; i < (length - _input.length); i++) {
            pd += padChar;
        }
    }

    return pd + _input;
}

export function pluralBasic(count: number, singlar: string): string {
    return pluralize(count, singlar, singlar + 's');
}

export function pluralize(count: number, singular: string, plural: string): string {
    return count.toLocaleString() + ' ' + (1 === count ? singular : plural);
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
    let expires = '';
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
    }

    let path = '/';
    if (pageOnly) {
        path = location.pathname.substring(0, location.pathname.lastIndexOf('/'));
    }

    document.cookie = name + '=' + value + expires + '; path=' + path;
}

interface ITextLinkOptions {
    href?: string
    onClick?: string
    text?: string
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
        for (let i in options) {
            if (options.hasOwnProperty(i)) {
                if (i.toString() != 'text' && i.toString() != 'class') {
                    attributes += i.toString() + '=\"' + (options as any)[i] + '\" ';
                }
            }
        }

        return '<a class="labkey-text-link"' + attributes + '>' + (options.text != null ? options.text : "") + '</a>';
    }

    throw 'Config object not found for textLink.';
}