'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var CSRF_HEADER = 'X-LABKEY-CSRF';
function getLocation() {
    return window.location;
}
function getServerContext() {
    return LABKEY;
}
function setGlobalUser(user) {
    LABKEY.user = user;
    return LABKEY;
}
var _Window = (function (_super) {
    __extends(_Window, _super);
    function _Window() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return _Window;
}(Window));
if (!window.LABKEY) {
    throw new Error('LABKEY object is required to be initialized prior to loading the API');
}

var CHARS = '0123456789abcdefghijklmnopqrstuvwxyz'.split('');
var ENUMERABLES = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'constructor'];
var ID_PREFIX = 'lk-gen';
var idSeed = 100;
function _copy(o, depth) {
    if (depth == 0 || !isObject(o)) {
        return o;
    }
    var copy = {};
    for (var key in o) {
        copy[key] = _copy(o[key], depth - 1);
    }
    return copy;
}
function _merge(to, from, overwrite, depth) {
    for (var key in from) {
        if (from.hasOwnProperty(key)) {
            if (isObject(to[key]) && isObject(from[key])) {
                _merge(to[key], from[key], overwrite, depth - 1);
            }
            else if (undefined === to[key] || overwrite) {
                to[key] = _copy(from[key], depth - 1);
            }
        }
    }
}
function apply(object, config) {
    if (object && config && typeof config === 'object') {
        var i = void 0, j = void 0, k = void 0;
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
function applyTranslated(target, source, translationMap, applyOthers, applyFunctions) {
    if (undefined === target) {
        target = {};
    }
    if (undefined === applyOthers) {
        applyOthers = true;
    }
    if (undefined == applyFunctions && applyOthers) {
        applyFunctions = true;
    }
    var targetPropName;
    for (var prop in source) {
        if (source.hasOwnProperty(prop)) {
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
function alert$1(title, msg) {
    console.warn('alert: This is just a stub implementation, request the dom version of the client API : clientapi_dom.lib.xml to get the concrete implementation');
    console.warn(title + ':', msg);
}
function capitalize(value) {
    if (value && isString(value) && value.length > 0) {
        return value.charAt(0).toUpperCase() + value.substr(1);
    }
    return value;
}
function caseInsensitiveEquals(a, b) {
    return String(a).toLowerCase() == String(b).toLowerCase();
}
function collapseExpand(elem, notify, targetTagName) {
    stubWarning('collapseExpand');
    return false;
}
function ensureRegionName(regionName) {
    return regionName && isString(regionName) ? regionName : 'query';
}
function decode(data) {
    return JSON.parse(data + '');
}
function deleteCookie(name, pageOnly) {
    setCookie(name, '', pageOnly, -1);
}
function displayAjaxErrorResponse(response, exception, showExceptionClass, msgPrefix) {
    console.warn('displayAjaxErrorResponse: This is just a stub implementation, request the dom version of the client API : clientapi_dom.lib.xml to get the concrete implementation');
}
function encode(data) {
    return JSON.stringify(data);
}
function encodeHtml(html) {
    return String(html)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
function escapeRe(s) {
    return s.replace(/([-.*+?\^${}()|\[\]\/\\])/g, "\\$1");
}
function endsWith(value, ending) {
    if (!value || !ending) {
        return false;
    }
    if (value.length < ending.length) {
        return false;
    }
    return value.substring(value.length - ending.length) == ending;
}
function ensureBoxVisible() {
    console.warn('ensureBoxVisible() has been migrated to the appropriate Ext scope. Consider LABKEY.ext.Utils.ensureBoxVisible or LABKEY.ext4.Util.ensureBoxVisible');
}
function generateUUID() {
    var uuids = getServerContext().uuids;
    if (uuids && uuids.length > 0) {
        return uuids.pop();
    }
    var uuid = new Array(36), rnd = 0, r;
    for (var i = 0; i < 36; i++) {
        if (i == 8 || i == 13 || i == 18 || i == 23) {
            uuid[i] = '-';
        }
        else if (i == 14) {
            uuid[i] = '4';
        }
        else {
            if (rnd <= 0x02) {
                rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
            }
            r = rnd & 0xf;
            rnd = rnd >> 4;
            uuid[i] = CHARS[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
    }
    return uuid.join('');
}
function getCallbackWrapper(fn, scope, isErrorCallback) {
    var _this = this;
    return function (response, options) {
        var json = response.responseJSON;
        if (!json) {
            if (isJSONResponse(response)) {
                try {
                    json = decode(response.responseText);
                }
                catch (error) {
                }
            }
            response.responseJSON = json;
        }
        if (!json && isErrorCallback) {
            json = {};
        }
        if (json && !json.exception && isErrorCallback) {
            json.exception = (response && response.statusText ? response.statusText : 'Communication failure.');
        }
        if (fn) {
            fn.call(scope || _this, json, response, options);
        }
        else if (isErrorCallback && response.status != 0) {
            alert$1('Error', json.exception);
        }
    };
}
function getCookie(name, defaultValue) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) == 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return defaultValue;
}
function getMsgFromError(response, exceptionObj, config) {
    config = config || {};
    var error;
    var prefix = config.msgPrefix || 'An error occurred trying to load:\n';
    if (response && response.responseText && response.getResponseHeader('Content-Type')) {
        var contentType = response.getResponseHeader('Content-Type');
        if (contentType.indexOf('application/json') >= 0) {
            var jsonResponse = decode(response.responseText);
            if (jsonResponse && jsonResponse.exception) {
                error = prefix + jsonResponse.exception;
                if (config.showExceptionClass)
                    error += "\n(" + (jsonResponse.exceptionClass ? jsonResponse.exceptionClass : "Exception class unknown") + ")";
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
function getOnFailure(config) {
    return config.failure || config.errorCallback || config.failureCallback;
}
function getOnSuccess(config) {
    return config.success || config.successCallback;
}
function getSessionID() {
    return getCookie('JSESSIONID', '');
}
function id(prefix) {
    if (prefix) {
        return String(prefix) + (++idSeed);
    }
    return ID_PREFIX + (++idSeed);
}
function isArray(value) {
    return Object.prototype.toString.call(value) === '[object Array]';
}
function isBoolean(value) {
    var upperVal = value.toString().toUpperCase();
    if (upperVal == 'TRUE' || value == '1' || upperVal == 'Y' || upperVal == 'YES' || upperVal == 'ON' || upperVal == 'T'
        || upperVal == 'FALSE' || value == '0' || upperVal == 'N' || upperVal == 'NO' || upperVal == 'OFF' || upperVal == 'F') {
        return true;
    }
}
function isDate(value) {
    return Object.prototype.toString.call(value) === '[object Date]';
}
function isNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
}
function isDefined(value) {
    return typeof value !== 'undefined';
}
function isEmptyObj(obj) {
    for (var i in obj) {
        return false;
    }
    return true;
}
function isFunction(value) {
    var getType = {};
    return value !== null && value !== undefined && getType.toString.call(value) === '[object Function]';
}
function isJSONResponse(response) {
    return (response &&
        response.getResponseHeader &&
        response.getResponseHeader('Content-Type') &&
        response.getResponseHeader('Content-Type').indexOf('application/json') >= 0);
}
function isObject(value) {
    return typeof value == "object" && Object.prototype.toString.call(value) === '[object Object]';
}
function isString(value) {
    return typeof value === 'string';
}
function merge() {
    var props = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        props[_i] = arguments[_i];
    }
    var o = props[0];
    for (var i = 1; i < props.length; i++) {
        _merge(o, props[i], true, 50);
    }
    return o;
}
function notifyExpandCollapse(url, collapse) {
    stubWarning('notifyExpandCollapse');
}
function onError(error) {
    stubWarning('onError');
}
function onReady(config) {
    stubWarning('onReady');
    if (typeof config === 'function') {
        config();
    }
}
function onTrue(options) {
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
            }
        }
    }
    catch (e) {
        if (getOnFailure(options)) {
            getOnFailure(options).apply(options.scope || this, [e, options.errorArguments]);
        }
    }
}
function padString(input, length, padChar) {
    var _input;
    if (!isString(input)) {
        _input = input.toString();
    }
    else {
        _input = input;
    }
    var pd = '';
    if (length > _input.length) {
        for (var i = 0; i < (length - _input.length); i++) {
            pd += padChar;
        }
    }
    return pd + _input;
}
function pluralBasic(count, singlar) {
    return pluralize(count, singlar, singlar + 's');
}
function pluralize(count, singular, plural) {
    return count.toLocaleString() + ' ' + (1 === count ? singular : plural);
}
function roundNumber(input, dec) {
    return Math.round(input * Math.pow(10, dec)) / Math.pow(10, dec);
}
function setCookie(name, value, pageOnly, days) {
    var expires = '';
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
    }
    var path = '/';
    if (pageOnly) {
        path = location.pathname.substring(0, location.pathname.lastIndexOf('/'));
    }
    document.cookie = name + '=' + value + expires + '; path=' + path;
}
function stubWarning(methodName) {
    console.warn(methodName + ': This is just a stub implementation, request the dom version of the client API : clientapi_dom.lib.xml to get the concrete implementation');
}
function textLink(options) {
    if (options.href === undefined && options.onClick === undefined) {
        throw 'href AND/OR onClick required in call to LABKEY.Utils.textLink()';
    }
    var attributes = ' ';
    if (options) {
        for (var i in options) {
            if (options.hasOwnProperty(i)) {
                if (i.toString() != 'text' && i.toString() != 'class') {
                    attributes += i.toString() + '=\"' + options[i] + '\" ';
                }
            }
        }
        return '<a class="labkey-text-link"' + attributes + '>' + (options.text != null ? options.text : "") + '</a>';
    }
    throw 'Config object not found for textLink.';
}
function toggleLink(link, notify, targetTagName) {
    stubWarning('toggleLink');
    return false;
}

var Utils = /*#__PURE__*/Object.freeze({
    apply: apply,
    applyTranslated: applyTranslated,
    alert: alert$1,
    capitalize: capitalize,
    caseInsensitiveEquals: caseInsensitiveEquals,
    collapseExpand: collapseExpand,
    ensureRegionName: ensureRegionName,
    decode: decode,
    deleteCookie: deleteCookie,
    displayAjaxErrorResponse: displayAjaxErrorResponse,
    encode: encode,
    encodeHtml: encodeHtml,
    escapeRe: escapeRe,
    endsWith: endsWith,
    ensureBoxVisible: ensureBoxVisible,
    generateUUID: generateUUID,
    getCallbackWrapper: getCallbackWrapper,
    getCookie: getCookie,
    getMsgFromError: getMsgFromError,
    getOnFailure: getOnFailure,
    getOnSuccess: getOnSuccess,
    getSessionID: getSessionID,
    id: id,
    isArray: isArray,
    isBoolean: isBoolean,
    isDate: isDate,
    isNumber: isNumber,
    isDefined: isDefined,
    isEmptyObj: isEmptyObj,
    isFunction: isFunction,
    isObject: isObject,
    isString: isString,
    merge: merge,
    notifyExpandCollapse: notifyExpandCollapse,
    onError: onError,
    onReady: onReady,
    onTrue: onTrue,
    padString: padString,
    pluralBasic: pluralBasic,
    pluralize: pluralize,
    roundNumber: roundNumber,
    setCookie: setCookie,
    textLink: textLink,
    toggleLink: toggleLink
});

function buildParameterMap(paramString) {
    var postParameters = getServerContext().postParameters;
    if (!paramString && postParameters) {
        return postParameters;
    }
    if (!paramString) {
        paramString = getLocation().search;
    }
    if (paramString.charAt(0) == '?') {
        paramString = paramString.substring(1, paramString.length);
    }
    var paramArray = paramString.split('&');
    var parameters = {};
    for (var i = 0; i < paramArray.length; i++) {
        var nameValue = paramArray[i].split('=', 2);
        if (nameValue.length == 1 && nameValue[0] != '') {
            nameValue[1] = '';
        }
        if (nameValue.length == 2) {
            var name_1 = decodeURIComponent(nameValue[0]);
            if (undefined == parameters[name_1]) {
                parameters[name_1] = decodeURIComponent(nameValue[1]);
            }
            else {
                var curValue = parameters[name_1];
                if (isArray(curValue)) {
                    curValue.push(decodeURIComponent(nameValue[1]));
                }
                else {
                    parameters[name_1] = [curValue, decodeURIComponent(nameValue[1])];
                }
            }
        }
    }
    return parameters;
}
function buildURL(controller, action, containerPath, parameters) {
    if (containerPath) {
        containerPath = encodePath(containerPath);
    }
    else {
        containerPath = getContainer();
    }
    if (containerPath.charAt(0) != '/') {
        containerPath = '/' + containerPath;
    }
    if (containerPath.charAt(containerPath.length - 1) != '/') {
        containerPath = containerPath + '/';
    }
    if (action.indexOf('.') == -1) {
        action += '.view';
    }
    var query = queryString(parameters);
    var newURL;
    var _a = getServerContext(), contextPath = _a.contextPath, experimental = _a.experimental;
    if (experimental && experimental.containerRelativeURL) {
        newURL = contextPath + containerPath + controller + '-' + action;
    }
    else {
        newURL = contextPath + '/' + controller + containerPath + action;
    }
    if (query) {
        newURL += '?' + query;
    }
    return newURL;
}
function decodePath(encodedPath) {
    return codePath(encodedPath, decodeURIComponent);
}
function encodePath(decodedPath) {
    return codePath(decodedPath, encodeURIComponent);
}
function getAction() {
    return getPathFromLocation().action;
}
function getBaseURL(noContextPath) {
    var baseURL = getServerContext().baseURL;
    if (baseURL) {
        return baseURL + (noContextPath ? '' : getContextPath()) + '/';
    }
    else {
        var location_1 = getLocation();
        return location_1.protocol + '//' + location_1.host + (noContextPath ? '' : getContextPath()) + '/';
    }
}
function getContainer() {
    var container = getServerContext().container;
    if (container && container.path) {
        return container.path;
    }
    return getPathFromLocation().containerPath;
}
function getContainerName() {
    var containerPath = getContainer();
    return containerPath.substring(containerPath.lastIndexOf('/') + 1);
}
function getContextPath() {
    return getServerContext().contextPath;
}
function getController() {
    return getPathFromLocation().controller;
}
function getParameter(parameterName) {
    var val = buildParameterMap()[parameterName];
    return (val && isArray(val) && val.length > 0) ? val[0] : val;
}
function getParameterArray(parameterName) {
    var val = buildParameterMap()[parameterName];
    return (val && !isArray(val)) ? [val] : val;
}
function getParameters(url) {
    if (!url) {
        return buildParameterMap(url);
    }
    var paramString = url;
    if (url.indexOf('?') != -1) {
        paramString = url.substring(url.indexOf('?') + 1, url.length);
    }
    return buildParameterMap(paramString);
}
function queryString(parameters) {
    if (!parameters) {
        return '';
    }
    var query = '', and = '', pval, parameter, aval;
    for (parameter in parameters) {
        if (parameters.hasOwnProperty(parameter)) {
            pval = parameters[parameter];
            if (pval === null || pval === undefined)
                pval = '';
            if (isArray(pval)) {
                for (var idx = 0; idx < pval.length; ++idx) {
                    aval = pval[idx];
                    query += and + encodeURIComponent(parameter) + '=' + encodeURIComponent(pval[idx]);
                    and = '&';
                }
            }
            else {
                query += and + encodeURIComponent(parameter) + '=' + encodeURIComponent(pval);
                and = '&';
            }
        }
    }
    return query;
}
function codePath(path, method) {
    var a = path.split('/');
    for (var i = 0; i < a.length; i++) {
        a[i] = method(a[i]);
    }
    return a.join('/');
}
function getPathFromLocation() {
    var contextPath = getServerContext().contextPath;
    var start = contextPath ? contextPath.length : 0;
    var path = getLocation().pathname;
    var end = path.lastIndexOf('/');
    var action = path.substring(end + 1);
    path = path.substring(start, end);
    var controller = null;
    var dash = action.indexOf('-');
    if (0 < dash) {
        controller = action.substring(0, dash);
        action = action.substring(dash + 1);
    }
    else {
        var slash = path.indexOf('/', 1);
        if (slash < 0)
            controller = path.substring(1);
        else
            controller = path.substring(1, slash);
        path = path.substring(slash);
    }
    var dot = action.indexOf('.');
    if (0 < dot) {
        action = action.substring(0, dot);
    }
    return {
        controller: decodeURIComponent(controller),
        action: decodeURIComponent(action),
        containerPath: decodeURI(path)
    };
}

var ActionURL = /*#__PURE__*/Object.freeze({
    buildURL: buildURL,
    decodePath: decodePath,
    encodePath: encodePath,
    getAction: getAction,
    getBaseURL: getBaseURL,
    getContainer: getContainer,
    getContainerName: getContainerName,
    getContextPath: getContextPath,
    getController: getController,
    getParameter: getParameter,
    getParameterArray: getParameterArray,
    getParameters: getParameters,
    queryString: queryString
});

var _a;
var _b = getServerContext(), CSRF = _b.CSRF, defaultHeaders = _b.defaultHeaders;
var DEFAULT_HEADERS = (_a = {},
    _a[CSRF_HEADER] = CSRF,
    _a);
if (defaultHeaders) {
    DEFAULT_HEADERS = defaultHeaders;
}
function callback(fn, scope, args) {
    if (fn) {
        fn.apply(scope, args);
    }
}
function contains(obj, key) {
    if (key) {
        var lowerKey = key.toLowerCase();
        for (var k in obj) {
            if (obj.hasOwnProperty(k) && k.toLowerCase() === lowerKey) {
                return true;
            }
        }
    }
    return false;
}
function configureHeaders(xhr, config, options) {
    var headers = config.headers, jsonData = config.jsonData;
    if (headers === undefined || headers === null) {
        headers = {};
    }
    if (!options.isForm && !contains(headers, 'Content-Type')) {
        if (jsonData !== undefined && jsonData !== null) {
            headers['Content-Type'] = 'application/json';
        }
        else {
            headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        }
    }
    if (!contains(headers, 'X-Requested-With')) {
        headers['X-Requested-With'] = 'XMLHttpRequest';
    }
    for (var k in DEFAULT_HEADERS) {
        if (DEFAULT_HEADERS.hasOwnProperty(k)) {
            xhr.setRequestHeader(k, DEFAULT_HEADERS[k]);
        }
    }
    for (var k in headers) {
        if (headers.hasOwnProperty(k)) {
            xhr.setRequestHeader(k, headers[k]);
        }
    }
}
function configureOptions(config) {
    var data;
    var formData;
    var method = 'GET';
    var isForm = false;
    if (!config || !config.hasOwnProperty('url') || config.url === null) {
        throw new Error('a URL is required to make a request');
    }
    var url = config.url;
    var params = config.params;
    if (config.form) {
        formData = config.form instanceof FormData ? config.form : new FormData(config.form);
        isForm = true;
    }
    else if (config.jsonData) {
        data = JSON.stringify(config.jsonData);
    }
    if (config.hasOwnProperty('method') && config.method !== null) {
        method = config.method.toUpperCase();
    }
    else if (data) {
        method = 'POST';
    }
    if (params !== undefined && params !== null) {
        var qs = queryString(params);
        if (method === 'POST' && (data === undefined || data === null)) {
            data = qs;
        }
        else {
            url += (url.indexOf('?') === -1 ? '?' : '&') + qs;
        }
    }
    return {
        data: isForm ? formData : data,
        isForm: isForm,
        method: method,
        url: url
    };
}
function request(config) {
    var options = configureOptions(config);
    var scope = config.hasOwnProperty('scope') && config.scope !== null ? config.scope : this;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            var success = (xhr.status >= 200 && xhr.status < 300) || xhr.status == 304;
            callback(success ? config.success : config.failure, scope, [xhr, config]);
            callback(config.callback, scope, [config, success, xhr]);
        }
    };
    xhr.open(options.method, options.url, true);
    var baseURL = getServerContext().baseURL;
    var noContextPath = !(getServerContext().hasOwnProperty('contextPath') && getServerContext().contextPath != null);
    if (location.protocol + '//' + location.host + (noContextPath ? '/' : getServerContext().contextPath + '/') != baseURL) {
        xhr.withCredentials = true;
    }
    configureHeaders(xhr, config, options);
    if (config.hasOwnProperty('timeout') && config.timeout !== null && config.timeout !== undefined) {
        xhr.ontimeout = function () {
            callback(config.failure, scope, [xhr, config]);
            callback(config.callback, scope, [config, false, xhr]);
        };
    }
    xhr.send(options.data);
    return xhr;
}

var Ajax = /*#__PURE__*/Object.freeze({
    get DEFAULT_HEADERS () { return DEFAULT_HEADERS; },
    request: request
});

var QueryKey = (function () {
    function QueryKey(parent, name) {
        this.name = name;
        this.parent = parent;
    }
    QueryKey.decodePart = function (s) {
        return s.replace(/\$P/g, '.').replace(/\$C/g, ',').replace(/\$T/g, '~').replace(/\$B/g, '}').replace(/\$A/g, '&').replace(/\$S/g, '/').replace(/\$D/g, '$');
    };
    QueryKey.encodePart = function (s) {
        return s.replace(/\$/g, '$D').replace(/\//g, '$S').replace(/\&/g, '$A').replace(/\}/g, '$B').replace(/\~/g, '$T').replace(/\,/g, '$C').replace(/\./g, '$P');
    };
    QueryKey.needsQuotes = function (s) {
        if (!s.match(/^[a-zA-Z][_\$a-zA-Z0-9]*$/))
            return true;
        if (s.match(/^(all|any|and|as|asc|avg|between|class|count|delete|desc|distinct|elements|escape|exists|false|fetch|from|full|group|having|in|indices|inner|insert|into|is|join|left|like|limit|max|min|new|not|null|or|order|outer|right|select|set|some|sum|true|union|update|user|versioned|where|case|end|else|then|when|on|both|empty|leading|member|of|trailing)$/i))
            return true;
        return false;
    };
    QueryKey.quote = function (s) {
        return '"' + s.replace(/\"/g, '""') + '"';
    };
    QueryKey.prototype.equals = function (other) {
        return (other != null &&
            this.constructor == other.constructor &&
            this.toString().toLowerCase() == other.toString().toLowerCase());
    };
    QueryKey.prototype.getName = function () {
        return this.name;
    };
    QueryKey.prototype.getParts = function () {
        var ret = [];
        if (this.parent) {
            ret = this.parent.getParts();
        }
        ret.push(this.name);
        return ret;
    };
    QueryKey.prototype.toDisplayString = function () {
        return this.getParts().join('.');
    };
    QueryKey.prototype.toJSON = function () {
        return this.toString();
    };
    QueryKey.prototype.toSQLString = function () {
        var encoded = [];
        var parts = this.getParts();
        for (var i = 0; i < parts.length; i++) {
            if (QueryKey.needsQuotes(parts[i])) {
                encoded.push(QueryKey.quote(parts[i]));
            }
            else {
                encoded.push(parts[i]);
            }
        }
        return encoded.join('.');
    };
    QueryKey.prototype.toString = function (divider) {
        var encoded = [];
        var parts = this.getParts();
        for (var i = 0; i < parts.length; i++) {
            encoded.push(QueryKey.encodePart(parts[i]));
        }
        return encoded.join(divider);
    };
    return QueryKey;
}());

var FieldKey = (function (_super) {
    __extends(FieldKey, _super);
    function FieldKey() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FieldKey.fromParts = function (parts) {
        var ret = null;
        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            if (isString(arg)) {
                ret = new FieldKey(ret, arg);
            }
            else if (arg && arg.length) {
                for (var j = 0; j < arg.length; j++) {
                    ret = new FieldKey(ret, arg[j]);
                }
            }
            else {
                throw 'Illegal argument to fromParts: ' + arg;
            }
        }
        return ret;
    };
    FieldKey.fromString = function (s) {
        var ret = null;
        var r = s.split('/');
        for (var i = 0; i < r.length; i++) {
            ret = new FieldKey(ret, QueryKey.decodePart(r[i]));
        }
        return ret;
    };
    FieldKey.prototype.toString = function () {
        return _super.prototype.toString.call(this, '/');
    };
    return FieldKey;
}(QueryKey));

var multiValueToSingleMap = {
    'in': 'eq',
    containsoneof: 'contains',
    containsnoneof: 'doesnotcontain',
    between: 'gte',
    notbetween: 'lt'
};
var oppositeMap = {
    eq: 'neqornull',
    dateeq: 'dateneq',
    dateneq: 'dateeq',
    neqornull: 'eq',
    neq: 'eq',
    isblank: 'isnonblank',
    isnonblank: 'isblank',
    gt: 'lte',
    dategt: 'datelte',
    lt: 'gte',
    datelt: 'dategte',
    gte: 'lt',
    dategte: 'datelt',
    lte: 'gt',
    datelte: 'dategt',
    contains: 'doesnotcontain',
    doesnotcontain: 'contains',
    doesnotstartwith: 'startswith',
    startswith: 'doesnotstartwith',
    'in': 'notin',
    notin: 'in',
    memberof: 'memberof',
    containsoneof: 'containsnoneof',
    containsnoneof: 'containsoneof',
    hasmvvalue: 'nomvvalue',
    nomvvalue: 'hasmvvalue',
    between: 'notbetween',
    notbetween: 'between'
};
var singleValueToMultiMap = {
    eq: 'in',
    neq: 'notin',
    neqornull: 'notin',
    doesnotcontain: 'containsnoneof',
    contains: 'containsoneof'
};

var urlMap = {};
var EQUAL = generateFilterType('Equals', '=', 'eq', true);
var GREATER_THAN = generateFilterType('Is Greater Than', '>', 'gt', true);
var GREATER_THAN_OR_EQUAL = generateFilterType('Is Greater Than or Equal To', '>=', 'gte', true);
var IN = generateFilterType('Equals One Of', null, 'in', true, ';', 'Equals One Of (example usage: a;b;c)');
var LESS_THAN = generateFilterType('Is Less Than', '<', 'lt', true);
var LESS_THAN_OR_EQUAL = generateFilterType('Is Less Than or Equal To', '=<', 'lte', true);
var NOT_EQUAL = generateFilterType('Does Not Equal', '<>', 'neq', true);
var NOT_IN = generateFilterType('Does Not Equal Any Of', null, 'notin', true, ';', 'Does Not Equal Any Of (example usage: a;b;c)');
var NEQ_OR_NULL = generateFilterType(NOT_EQUAL.getDisplayText(), NOT_EQUAL.getDisplaySymbol(), 'neqornull', true);
var Types = {
    EQUAL: EQUAL,
    DATE_EQUAL: generateFilterType(EQUAL.getDisplayText(), EQUAL.getDisplaySymbol(), 'dateeq', true),
    NOT_EQUAL: NOT_EQUAL,
    NEQ: NOT_EQUAL,
    DATE_NOT_EQUAL: generateFilterType(NOT_EQUAL.getDisplayText(), NOT_EQUAL.getDisplaySymbol(), 'dateneq', true),
    NEQ_OR_NULL: NEQ_OR_NULL,
    NOT_EQUAL_OR_MISSING: NEQ_OR_NULL,
    GREATER_THAN: GREATER_THAN,
    GT: GREATER_THAN,
    DATE_GREATER_THAN: generateFilterType(GREATER_THAN.getDisplayText(), GREATER_THAN.getDisplaySymbol(), 'dategt', true),
    LESS_THAN: LESS_THAN,
    LT: LESS_THAN,
    DATE_LESS_THAN: generateFilterType(LESS_THAN.getDisplayText(), LESS_THAN.getDisplaySymbol(), 'datelt', true),
    GREATER_THAN_OR_EQUAL: GREATER_THAN_OR_EQUAL,
    GTE: GREATER_THAN_OR_EQUAL,
    DATE_GREATER_THAN_OR_EQUAL: generateFilterType(GREATER_THAN_OR_EQUAL.getDisplayText(), GREATER_THAN_OR_EQUAL.getDisplaySymbol(), 'dategte', true),
    LESS_THAN_OR_EQUAL: LESS_THAN_OR_EQUAL,
    LTE: LESS_THAN_OR_EQUAL,
    DATE_LESS_THAN_OR_EQUAL: generateFilterType(LESS_THAN_OR_EQUAL.getDisplayText(), LESS_THAN_OR_EQUAL.getDisplaySymbol(), 'datelte', true),
    STARTS_WITH: generateFilterType('Starts With', null, 'startswith', true),
    DOES_NOT_START_WITH: generateFilterType('Does Not Start With', null, 'doesnotstartwith', true),
    CONTAINS: generateFilterType('Contains', null, 'contains', true),
    DOES_NOT_CONTAIN: generateFilterType('Does Not Contain', null, 'doesnotcontain', true),
    CONTAINS_ONE_OF: generateFilterType('Contains One Of', null, 'containsoneof', true, ';', 'Contains One Of (example usage: a;b;c)'),
    CONTAINS_NONE_OF: generateFilterType('Does Not Contain Any Of', null, 'containsnoneof', true, ';', 'Does Not Contain Any Of (example usage: a;b;c)'),
    IN: IN,
    EQUALS_ONE_OF: IN,
    NOT_IN: NOT_IN,
    EQUALS_NONE_OF: NOT_IN,
    BETWEEN: generateFilterType('Between', null, 'between', true, ',', 'Between, Inclusive (example usage: -4,4)', 2, 2),
    NOT_BETWEEN: generateFilterType('Not Between', null, 'notbetween', true, ',', 'Not Between, Exclusive (example usage: -4,4)', 2, 2),
    MEMBER_OF: generateFilterType('Member Of', null, 'memberof', true, undefined, 'Member Of'),
    HAS_ANY_VALUE: generateFilterType('Has Any Value'),
    ISBLANK: generateFilterType('Is Blank', null, 'isblank'),
    MISSING: generateFilterType('Is Blank', null, 'isblank'),
    NONBLANK: generateFilterType('Is Not Blank', null, 'isnonblank'),
    NOT_MISSING: generateFilterType('Is Not Blank', null, 'isnonblank'),
    HAS_MISSING_VALUE: generateFilterType('Has a missing value indicator', null, 'hasmvvalue'),
    DOES_NOT_HAVE_MISSING_VALUE: generateFilterType('Does not have a missing value indicator', null, 'nomvvalue'),
    EXP_CHILD_OF: generateFilterType('Is Child Of', null, 'exp:childof', true, undefined, ' is child of'),
    Q: generateFilterType('Search', null, 'q', true, undefined, 'Search across all columns', undefined, undefined, true)
};
var TYPES_BY_JSON_TYPE = {
    'boolean': [Types.HAS_ANY_VALUE, Types.EQUAL, Types.NEQ_OR_NULL, Types.ISBLANK, Types.NONBLANK],
    'date': [Types.HAS_ANY_VALUE, Types.DATE_EQUAL, Types.DATE_NOT_EQUAL, Types.ISBLANK, Types.NONBLANK, Types.DATE_GREATER_THAN, Types.DATE_LESS_THAN, Types.DATE_GREATER_THAN_OR_EQUAL, Types.DATE_LESS_THAN_OR_EQUAL],
    'float': [Types.HAS_ANY_VALUE, Types.EQUAL, Types.NEQ_OR_NULL, Types.ISBLANK, Types.NONBLANK, Types.GT, Types.LT, Types.GTE, Types.LTE, Types.IN, Types.NOT_IN, Types.BETWEEN, Types.NOT_BETWEEN],
    'int': [Types.HAS_ANY_VALUE, Types.EQUAL, Types.NEQ_OR_NULL, Types.ISBLANK, Types.NONBLANK, Types.GT, Types.LT, Types.GTE, Types.LTE, Types.IN, Types.NOT_IN, Types.BETWEEN, Types.NOT_BETWEEN],
    'string': [Types.HAS_ANY_VALUE, Types.EQUAL, Types.NEQ_OR_NULL, Types.ISBLANK, Types.NONBLANK, Types.GT, Types.LT, Types.GTE, Types.LTE, Types.CONTAINS, Types.DOES_NOT_CONTAIN, Types.DOES_NOT_START_WITH, Types.STARTS_WITH, Types.IN, Types.NOT_IN, Types.CONTAINS_ONE_OF, Types.CONTAINS_NONE_OF, Types.BETWEEN, Types.NOT_BETWEEN]
};
var TYPES_BY_JSON_TYPE_DEFAULT = {
    'boolean': Types.EQUAL,
    'date': Types.DATE_EQUAL,
    'float': Types.EQUAL,
    'int': Types.EQUAL,
    'string': Types.CONTAINS
};
function generateFilterType(displayText, displaySymbol, urlSuffix, dataValueRequired, multiValueSeparator, longDisplayText, minOccurs, maxOccurs, tableWise) {
    var isDataValueRequired = function () { return dataValueRequired === true; };
    var isMultiValued = function () { return multiValueSeparator != null; };
    var isTableWise = function () { return tableWise === true; };
    var doValidate = function (value, jsonType, columnName) {
        if (!isDataValueRequired()) {
            return undefined;
        }
        var f = TYPES_BY_JSON_TYPE[jsonType.toLowerCase()];
        var found = false;
        for (var i = 0; !found && i < f.length; i++) {
            if (f[i].getURLSuffix() == urlSuffix) {
                found = true;
            }
        }
        if (!found) {
            alert("Filter type '" + displayText + "' can't be applied to " + type + " types.");
            return undefined;
        }
        if (isMultiValued())
            return validateMultiple(type, jsonType, value, columnName, multiValueSeparator, minOccurs, maxOccurs);
        return validate(jsonType, value, columnName);
    };
    var type = {
        getDisplaySymbol: function () { return displaySymbol || null; },
        getDisplayText: function () { return displayText; },
        getLongDisplayText: function () { return longDisplayText || displayText; },
        getURLSuffix: function () { return urlSuffix || null; },
        isDataValueRequired: isDataValueRequired,
        isMultiValued: isMultiValued,
        isTableWise: isTableWise,
        getMultiValueFilter: function () {
            return isMultiValued() ? null : urlMap[singleValueToMultiMap[urlSuffix]];
        },
        getMultiValueMaxOccurs: function () { return maxOccurs; },
        getMultiValueMinOccurs: function () { return minOccurs; },
        getMultiValueSeparator: function () { return multiValueSeparator || null; },
        getOpposite: function () {
            return oppositeMap[urlSuffix] ? urlMap[oppositeMap[urlSuffix]] : null;
        },
        getSingleValueFilter: function () {
            return isMultiValued ? urlMap[multiValueToSingleMap[urlSuffix]] : null;
        },
        splitValue: function (value) {
            if (type.isMultiValued()) {
                if (isString(value)) {
                    if (value.indexOf("{json:") === 0 && value.indexOf("}") === value.length - 1) {
                        value = JSON.parse(value.substring("{json:".length, value.length - 1));
                    }
                    else {
                        value = value.split(type.getMultiValueSeparator());
                    }
                }
                if (!isArray(value))
                    throw new Error("Filter '" + type.getDisplayText() + "' must be created with Array of values or a '" + type.getMultiValueSeparator() + "' separated string of values: " + value);
            }
            if (!type.isMultiValued() && isArray(value))
                throw new Error("Array of values not supported for '" + type.getDisplayText() + "' filter: " + value);
            return value;
        },
        getURLParameterValue: function (value) {
            if (!type.isDataValueRequired()) {
                return '';
            }
            if (type.isMultiValued() && isArray(value)) {
                var sep_1 = type.getMultiValueSeparator();
                var found = value.some(function (v) {
                    return isString(v) && v.indexOf(sep_1) !== -1;
                });
                if (found) {
                    return '{json:' + JSON.stringify(value) + '}';
                }
                else {
                    return value.join(sep_1);
                }
            }
            return value;
        },
        validate: doValidate
    };
    urlMap[urlSuffix] = type;
    return type;
}
function getDefaultFilterForType(jsonType) {
    if (jsonType && TYPES_BY_JSON_TYPE_DEFAULT[jsonType.toLowerCase()]) {
        return TYPES_BY_JSON_TYPE_DEFAULT[jsonType.toLowerCase()];
    }
    return Types.EQUAL;
}
function getFilterTypeForURLSuffix(urlSuffix) {
    return urlMap[urlSuffix];
}
function getFilterTypesForType(jsonType, mvEnabled) {
    var types = [];
    if (jsonType && TYPES_BY_JSON_TYPE[jsonType.toLowerCase()]) {
        types = types.concat(TYPES_BY_JSON_TYPE[jsonType.toLowerCase()]);
    }
    if (mvEnabled) {
        types.push(Types.HAS_MISSING_VALUE);
        types.push(Types.DOES_NOT_HAVE_MISSING_VALUE);
    }
    return types;
}
function twoDigit(num) {
    if (num < 10) {
        return '0' + num;
    }
    return '' + num;
}
function validate(jsonType, value, columnName) {
    var strValue = value.toString();
    if (jsonType === 'boolean') {
        var upperVal = strValue.toUpperCase();
        if (upperVal == 'TRUE' || upperVal == '1' || upperVal == 'YES' || upperVal == 'Y' || upperVal == 'ON' || upperVal == 'T') {
            return '1';
        }
        if (upperVal == 'FALSE' || upperVal == '0' || upperVal == 'NO' || upperVal == 'N' || upperVal == 'OFF' || upperVal == 'F') {
            return '0';
        }
        else {
            alert(strValue + " is not a valid boolean for field '" + columnName + "'. Try true,false; yes,no; y,n; on,off; or 1,0.");
            return undefined;
        }
    }
    else if (jsonType === 'date') {
        var year = void 0, month = void 0, day = void 0, hour = void 0, minute = void 0;
        hour = 0;
        minute = 0;
        if (strValue.match(/^\s*(\d\d\d\d)-(\d\d)-(\d\d)\s*$/) ||
            strValue.match(/^\s*(\d\d\d\d)-(\d\d)-(\d\d)\s*(\d\d):(\d\d)\s*$/)) {
            return strValue;
        }
        else {
            var dateVal = new Date(strValue);
            if (isNaN(dateVal)) {
                if (strValue.match(/^(-|\+)/i)) {
                    return strValue;
                }
                alert(strValue + " is not a valid date for field '" + columnName + "'.");
                return undefined;
            }
            if (strValue.match(/\d+\/\d+\/\d{2}(\D|$)/)) {
                if (dateVal.getFullYear() < new Date().getFullYear() - 80)
                    dateVal.setFullYear(dateVal.getFullYear() + 100);
            }
            year = dateVal.getFullYear();
            month = dateVal.getMonth() + 1;
            day = dateVal.getDate();
            hour = dateVal.getHours();
            minute = dateVal.getMinutes();
        }
        var str = '' + year + '-' + twoDigit(month) + '-' + twoDigit(day);
        if (hour != 0 || minute != 0)
            str += ' ' + twoDigit(hour) + ':' + twoDigit(minute);
        return str;
    }
    else if (jsonType === 'float') {
        var decVal = parseFloat(strValue);
        if (isNaN(decVal)) {
            alert(strValue + " is not a valid decimal number for field '" + columnName + "'.");
            return undefined;
        }
    }
    else if (jsonType === 'int') {
        var intVal = parseInt(strValue);
        if (isNaN(intVal)) {
            alert(strValue + " is not a valid integer for field '" + columnName + "'.");
            return undefined;
        }
        else {
            return '' + intVal;
        }
    }
    else {
        return strValue;
    }
}
function validateMultiple(filterType, jsonType, value, columnName, sep, minOccurs, maxOccurs) {
    var values;
    try {
        values = filterType.splitValue(value);
    }
    catch (x) {
        alert("Failed to validate filter: " + x.toString());
        return undefined;
    }
    for (var i = 0; i < values.length; i++) {
        var valid = validate(jsonType, values[i].trim(), columnName);
        if (valid == undefined) {
            return undefined;
        }
    }
    if (minOccurs !== undefined && minOccurs > 0) {
        if (values.length < minOccurs) {
            alert("At least " + minOccurs + " '" + sep + "' separated values are required");
            return undefined;
        }
    }
    if (maxOccurs !== undefined && maxOccurs > 0) {
        if (values.length > maxOccurs) {
            alert("At most " + maxOccurs + " '" + sep + "' separated values are allowed");
            return undefined;
        }
    }
    return filterType.getURLParameterValue(values);
}

var Filter = (function () {
    function Filter(columnName, value, filterType) {
        if (columnName) {
            if (columnName instanceof FieldKey) {
                columnName = columnName.toString();
            }
            else if (columnName instanceof Array) {
                columnName = columnName.join('/');
            }
        }
        if (!filterType) {
            filterType = Types.EQUAL;
        }
        if (filterType.isTableWise()) {
            columnName = '*';
        }
        if (value) {
            value = filterType.splitValue(value);
        }
        this.columnName = columnName;
        this.filterType = filterType;
        this.value = value;
    }
    Filter.prototype.getColumnName = function () {
        return this.columnName;
    };
    Filter.prototype.getFilterType = function () {
        return this.filterType;
    };
    Filter.prototype.getURLParameterName = function (dataRegionName) {
        return [
            ensureRegionName(dataRegionName),
            '.',
            this.columnName,
            '~',
            this.filterType.getURLSuffix()
        ].join('');
    };
    Filter.prototype.getURLParameterValue = function () {
        return this.filterType.getURLParameterValue(this.value);
    };
    Filter.prototype.getValue = function () {
        return this.value;
    };
    return Filter;
}());
function appendAggregateParams(params, aggregates, dataRegionName) {
    var prefix = ensureRegionName(dataRegionName) + '.agg.';
    var _params = params || {};
    if (isArray(aggregates)) {
        for (var i = 0; i < aggregates.length; i++) {
            var aggregate = aggregates[i];
            var value = 'type=' + aggregate.type;
            if (aggregate.label) {
                value = value + '&label=' + aggregate.label;
            }
            if (aggregate.type && aggregate.column) {
                var paramName = prefix + aggregate.column;
                var paramValue = encodeURIComponent(value);
                if (_params[paramName] !== undefined) {
                    var values = _params[paramName];
                    if (!isArray(values)) {
                        values = [values];
                    }
                    values.push(paramValue);
                    paramValue = values;
                }
                _params[paramName] = paramValue;
            }
        }
    }
    return _params;
}
function appendFilterParams(params, filterArray, dataRegionName) {
    var regionName = ensureRegionName(dataRegionName);
    var filterParams = params || {};
    if (filterArray) {
        for (var i = 0; i < filterArray.length; i++) {
            var filter = filterArray[i];
            if (filter.getFilterType().isDataValueRequired() && null == filter.getURLParameterValue()) {
                continue;
            }
            var name_1 = filter.getURLParameterName(regionName);
            var value = filter.getURLParameterValue();
            if (filterParams[name_1] !== undefined) {
                var values = filterParams[name_1];
                if (!isArray(values)) {
                    values = [values];
                }
                values.push(value);
                value = values;
            }
            filterParams[name_1] = value;
        }
    }
    return filterParams;
}
function create(column, value, type) {
    return new Filter(column, value, type);
}
function getFilterDescription(url, dataRegionName, columnName) {
    var params = getParameters(url);
    var result = '';
    var sep = '';
    for (var paramName in params) {
        if (params.hasOwnProperty(paramName)) {
            if (paramName.indexOf(dataRegionName + '.' + columnName + '~') == 0) {
                var filterType = paramName.substring(paramName.indexOf('~') + 1);
                var values = params[paramName];
                if (!isArray(values)) {
                    values = [values];
                }
                var friendly = getFilterTypeForURLSuffix(filterType);
                var displayText = void 0;
                if (friendly) {
                    displayText = friendly.getDisplayText();
                }
                else {
                    displayText = filterType;
                }
                for (var i = 0; i < values.length; i++) {
                    result += sep + displayText + ' ' + values[i];
                    sep = ' AND ';
                }
            }
        }
    }
    return result;
}
function getFiltersFromUrl(url, dataRegionName) {
    var filters = [];
    var params = getParameters(url);
    var regionName = ensureRegionName(dataRegionName);
    for (var paramName in params) {
        if (params.hasOwnProperty(paramName)) {
            if (paramName.indexOf(regionName + '.') == 0) {
                var tilde = paramName.indexOf('~');
                if (tilde != -1) {
                    var columnName = paramName.substring(regionName.length + 1, tilde);
                    var filterName = paramName.substring(tilde + 1);
                    var filterType = getFilterTypeForURLSuffix(filterName);
                    var values = params[paramName];
                    if (isArray(values)) {
                        for (var i = 0; i < values.length; i++) {
                            filters.push(create(columnName, values[i], filterType));
                        }
                    }
                    else {
                        filters.push(create(columnName, values, filterType));
                    }
                }
            }
        }
    }
    return filters;
}
function getQueryParamsFromUrl(url, dataRegionName) {
    var queryParams = {};
    var params = getParameters(url);
    var key = ensureRegionName(dataRegionName) + '.param.';
    for (var paramName in params) {
        if (params.hasOwnProperty(paramName)) {
            if (paramName.indexOf(key) == 0) {
                var qParamName = paramName.substring(key.length);
                queryParams[qParamName] = params[paramName];
            }
        }
    }
    return queryParams;
}
function getSortFromUrl(url, dataRegionName) {
    var regionName = ensureRegionName(dataRegionName);
    var params = getParameters(url);
    return params[regionName + '.sort'];
}
function merge$1(baseFilters, columnName, columnFilters) {
    var newFilters = [];
    if (baseFilters && baseFilters.length > 0) {
        for (var i = 0; i < baseFilters.length; i++) {
            var bi = baseFilters[i];
            if (bi.getColumnName() != columnName) {
                newFilters.push(bi);
            }
        }
    }
    return columnFilters && columnFilters.length > 0 ? newFilters.concat(columnFilters) : newFilters;
}

function getAll(options) {
    if (arguments.length > 1) {
        options = {
            success: arguments[0],
            failure: arguments[1],
            parameters: {},
            containerPath: arguments[2]
        };
    }
    getAssays(options);
}
var AssayLink;
(function (AssayLink) {
    AssayLink["BATCHES"] = "batches";
    AssayLink["BEGIN"] = "begin";
    AssayLink["DESIGN_COPY"] = "designCopy";
    AssayLink["DESIGN_EDIT"] = "designEdit";
    AssayLink["IMPORT"] = "import";
    AssayLink["RESULT"] = "result";
    AssayLink["RESULTS"] = "results";
    AssayLink["RUNS"] = "runs";
})(AssayLink || (AssayLink = {}));
function getAssays(options) {
    if (arguments.length > 1) {
        options = {
            success: arguments[0],
            failure: arguments[1],
            parameters: arguments[2],
            containerPath: arguments[3]
        };
    }
    moveParameter(options, 'id');
    moveParameter(options, 'type');
    moveParameter(options, 'name');
    request({
        url: buildURL('assay', 'assayList.api', options.containerPath),
        method: 'POST',
        jsonData: options.parameters,
        success: getSuccessCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        scope: options.scope || this
    });
}
function getById(options) {
    var config = options;
    if (arguments.length > 1) {
        config = {
            success: arguments[0],
            failure: arguments[1],
            parameters: { id: arguments[2] },
            containerPath: arguments[3]
        };
    }
    moveParameter(config, 'id');
    getAssays(config);
}
function getByName(options) {
    var config = options;
    if (arguments.length > 1) {
        config = {
            success: arguments[0],
            failure: arguments[1],
            parameters: { name: arguments[2] },
            containerPath: arguments[3]
        };
    }
    moveParameter(config, 'name');
    getAssays(config);
}
function getByType(options) {
    var config = options;
    if (arguments.length > 1) {
        config = {
            success: arguments[0],
            failure: arguments[1],
            parameters: { type: arguments[2] },
            containerPath: arguments[3]
        };
    }
    moveParameter(config, 'type');
    getAssays(config);
}
function getNAbRuns(options) {
    var params = merge({}, options);
    if (options.sort) {
        params['query.sort'] = options.sort;
    }
    if (options.offset) {
        params['query.offset'] = options.offset;
    }
    if (options.maxRows) {
        if (options.maxRows < 0) {
            params['query.showRows'] = 'all';
        }
        else {
            params['query.maxRows'] = options.maxRows;
        }
    }
    var success = getOnSuccess(options);
    request({
        url: buildURL('nabassay', 'getNabRuns', options.containerPath),
        method: 'GET',
        params: appendFilterParams(params, options.filterArray),
        success: getCallbackWrapper(function (data) {
            if (success) {
                success.call(options.scope, data.runs);
            }
        }, this),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        timeout: options.timeout
    });
}
function getStudyNabGraphURL(options) {
    var params = {};
    applyTranslated(params, options, { objectIds: 'id' }, true, false);
    request({
        url: buildURL('nabassay', 'getStudyNabGraphURL'),
        method: 'GET',
        params: params,
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options) || displayAjaxErrorResponse, options.scope, true),
        timeout: options.timeout
    });
}
function getStudyNabRuns(options) {
    var params = merge({}, options);
    var success = getOnSuccess(options);
    request({
        url: buildURL('nabassay', 'getStudyNabRuns', options.containerPath),
        method: 'GET',
        params: params,
        success: getCallbackWrapper(function (data) {
            if (success) {
                success.call(options.scope, data.runs);
            }
        }, this),
        failure: getCallbackWrapper(getOnFailure(options) || displayAjaxErrorResponse, options.scope, true),
        timeout: options.timeout
    });
}
function getSuccessCallbackWrapper(success, scope) {
    var _this = this;
    return getCallbackWrapper(function (data, response) {
        if (success) {
            success.call(_this, data.definitions, response);
        }
    }, (scope || this));
}
function moveParameter(config, param) {
    if (!config.parameters) {
        config.parameters = {};
    }
    if (config[param]) {
        config.parameters[param] = config[param];
        delete config[param];
    }
}

var Assay = /*#__PURE__*/Object.freeze({
    getAll: getAll,
    getById: getById,
    getByName: getByName,
    getByType: getByType,
    getNAbRuns: getNAbRuns,
    getStudyNabGraphURL: getStudyNabGraphURL,
    getStudyNabRuns: getStudyNabRuns
});

function create$1(config) {
    var options = arguments.length > 1 ? mapCreateArguments(arguments) : config;
    request({
        url: buildURL('property', 'createDomain.api', options.containerPath),
        method: 'POST',
        jsonData: options,
        success: getCallbackWrapper(options.success),
        failure: getCallbackWrapper(options.failure, this, true)
    });
}
function mapCreateArguments(args) {
    var options = {
        failure: args[1],
        success: args[0]
    };
    if ((args.length === 4 || args.length === 5) && isString(args[3])) {
        options.containerPath = args[4];
        options.domainGroup = args[2];
        options.domainTemplate = args[3];
    }
    else {
        options.containerPath = args[5];
        options.domainDesign = args[3];
        options.kind = args[2];
        options.options = args[4];
    }
    return options;
}
function drop(config) {
    request({
        url: buildURL('property', 'deleteDomain.api', config.containerPath),
        method: 'POST',
        success: getCallbackWrapper(config.success),
        failure: getCallbackWrapper(config.failure, this, true),
        jsonData: {
            domainDesign: config.domainDesign,
            schemaName: config.schemaName,
            queryName: config.queryName
        }
    });
}
function get(config) {
    var options = arguments.length > 1 ? {
        containerPath: arguments[4],
        failure: arguments[1],
        queryName: arguments[3],
        schemaName: arguments[2],
        success: arguments[0]
    } : config;
    request({
        url: buildURL('property', 'getDomain.api', options.containerPath),
        method: 'GET',
        success: getCallbackWrapper(options.success),
        failure: getCallbackWrapper(options.failure, this, true),
        params: {
            schemaName: options.schemaName,
            queryName: options.queryName,
            domainId: options.domainId
        }
    });
}
function save(config) {
    var options = arguments.length > 1 ? {
        success: arguments[0],
        failure: arguments[1],
        domainDesign: arguments[2],
        schemaName: arguments[3],
        queryName: arguments[4],
        containerPath: arguments[5]
    } : config;
    request({
        url: buildURL('property', 'saveDomain.api', options.containerPath),
        method: 'POST',
        success: getCallbackWrapper(options.success),
        failure: getCallbackWrapper(options.failure, this, true),
        jsonData: {
            domainDesign: options.domainDesign,
            schemaName: options.schemaName,
            queryName: options.queryName,
            domainId: options.domainId
        }
    });
}

var Domain = /*#__PURE__*/Object.freeze({
    create: create$1,
    drop: drop,
    get: get,
    save: save
});



var Filter$1 = /*#__PURE__*/Object.freeze({
    appendAggregateParams: appendAggregateParams,
    appendFilterParams: appendFilterParams,
    create: create,
    getDefaultFilterForType: getDefaultFilterForType,
    getFilterDescription: getFilterDescription,
    getFiltersFromUrl: getFiltersFromUrl,
    getFilterTypeForURLSuffix: getFilterTypeForURLSuffix,
    getFilterTypesForType: getFilterTypesForType,
    getQueryParamsFromUrl: getQueryParamsFromUrl,
    getSortFromUrl: getSortFromUrl,
    merge: merge$1,
    Types: Types
});

function create$2(config) {
    var domainOptions = {
        domainDesign: config,
        options: {}
    };
    if (!domainOptions.domainDesign.name) {
        throw new Error('List name required');
    }
    if (!config.kind) {
        if (config.keyType == 'int') {
            config.kind = 'IntList';
        }
        else if (config.keyType == 'string') {
            config.kind = 'VarList';
        }
    }
    if (config.kind != 'IntList' && config.kind != 'VarList') {
        throw new Error('Domain kind or keyType required');
    }
    domainOptions.kind = config.kind;
    if (!config.keyName) {
        throw new Error('List keyName required');
    }
    domainOptions.options.keyName = config.keyName;
    create$1(domainOptions);
}

var List = /*#__PURE__*/Object.freeze({
    create: create$2
});

var MultiRequest = function (config) {
    config = config || {};
    var doneCallbacks = [];
    var listeners;
    var requests;
    var self = this;
    var sending = false;
    var sendQ = [];
    var waitQ = [];
    if (isArray(config)) {
        requests = config;
    }
    else {
        requests = config.requests;
        listeners = config.listeners;
    }
    if (requests) {
        for (var i = 0; i < requests.length; i++) {
            var request = requests[i];
            this.add(request[0], request[1]);
        }
    }
    if (listeners && listeners.done) {
        applyCallback(listeners.done, listeners.scope);
    }
    if (waitQ.length && doneCallbacks.length > 0) {
        this.send();
    }
    function applyCallback(callback, scope) {
        if (typeof callback == 'function') {
            doneCallbacks.push({
                fn: callback,
                scope: scope
            });
        }
        else if (typeof callback.fn == 'function') {
            doneCallbacks.push({
                fn: callback.fn,
                scope: callback.scope || scope
            });
        }
    }
    function checkDone() {
        sendQ.pop();
        if (sendQ.length == 0) {
            sending = false;
            fireDone();
            self.send();
        }
        return true;
    }
    function createSequence(fn1, fn2, scope) {
        return function () {
            var ret = fn1.apply(scope || this || window, arguments);
            fn2.apply(scope || this || window, arguments);
            return ret;
        };
    }
    function fireDone() {
        for (var i = 0; i < doneCallbacks.length; i++) {
            var cb = doneCallbacks[i];
            if (cb.fn && typeof cb.fn == 'function') {
                cb.fn.call(cb.scope || window);
            }
        }
    }
    this.add = function (fn, config, scope) {
        config = config || {};
        var success = getOnSuccess(config);
        if (!success) {
            success = function () { };
        }
        if (!success._hookInstalled) {
            config.success = createSequence(success, checkDone, config.scope);
            config.success._hookInstalled = true;
        }
        var failure = getOnFailure(config);
        if (!failure) {
            failure = function () { };
        }
        if (!failure._hookInstalled) {
            config.failure = createSequence(failure, checkDone, config.scope);
            config.failure._hookInstalled = true;
        }
        waitQ.push({
            args: [config],
            fn: fn,
            scope: scope
        });
        return this;
    };
    this.send = function (callback, scope) {
        if (sending || waitQ.length === 0) {
            return;
        }
        sending = true;
        sendQ = waitQ;
        waitQ = [];
        var len = sendQ.length;
        for (var i = 0; i < len; i++) {
            var q = sendQ[i];
            q.fn.apply(q.scope || window, q.args);
        }
        applyCallback(callback, scope);
    };
};

function createMsgContent(type, content) {
    return {
        content: content,
        type: type
    };
}
function createPrincipalIdRecipient(type, principalId) {
    return {
        principalId: principalId,
        type: type
    };
}
function createRecipient(type, address) {
    return {
        address: address,
        type: type
    };
}
var msgType = {
    html: 'text/html',
    plain: 'text/plain'
};
var recipientType = {
    bcc: 'BCC',
    cc: 'CC',
    to: 'TO'
};
function sendMessage(config) {
    var jsonData = {};
    if (config.msgFrom != undefined) {
        jsonData.msgFrom = config.msgFrom;
    }
    if (config.msgRecipients != undefined) {
        jsonData.msgRecipients = config.msgRecipients;
    }
    if (config.msgContent != undefined) {
        jsonData.msgContent = config.msgContent;
    }
    if (config.msgSubject != undefined) {
        jsonData.msgSubject = config.msgSubject;
    }
    return request({
        url: buildURL('announcements', 'sendMessage.api'),
        method: 'POST',
        jsonData: jsonData,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}

var Message = /*#__PURE__*/Object.freeze({
    createMsgContent: createMsgContent,
    createPrincipalIdRecipient: createPrincipalIdRecipient,
    createRecipient: createRecipient,
    msgType: msgType,
    recipientType: recipientType,
    sendMessage: sendMessage
});

function updateParticipantGroup(config) {
    var jsonData = {
        rowId: config.rowId
    };
    if (config.participantIds) {
        jsonData.participantIds = config.participantIds;
    }
    if (config.ensureParticipantIds) {
        jsonData.ensureParticipantIds = config.ensureParticipantIds;
    }
    if (config.deleteParticipantIds) {
        jsonData.deleteParticipantIds = config.deleteParticipantIds;
    }
    if (config.label) {
        jsonData.label = config.label;
    }
    if (config.description) {
        jsonData.description = config.description;
    }
    if (config.filters) {
        jsonData.filters = config.filters;
    }
    request({
        url: buildURL('participant-group', 'updateParticipantGroup.api', config.containerPath),
        method: config.method || 'POST',
        jsonData: jsonData,
        success: getCallbackWrapper(function (data) {
            config.success(data.group);
        }, this),
        failure: getCallbackWrapper(config.failure, this, true)
    });
}

var ParticipantGroup = /*#__PURE__*/Object.freeze({
    updateParticipantGroup: updateParticipantGroup
});

function getFileStatus(config) {
    var _this = this;
    var params = {
        taskId: config.taskId,
        path: config.path,
        file: config.files,
        protocolName: config.protocolName
    };
    var onSuccess = getOnSuccess(config);
    request({
        url: buildURL('pipeline-analysis', 'getFileStatus.api', config.containerPath),
        method: 'POST',
        params: params,
        success: getCallbackWrapper(function (data, response) {
            onSuccess.call(_this, data.files, data.submitType, response);
        }, config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
        timeout: 60000000
    });
}
function getPipelineContainer(config) {
    return request({
        url: buildURL('pipeline', 'getPipelineContainer.api', config.containerPath),
        method: 'GET',
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}
function getProtocols(config) {
    var _this = this;
    var params = {
        taskId: config.taskId,
        includeWorkbooks: !!config.includeWorkbooks,
        path: config.path
    };
    var onSuccess = getOnSuccess(config);
    request({
        url: buildURL('pipeline-analysis', 'getSavedProtocols.api', config.containerPath),
        method: 'POST',
        params: params,
        success: getCallbackWrapper(function (data, response) {
            onSuccess.call(_this, data.protocols, data.defaultProtocolName, response);
        }, config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}
function startAnalysis(config) {
    if (!config.protocolName) {
        throw 'Invalid config, must include protocolName property';
    }
    var params = {
        allowNonExistentFiles: config.allowNonExistentFiles,
        file: config.files,
        fileIds: config.fileIds,
        path: config.path,
        pipelineDescription: config.pipelineDescription,
        protocolDescription: config.protocolDescription,
        protocolName: config.protocolName,
        saveProtocol: config.saveProtocol == undefined || config.saveProtocol,
        taskId: config.taskId
    };
    if (config.xmlParameters) {
        if (typeof config.xmlParameters == 'object')
            throw new Error('The xml configuration is deprecated, please user the jsonParameters option to specify your protocol description.');
        else
            params.configureXml = config.xmlParameters;
    }
    else if (config.jsonParameters) {
        params.configureJson = isString(config.jsonParameters) ? config.jsonParameters : encode(config.jsonParameters);
    }
    request({
        url: buildURL('pipeline-analysis', 'startAnalysis.api', config.containerPath),
        method: 'POST',
        params: params,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
        timeout: 60000000
    });
}

var Pipeline = /*#__PURE__*/Object.freeze({
    getFileStatus: getFileStatus,
    getPipelineContainer: getPipelineContainer,
    getProtocols: getProtocols,
    startAnalysis: startAnalysis
});

var SchemaKey = (function (_super) {
    __extends(SchemaKey, _super);
    function SchemaKey() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SchemaKey.fromParts = function (parts) {
        var ret = null;
        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            if (isString(arg)) {
                ret = new SchemaKey(ret, arg);
            }
            else if (arg && arg.length) {
                for (var j = 0; j < arg.length; j++) {
                    ret = new SchemaKey(ret, arg[j]);
                }
            }
            else {
                throw 'Illegal argument to fromParts: ' + arg;
            }
        }
        return ret;
    };
    SchemaKey.fromString = function (s) {
        var r = s.split('.');
        var ret = null;
        for (var i = 0; i < r.length; i++) {
            ret = new SchemaKey(ret, QueryKey.decodePart(r[i]));
        }
        return ret;
    };
    SchemaKey.prototype.toString = function () {
        return _super.prototype.toString.call(this, '.');
    };
    return SchemaKey;
}(QueryKey));

function generateColumnModel(fields) {
    var columns = [];
    for (var i = 0; i < fields.length; i++) {
        columns.push({
            scale: fields[i].scale,
            hidden: fields[i].hidden,
            sortable: fields[i].sortable,
            align: fields[i].align,
            width: fields[i].width,
            dataIndex: fields[i].fieldKey.toString(),
            required: fields[i].nullable,
            editable: fields[i].userEditable,
            header: fields[i].shortCaption
        });
    }
    return columns;
}
function generateGetDisplayField(fieldKey, fields) {
    return function () {
        var fieldString = fieldKey.toString();
        for (var i = 0; i < fields.length; i++) {
            if (fieldString === fields[i].fieldKey.toString()) {
                return fields[i];
            }
        }
        return null;
    };
}
var Response = (function () {
    function Response(rawResponse) {
        for (var attr in rawResponse) {
            if (rawResponse.hasOwnProperty(attr)) {
                this[attr] = rawResponse[attr];
            }
        }
        this.schemaKey = SchemaKey.fromParts(rawResponse.schemaName);
        var fields = rawResponse.metaData.fields;
        for (var i = 0; i < fields.length; i++) {
            var field = Object.assign({}, fields[i]);
            var lookup = field.lookup;
            field.fieldKey = FieldKey.fromParts(field.fieldKey);
            if (lookup && lookup.schemaName) {
                lookup.schemaName = SchemaKey.fromParts(lookup.schemaName);
            }
            if (field.displayField) {
                field.displayField = FieldKey.fromParts(field.displayField);
                field.getDisplayField = generateGetDisplayField(field.displayField, fields);
            }
            if (field.extFormatFn) {
                var ext4Index = field.extFormatFn.indexOf('Ext4.'), isExt4Fn = ext4Index === 0 || ext4Index === 1, canEvalExt3 = !isExt4Fn && window && isDefined(window.Ext), canEvalExt4 = isExt4Fn && window && isDefined(window.Ext4);
                if (canEvalExt3 || canEvalExt4) {
                    field.extFormatFn = eval(field.extFormatFn);
                }
            }
            this.metaData.fields[i] = field;
        }
        this.columnModel = generateColumnModel(this.metaData.fields);
        if (this.rows !== undefined) {
            for (var i = 0; i < this.rows.length; i++) {
                this.rows[i] = new Row(this.rows[i]);
            }
        }
        else {
            this.rows = [];
        }
    }
    Response.prototype.getColumnModel = function () {
        return this.columnModel;
    };
    Response.prototype.getMetaData = function () {
        return this.metaData;
    };
    Response.prototype.getQueryName = function () {
        return this.queryName;
    };
    Response.prototype.getRow = function (idx) {
        if (this.rows[idx] !== undefined) {
            return this.rows[idx];
        }
        throw new Error('No row found for index ' + idx);
    };
    Response.prototype.getRowCount = function () {
        return this.rowCount;
    };
    Response.prototype.getRows = function () {
        return this.rows;
    };
    Response.prototype.getSchemaName = function (asString) {
        return asString ? this.schemaKey.toString() : this.schemaName;
    };
    return Response;
}());
var Row = (function () {
    function Row(rawRow) {
        this.links = null;
        if (rawRow.links) {
            this.links = rawRow.links;
        }
        for (var attr in rawRow.data) {
            if (rawRow.data.hasOwnProperty(attr)) {
                this[attr] = rawRow.data[attr];
            }
        }
    }
    Row.prototype.get = function (columnName) {
        columnName = columnName.toLowerCase();
        for (var attr in this) {
            if (attr.toLowerCase() === columnName && this.hasOwnProperty(attr) && !isFunction(this[attr])) {
                return this[attr];
            }
        }
        return null;
    };
    Row.prototype.getLink = function (linkType) {
        if (this.links && this.links.hasOwnProperty(linkType)) {
            return this.links[linkType];
        }
        return null;
    };
    Row.prototype.getLinks = function () {
        return this.links;
    };
    Row.prototype.getValue = function (columnName) {
        columnName = columnName.toLowerCase();
        for (var attr in this) {
            if (attr.toLowerCase() === columnName && this.hasOwnProperty(attr) && !isFunction(this[attr])) {
                if (isArray(this[attr])) {
                    return this[attr].map(function (i) { return i.value; });
                }
                if (this[attr].hasOwnProperty('value')) {
                    return this[attr].value;
                }
            }
        }
        return null;
    };
    return Row;
}());

var containerFilter = {
    current: 'current',
    currentAndFirstChildren: 'currentAndFirstChildren',
    currentAndSubfolders: 'currentAndSubfolders',
    currentPlusProject: 'currentPlusProject',
    currentAndParents: 'currentAndParents',
    currentPlusProjectAndShared: 'currentPlusProjectAndShared',
    allFolders: 'allFolders'
};
var URL_COLUMN_PREFIX = '_labkeyurl_';
function buildQueryParams(schemaName, queryName, filterArray, sort, dataRegionName) {
    var _a;
    var regionName = ensureRegionName(dataRegionName);
    var params = (_a = {
            dataRegionName: regionName
        },
        _a[regionName + '.queryName'] = queryName,
        _a.schemaName = schemaName,
        _a);
    if (sort) {
        params[regionName + '.sort'] = sort;
    }
    return appendFilterParams(params, filterArray, regionName);
}
function deleteQueryView(options) {
    if (!options) {
        throw 'You must specify a configuration!';
    }
    if (!options.schemaName) {
        throw 'You must specify a schemaName!';
    }
    if (!options.queryName) {
        throw 'You must specify a queryName!';
    }
    var jsonData = {
        schemaName: options.schemaName,
        queryName: options.queryName
    };
    if (options.viewName) {
        jsonData.viewName = options.viewName;
    }
    if (options.revert !== undefined) {
        jsonData.complete = options.revert !== true;
    }
    return request({
        url: buildURL('query', 'deleteView.api', options.containerPath),
        method: 'POST',
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        jsonData: jsonData
    });
}
function getMethod(value) {
    if (value && (value.toUpperCase() === 'GET' || value.toUpperCase() === 'POST'))
        return value.toUpperCase();
    return 'GET';
}
function getQueries(options) {
    var params = {};
    applyTranslated(params, options, {
        schemaName: 'schemaName',
        includeColumns: 'includeColumns',
        includeUserQueries: 'includeUserQueries',
        includeSystemQueries: 'includeSystemQueries'
    }, false, false);
    return request({
        url: buildURL('query', 'getQueries.api', options.containerPath),
        method: 'GET',
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        params: params
    });
}
function getQueryViews(options) {
    var params = {};
    if (options.schemaName) {
        params.schemaName = options.schemaName;
    }
    if (options.queryName) {
        params.queryName = options.queryName;
    }
    if (options.viewName != undefined) {
        params.viewName = options.viewName;
    }
    if (options.metadata) {
        params.metadata = options.metadata;
    }
    return request({
        url: buildURL('query', 'getQueryViews.api', options.containerPath),
        method: 'GET',
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        params: params
    });
}
function getSchemas(options) {
    var params = {};
    if (options.apiVersion) {
        params.apiVersion = options.apiVersion;
    }
    if (options.schemaName) {
        params.schemaName = options.schemaName;
    }
    if (options.includeHidden !== undefined) {
        params.includeHidden = options.includeHidden;
    }
    return request({
        url: buildURL('query', 'getSchemas.api', options.containerPath),
        method: 'GET',
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        params: params
    });
}
function getServerDate(options) {
    return request({
        url: buildURL('query', 'getServerDate.api'),
        success: getCallbackWrapper(function (json) {
            var onSuccess = getOnSuccess(options);
            if (json && json.date && onSuccess) {
                onSuccess(new Date(json.date));
            }
        }, this),
        failure: getCallbackWrapper(getOnFailure(options), options.scope)
    });
}
function getSuccessCallbackWrapper$1(fn, stripHiddenCols, scope, requiredVersion) {
    var _this = this;
    if (requiredVersion) {
        var versionString = requiredVersion.toString();
        if (versionString === '13.2' || versionString === '16.2' || versionString === '17.1') {
            return getCallbackWrapper(function (data, response, options) {
                if (data && fn) {
                    fn.call(scope || _this, new Response(data), response, options);
                }
            }, this);
        }
    }
    return getCallbackWrapper(function (data, response, options) {
        if (fn) {
            if (data && data.rows && stripHiddenCols) {
                stripHiddenColData(data);
            }
            fn.call(scope || _this, data, options, response);
        }
    }, this);
}
function saveQueryViews(options) {
    var jsonData = {};
    if (options.schemaName) {
        jsonData.schemaName = options.schemaName;
    }
    if (options.queryName) {
        jsonData.queryName = options.queryName;
    }
    if (options.views) {
        jsonData.views = options.views;
    }
    return request({
        url: buildURL('query', 'saveQueryViews.api', options.containerPath),
        method: 'POST',
        jsonData: jsonData,
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}
function sqlDateLiteral(date) {
    if (date === undefined || date === null || !date) {
        return "NULL";
    }
    if (typeof date == 'string') {
        try {
            date = new Date(date);
        }
        catch (x) { }
    }
    if (typeof date == 'object' && typeof date.toISOString == 'function') {
        var fmt2 = function (a) { return (a >= 10 ? '' + a : '0' + a); };
        return ("{d '" +
            date.getFullYear() + "-" + fmt2(date.getMonth() + 1) + "-" + fmt2(date.getDate()) +
            "'}");
    }
    return "{d '" + sqlStringLiteral(date.toString()) + "'}";
}
function sqlDateTimeLiteral(date, withMS) {
    if (date === undefined || date === null || !date) {
        return 'NULL';
    }
    if (typeof date == 'string') {
        try {
            date = new Date(date);
        }
        catch (x) { }
    }
    if (typeof date == 'object' && typeof date.toISOString == 'function') {
        var fmt2_1 = function (a) { return (a >= 10 ? '' + a : '0' + a); };
        var fmt3 = function (a) { return (a >= 100 ? '' + a : '0' + fmt2_1(a)); };
        return "{ts '" +
            date.getFullYear() + "-" + fmt2_1(date.getMonth() + 1) + "-" + fmt2_1(date.getDate()) + " " + fmt2_1(date.getHours()) + ":" + fmt2_1(date.getMinutes()) + ":" + fmt2_1(date.getSeconds()) +
            (withMS ? "." + fmt3(date.getMilliseconds()) : "")
            + "'}";
    }
    return "{ts '" + this.sqlStringLiteral(date) + "'}";
}
function sqlStringLiteral(str) {
    if (str === undefined || str === null || str == '') {
        return 'NULL';
    }
    return "'" + str.toString().replace("'", "''") + "'";
}
function stripHiddenColData(data) {
    var hiddenCols = [];
    var newColModel = [];
    var newMetaFields = [];
    var colModel = data.columnModel;
    for (var i = 0; i < colModel.length; ++i) {
        if (colModel[i].hidden) {
            hiddenCols.push(colModel[i].dataIndex);
        }
        else {
            newColModel.push(colModel[i]);
            newMetaFields.push(data.metaData.fields[i]);
        }
    }
    data.columnModel = newColModel;
    data.metaData.fields = newMetaFields;
    for (var i = 0; i < data.rows.length; ++i) {
        var row = data.rows[i];
        for (var h = 0; h < hiddenCols.length; ++h) {
            delete row[hiddenCols[h]];
            delete row[URL_COLUMN_PREFIX + hiddenCols[h]];
        }
    }
}
function validateQuery(options) {
    var action = options.validateQueryMetadata ? 'validateQueryMetadata.api' : 'validateQuery.api';
    var params = {};
    applyTranslated(params, options, {
        successCallback: false,
        errorCallback: false,
        scope: false
    });
    return request({
        url: buildURL('query', action, options.containerPath),
        method: 'GET',
        params: params,
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}

function buildParams(options) {
    var jsonData = {
        schemaName: options.schemaName,
        sql: options.sql
    };
    if (options.saveInSession !== undefined && options.saveInSession !== null) {
        jsonData.saveInSession = options.saveInSession;
    }
    if (options.maxRows !== undefined && options.maxRows >= 0) {
        jsonData.maxRows = options.maxRows;
    }
    if (options.offset && options.offset > 0) {
        jsonData.offset = options.offset;
    }
    if (options.includeTotalCount != undefined) {
        jsonData.includeTotalCount = options.includeTotalCount;
    }
    if (options.containerFilter) {
        jsonData.containerFilter = options.containerFilter;
    }
    if (options.requiredVersion) {
        jsonData.apiVersion = options.requiredVersion;
    }
    if (options.includeStyle) {
        jsonData.includeStyle = options.includeStyle;
    }
    if (options.parameters) {
        for (var propName in options.parameters) {
            if (options.parameters.hasOwnProperty(propName)) {
                jsonData['query.param.' + propName] = options.parameters[propName];
            }
        }
    }
    return jsonData;
}
function buildURLParams(options) {
    var urlParams = {};
    if (options.sort) {
        urlParams['query.sort'] = options.sort;
    }
    return urlParams;
}
function executeSql(options) {
    return request({
        url: buildURL('query', 'executeSql.api', options.containerPath, buildURLParams(options)),
        method: 'POST',
        success: getSuccessCallbackWrapper$1(getOnSuccess(options), options.stripHiddenColumns, options.scope, options.requiredVersion),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        jsonData: buildParams(options),
        timeout: options.timeout
    });
}

function getRawData(config) {
    var _this = this;
    var jsonData = validateGetDataConfig(config);
    jsonData.renderer.type = 'json';
    if (!config.success) {
        throw new Error('A success callback is required');
    }
    return request({
        url: buildURL('query', 'getData', config.source.containerPath),
        method: 'POST',
        jsonData: jsonData,
        success: function (response, options) {
            var json = decode(response.responseText);
            config.success.call(config.scope || _this, new Response(json), response, options);
        },
        failure: function (response, options) {
            var json = decode(response.responseText);
            if (config.failure) {
                config.failure(json);
            }
            else {
                if (response.status != 0) {
                    console.error('Failure occurred during getData', json);
                }
            }
        }
    });
}
function validateGetDataConfig(config) {
    if (!config || config === null || config === undefined) {
        throw new Error('A config object is required for GetData requests.');
    }
    var source = config.source;
    validateSource(source);
    var jsonData = {
        renderer: {},
        source: {
            schemaName: source.schemaName,
            type: source.type
        }
    };
    if (source.type === 'query') {
        jsonData.source.queryName = source.queryName;
    }
    else if (source.type === 'sql') {
        jsonData.source.sql = source.sql;
    }
    if (config.transforms) {
        if (!isArray(config.transforms)) {
            throw new Error('transforms must be an array.');
        }
        jsonData.transforms = config.transforms;
        for (var i = 0; i < jsonData.transforms.length; i++) {
            validateTransform(jsonData.transforms[i]);
        }
    }
    if (config.pivot) {
        validatePivot(config.pivot);
    }
    if (config.columns) {
        if (!isArray(config.columns)) {
            throw new Error('columns must be an array of FieldKeys.');
        }
        for (var i = 0; i < config.columns.length; i++) {
            config.columns[i] = validateFieldKey(config.columns[i]);
            if (!config.columns[i]) {
                throw new Error('columns must be an array of FieldKeys.');
            }
        }
        jsonData.renderer.columns = config.columns;
    }
    if (config.hasOwnProperty('offset')) {
        jsonData.renderer.offset = config.offset;
    }
    if (config.hasOwnProperty('includeDetailsColumn')) {
        jsonData.renderer.includeDetailsColumn = config.includeDetailsColumn;
    }
    if (config.hasOwnProperty('maxRows')) {
        jsonData.renderer.maxRows = config.maxRows;
    }
    if (config.sort) {
        if (!isArray(config.sort)) {
            throw new Error('sort must be an array.');
        }
        for (var i = 0; i < config.sort.length; i++) {
            if (!config.sort[i].fieldKey) {
                throw new Error("Each sort must specify a field key.");
            }
            config.sort[i].fieldKey = validateFieldKey(config.sort[i].fieldKey);
            if (!config.sort[i].fieldKey) {
                throw new Error("Invalid field key specified for sort.");
            }
            if (config.sort[i].dir) {
                config.sort[i].dir = config.sort[i].dir.toUpperCase();
            }
        }
        jsonData.renderer.sort = config.sort;
    }
    return jsonData;
}
function validateFieldKey(key) {
    if (key instanceof FieldKey) {
        return key.getParts();
    }
    if (key instanceof Array) {
        return key;
    }
    if (isString(key)) {
        return FieldKey.fromString(key).getParts();
    }
    return undefined;
}
function validateFilter(filter) {
    if (filter && isFunction(filter.getColumnName)) {
        return {
            fieldKey: FieldKey.fromString(filter.getColumnName()).getParts(),
            type: filter.getFilterType().getURLSuffix(),
            value: filter.getValue()
        };
    }
    if (filter.fieldKey) {
        filter.fieldKey = validateFieldKey(filter.fieldKey);
    }
    else {
        throw new Error('All filters must have a "fieldKey" attribute.');
    }
    if (!filter.fieldKey) {
        throw new Error("Filter fieldKeys must be valid FieldKeys");
    }
    if (!filter.type) {
        throw new Error('All filters must have a "type" attribute.');
    }
    return filter;
}
function validatePivot(pivot) {
    if (!pivot.columns || pivot.columns == null) {
        throw new Error('pivot.columns is required.');
    }
    if (!isArray(pivot.columns)) {
        throw new Error('pivot.columns must be an array of fieldKeys.');
    }
    for (var i = 0; i < pivot.columns.length; i++) {
        pivot.columns[i] = validateFieldKey(pivot.columns[i]);
        if (!pivot.columns[i]) {
            throw new Error('pivot.columns must be an array of fieldKeys.');
        }
    }
    if (!pivot.by || pivot.by == null) {
        throw new Error('pivot.by is required');
    }
    pivot.by = validateFieldKey(pivot.by);
    if (!pivot.by === false) {
        throw new Error('pivot.by must be a fieldKey.');
    }
}
function validateSchemaKey(key) {
    if (key instanceof SchemaKey) {
        return key.getParts();
    }
    if (key instanceof Array) {
        return key;
    }
    if (isString(key)) {
        return SchemaKey.fromString(key).getParts();
    }
    return undefined;
}
function validateSource(source) {
    if (!source || source == null) {
        throw new Error('A source is required for a GetData request.');
    }
    if (!source.type) {
        source.type = 'query';
    }
    if (source.type === 'query') {
        if (!source.queryName || source.queryName == null) {
            throw new Error('A queryName is required for getData requests with type = "query"');
        }
    }
    else if (source.type === 'sql') {
        if (!source.sql) {
            throw new Error('sql is required if source.type = "sql"');
        }
    }
    else {
        throw new Error('Unsupported source type.');
    }
    if (!source.schemaName) {
        throw new Error('A schemaName is required.');
    }
    source.schemaName = validateSchemaKey(source.schemaName);
    if (!source.schemaName) {
        throw new Error('schemaName must be a FieldKey');
    }
}
function validateTransform(transform) {
    if (!transform.type || transform.type !== 'aggregate') {
        transform.type = 'aggregate';
    }
    if (transform.groupBy && transform.groupBy != null) {
        if (!isArray(transform.groupBy)) {
            throw new Error('groupBy must be an array.');
        }
    }
    if (transform.aggregates && transform.aggregates != null) {
        if (!isArray(transform.aggregates)) {
            throw new Error('aggregates must be an array.');
        }
        for (var i = 0; i < transform.aggregates.length; i++) {
            if (!transform.aggregates[i].fieldKey) {
                throw new Error('All aggregates must include a fieldKey.');
            }
            transform.aggregates[i].fieldKey = validateFieldKey(transform.aggregates[i].fieldKey);
            if (!transform.aggregates[i].fieldKey) {
                throw new Error('Aggregate fieldKeys must be valid fieldKeys');
            }
            if (!transform.aggregates[i].type) {
                throw new Error('All aggregates must include a type.');
            }
        }
    }
    if (transform.filters && transform.filters != null) {
        if (!isArray(transform.filters)) {
            throw new Error('The filters of a transform must be an array.');
        }
        for (var i = 0; i < transform.filters.length; i++) {
            transform.filters[i] = validateFilter(transform.filters[i]);
        }
    }
}

var GetData = /*#__PURE__*/Object.freeze({
    getRawData: getRawData
});

function buildParams$1(options) {
    var params = {};
    if (options.schemaName) {
        params.schemaName = options.schemaName;
    }
    if (options.queryName) {
        params.queryName = options.queryName;
    }
    if (options.viewName != undefined) {
        params.viewName = options.viewName;
    }
    if (options.fields) {
        params.fields = options.fields;
    }
    if (options.fk) {
        params.fk = options.fk;
    }
    if (options.initializeMissingView) {
        params.initializeMissingView = options.initializeMissingView;
    }
    return params;
}
function getQueryDetails(options) {
    return request({
        url: buildURL('query', 'getQueryDetails.api', options.containerPath),
        method: 'GET',
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        params: buildParams$1(options)
    });
}

function deleteRows(options) {
    if (arguments.length > 1)
        options = queryArguments(arguments);
    options.action = 'deleteRows.api';
    return sendRequest(options);
}
function insertRows(options) {
    if (arguments.length > 1)
        options = queryArguments(arguments);
    options.action = 'insertRows.api';
    return sendRequest(options);
}
function queryArguments(args) {
    return {
        schemaName: args[0],
        queryName: args[1],
        rows: args[2],
        success: args[3],
        failure: args[4]
    };
}
function saveRows(options) {
    if (arguments.length > 1) {
        options = queryArguments(arguments);
    }
    return request({
        url: buildURL('query', 'saveRows.api', options.containerPath),
        method: 'POST',
        jsonData: {
            apiVersion: options.apiVersion,
            commands: options.commands,
            containerPath: options.containerPath,
            extraContext: options.extraContext,
            transacted: options.transacted === true,
            validateOnly: options.validateOnly === true
        },
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        timeout: options.timeout
    });
}
function buildSelectDistinctParams(options) {
    var params = buildQueryParams(options.schemaName, options.queryName, options.filterArray, options.sort, options.dataRegionName);
    var dataRegionName = params.dataRegionName;
    params[dataRegionName + '.columns'] = options.column;
    if (options.viewName) {
        params[dataRegionName + '.viewName'] = options.viewName;
    }
    if (options.maxRows && options.maxRows >= 0) {
        params.maxRows = options.maxRows;
    }
    if (options.containerFilter) {
        params.containerFilter = options.containerFilter;
    }
    if (options.parameters) {
        for (var propName in options.parameters) {
            if (options.parameters.hasOwnProperty(propName)) {
                params[dataRegionName + '.param.' + propName] = options.parameters[propName];
            }
        }
    }
    if (options.ignoreFilter) {
        params[dataRegionName + '.ignoreFilter'] = true;
    }
    return params;
}
function selectDistinctRows(options) {
    if (!options.schemaName)
        throw 'You must specify a schemaName!';
    if (!options.queryName)
        throw 'You must specify a queryName!';
    if (!options.column)
        throw 'You must specify a column!';
    return request({
        url: buildURL('query', 'selectDistinct.api', options.containerPath),
        method: getMethod(options.method),
        success: getSuccessCallbackWrapper$1(getOnSuccess(options), false, options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        params: buildSelectDistinctParams(options)
    });
}
function buildParams$2(options) {
    var params = buildQueryParams(options.schemaName, options.queryName, options.filterArray, options.sort, options.dataRegionName);
    var dataRegionName = params.dataRegionName;
    if (!options.showRows || options.showRows === 'paginated') {
        if (options.offset) {
            params[dataRegionName + '.offset'] = options.offset;
        }
        if (options.maxRows != undefined) {
            if (options.maxRows < 0) {
                params[dataRegionName + '.showRows'] = 'all';
            }
            else {
                params[dataRegionName + '.maxRows'] = options.maxRows;
            }
        }
    }
    else if (['all', 'selected', 'unselected', 'none'].indexOf(options.showRows) !== -1) {
        params[dataRegionName + '.showRows'] = options.showRows;
    }
    if (options.viewName)
        params[dataRegionName + '.viewName'] = options.viewName;
    if (options.columns)
        params[dataRegionName + '.columns'] = isArray(options.columns) ? options.columns.join(',') : options.columns;
    if (options.selectionKey)
        params[dataRegionName + '.selectionKey'] = options.selectionKey;
    if (options.ignoreFilter)
        params[dataRegionName + '.ignoreFilter'] = 1;
    if (options.parameters) {
        for (var propName in options.parameters) {
            if (options.parameters.hasOwnProperty(propName)) {
                params[dataRegionName + '.param.' + propName] = options.parameters[propName];
            }
        }
    }
    if (options.requiredVersion)
        params.apiVersion = options.requiredVersion;
    if (options.containerFilter)
        params.containerFilter = options.containerFilter;
    if (options.includeTotalCount)
        params.includeTotalCount = options.includeTotalCount;
    if (options.includeDetailsColumn)
        params.includeDetailsColumn = options.includeDetailsColumn;
    if (options.includeUpdateColumn)
        params.includeUpdateColumn = options.includeUpdateColumn;
    if (options.includeStyle)
        params.includeStyle = options.includeStyle;
    return params;
}
function selectRowArguments(args) {
    return {
        schemaName: args[0],
        queryName: args[1],
        success: args[2],
        failure: args[3],
        filterArray: args[4],
        sort: args[5],
        viewName: args[6]
    };
}
function selectRows(options) {
    if (arguments.length > 1) {
        options = selectRowArguments(arguments);
    }
    if (!options.schemaName) {
        throw 'You must specify a schemaName!';
    }
    if (!options.queryName) {
        throw 'You must specify a queryName!';
    }
    var url;
    var baseURL = getServerContext().baseURL;
    if (baseURL) {
        url = baseURL + buildURL('query', 'getQuery.api', options.containerPath);
    }
    else {
        url = buildURL('query', 'getQuery.api', options.containerPath);
    }
    return request({
        url: url,
        method: getMethod(options.method),
        success: getSuccessCallbackWrapper$1(getOnSuccess(options), options.stripHiddenColumns, options.scope, options.requiredVersion),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        params: buildParams$2(options),
        timeout: options.timeout
    });
}
function sendRequest(options) {
    return request({
        url: buildURL('query', options.action, options.containerPath),
        method: 'POST',
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        jsonData: {
            schemaName: options.schemaName,
            queryName: options.queryName,
            rows: options.rows || options.rowDataArray,
            transacted: options.transacted,
            extraContext: options.extraContext
        },
        timeout: options.timeout
    });
}
function updateRows(options) {
    if (arguments.length > 1) {
        options = queryArguments(arguments);
    }
    options.action = 'updateRows.api';
    return sendRequest(options);
}

var CONTROL_CHARS = {
    nul: '\x00',
    bs: '\x08',
    rs: '\x1E',
    us: '\x1F'
};
var CONVERTERS = {
    BIGINT: parseInt,
    BOOLEAN: parseInt,
    DOUBLE: parseFloat,
    INTEGER: parseInt,
    NUMERIC: parseFloat,
    REAL: parseFloat,
    SMALLINT: parseInt,
    TIMESTAMP: convertDate,
    TINYINT: parseInt
};
function asObjects(fields, rows) {
    var p = {};
    for (var f = 0; f < fields.length; f++) {
        p[fields[f]] = null;
    }
    var result = [];
    for (var r = 0; r < rows.length; r++) {
        var arr = rows[r];
        var obj = Object.assign({}, p);
        var l = Math.min(fields.length, arr.length);
        for (var c = 0; c < l; c++) {
            obj[fields[c]] = arr[c];
        }
        result.push(obj);
    }
    return result;
}
function convertDate(s) {
    if (!s) {
        return null;
    }
    var number;
    if (0 < s.indexOf('-')) {
        number = Date.parse(s);
    }
    else {
        number = parseFloat(s);
    }
    return new Date(!isNaN(number) && isFinite(number) ? number : s);
}
function execute(options) {
    if (!options.schema) {
        throw 'You must specify a schema!';
    }
    if (!options.sql) {
        throw 'You must specify sql statement!';
    }
    var eol = options.eol || (CONTROL_CHARS.us + '\n');
    var sep = options.sep || (CONTROL_CHARS.us + '\t');
    var jsonData = {
        compact: 1,
        eol: eol,
        parameters: options.parameters,
        schema: options.schema,
        sep: sep,
        sql: options.sql
    };
    return request({
        url: buildURL('sql', 'execute', options.containerPath),
        method: 'POST',
        jsonData: jsonData,
        success: function (response) {
            var result = parseRows(response.responseText, sep, eol);
            getOnSuccess(options)(result);
        },
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        timeout: options.timeout
    });
}
function identity(x) {
    return x;
}
function parseRows(text, sep, eol) {
    var rows = text.split(eol);
    if ('' === trimRight(rows[rows.length - 1])) {
        rows.pop();
    }
    var x = 0;
    var meta = rows[x++].split(sep);
    var names = rows[x++].split(sep);
    var colConverters = [];
    var types = rows[x++].split(sep);
    for (var i = 0; i < types.length; i++) {
        colConverters.push(CONVERTERS[types[i]] || identity);
    }
    rows = rows.slice(meta.length);
    for (var r = 0; r < rows.length; r++) {
        var row = rows[r].split(sep);
        for (var c = 0; c < row.length; c++) {
            var s = row[c];
            if ('' === s) {
                row[c] = null;
            }
            else if (CONTROL_CHARS.bs === s && r > 0) {
                row[c] = rows[r - 1][c];
            }
            else {
                row[c] = colConverters[c](s);
            }
        }
        rows[r] = row;
    }
    rows.pop();
    rows.pop();
    return {
        names: names,
        rows: rows,
        types: types
    };
}
function trimRight(s) {
    return s.replace(/[\s\uFEFF\xA0]+$/g, '');
}

var SQL = /*#__PURE__*/Object.freeze({
    asObjects: asObjects,
    execute: execute
});

var Aggregate = {
    AVG: 'AVG',
    COUNT: 'COUNT',
    MAX: 'MAX',
    MIN: 'MIN',
    SUM: 'SUM'
};
var Interval = {
    DAY: 'DAY',
    MONTH: 'MONTH',
    WEEK: 'WEEK',
    YEAR: 'YEAR'
};
var Type = {
    GenericChart: 'ReportService.GenericChartReport',
    TimeChart: 'ReportService.TimeChartReport'
};

function getSuccessCallbackWrapper$2(processor, onSuccess, scope) {
    var _this = this;
    return getCallbackWrapper(function (json, response) {
        if (onSuccess) {
            onSuccess.call(scope || _this, processor(json) || null, response);
        }
    });
}

function createValues(json) {
    if (json && json.success && json.values) {
        return json.values;
    }
    return [];
}
var Dimension = (function () {
    function Dimension(config) {
        if (config && config.hasOwnProperty('isUserDefined')) {
            this._isUserDefined = config['isUserDefined'];
        }
        apply(this, config);
    }
    Dimension.prototype.getDescription = function () {
        return this.description;
    };
    Dimension.prototype.getLabel = function () {
        return this.label;
    };
    Dimension.prototype.getName = function () {
        return this.name;
    };
    Dimension.prototype.getQueryName = function () {
        return this.queryName;
    };
    Dimension.prototype.getSchemaName = function () {
        return this.schemaName;
    };
    Dimension.prototype.getType = function () {
        return this.type;
    };
    Dimension.prototype.getValues = function (options) {
        request({
            url: buildURL('visualization', 'getDimensionValues'),
            method: 'GET',
            params: {
                name: this.name,
                queryName: this.queryName,
                schemaName: this.schemaName
            },
            success: getSuccessCallbackWrapper$2(createValues, getOnSuccess(options), options.scope),
            failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
        });
    };
    Dimension.prototype.isUserDefined = function () {
        return this._isUserDefined;
    };
    return Dimension;
}());

function create$3(options) {
    if (!options.schemaName) {
        throw new Error('You must supply a value for schemaName in your configuration object!');
    }
    var params = [
        options.schemaName,
        options.queryName ? options.queryName : '~'
    ];
    if (options.queryType) {
        params.push(options.queryType);
    }
    return params.join('|');
}
var QueryType = {
    BUILT_IN: 'builtIn',
    CUSTOM: 'custom',
    DATASETS: 'datasets',
    ALL: 'all'
};

var Filter$2 = /*#__PURE__*/Object.freeze({
    create: create$3,
    QueryType: QueryType
});

function createDimensions(json) {
    var dimensions = [];
    if (json.dimensions && json.dimensions.length) {
        for (var i = 0; i < json.dimensions.length; i++) {
            dimensions.push(new Dimension(json.dimensions[i]));
        }
    }
    return dimensions;
}
var Measure = (function () {
    function Measure(config) {
        if (config && config.hasOwnProperty('isUserDefined')) {
            this._isUserDefined = config['isUserDefined'];
        }
        apply(this, config);
    }
    Measure.prototype.getDescription = function () {
        return this.description;
    };
    Measure.prototype.getDimensions = function (options) {
        var params = {
            queryName: this.queryName,
            schemaName: this.schemaName
        };
        if (options.includeDemographics) {
            params.includeDemographics = true;
        }
        request({
            url: buildURL('visualization', 'getDimensions'),
            method: 'GET',
            params: params,
            success: getSuccessCallbackWrapper$2(createDimensions, getOnSuccess(options), options.scope),
            failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
        });
    };
    Measure.prototype.getLabel = function () {
        return this.label;
    };
    Measure.prototype.getName = function () {
        return this.name;
    };
    Measure.prototype.getQueryName = function () {
        return this.queryName;
    };
    Measure.prototype.getSchemaName = function () {
        return this.schemaName;
    };
    Measure.prototype.getType = function () {
        return this.type;
    };
    Measure.prototype.isUserDefined = function () {
        return this._isUserDefined;
    };
    return Measure;
}());

function createMeasures(json) {
    var measures = [];
    if (json.measures && json.measures.length) {
        for (var i = 0; i < json.measures.length; i++) {
            measures.push(new Measure(json.measures[i]));
        }
    }
    return measures;
}
function createTypes(json) {
    if (json && json.types && json.types.length) {
        return json.types;
    }
    return [];
}
function get$1(options) {
    var _this = this;
    var jsonData = {
        name: options.name,
        reportId: options.reportId,
        queryName: options.queryName,
        schemaName: options.schemaName
    };
    var onSuccess = getOnSuccess(options);
    request({
        url: buildURL('visualization', 'getVisualization'),
        method: 'POST',
        initialConfig: options,
        jsonData: jsonData,
        success: getCallbackWrapper(function (json, response, requestOptions) {
            if (json && json.visualizationConfig) {
                json.visualizationConfig = decode(json.visualizationConfig);
            }
            if (onSuccess) {
                onSuccess.call(options.scope || _this, json, response, requestOptions);
            }
        }, options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}
function getData(options) {
    var jsonData = {
        measures: [],
        sorts: options.sorts,
        filterQuery: options.filterQuery,
        filterUrl: options.filterUrl,
        limit: options.limit,
        groupBys: options.groupBys,
        metaDataOnly: options.metaDataOnly === true,
        joinToFirst: options.joinToFirst === true
    };
    var filters, m, f, asURL, fa;
    for (m = 0; m < options.measures.length; m++) {
        var c = options.measures[m];
        var measure = {
            measure: c.measure,
            time: c.time
        };
        if (c.dimension) {
            measure.dimension = c.dimension;
        }
        if (c.dateOptions) {
            measure.dateOptions = c.dateOptions;
        }
        if (c.filterArray) {
            measure.filterArray = c.filterArray;
            filters = [];
            for (f = 0; f < measure.filterArray.length; f++) {
                fa = measure.filterArray[f];
                if (fa && fa.getURLParameterName) {
                    asURL = encodeURIComponent(fa.getURLParameterName()) + "=" + encodeURIComponent(fa.getURLParameterValue());
                    filters.push(asURL);
                }
            }
            measure.filterArray = filters;
        }
        jsonData.measures.push(measure);
    }
    var urlParams = {};
    if (options.parameters) {
        for (var p in options.parameters) {
            if (options.parameters.hasOwnProperty(p)) {
                urlParams['visualization.param.' + p] = options.parameters[p];
            }
        }
    }
    var url;
    if (options.endpoint) {
        url = options.endpoint + '?' + queryString(urlParams);
    }
    else {
        url = buildURL('visualization', 'getData', options.containerPath, urlParams);
    }
    request({
        url: url,
        method: 'POST',
        jsonData: jsonData,
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}
function getDataFilterFromURL() {
    return getParameters().filterUrl;
}
function getFromUrl(options) {
    var params = options || {};
    params.success = getOnSuccess(options);
    params.failure = getOnFailure(options);
    var urlParams = getParameters();
    var valid = false;
    if (params.reportId) {
        valid = true;
    }
    else {
        if (urlParams.name) {
            params.name = urlParams.name;
            params.schemaName = urlParams.schemaName;
            params.queryName = urlParams.queryName;
            valid = true;
        }
    }
    if (valid) {
        get$1(params);
    }
    return valid;
}
function getMeasures(options) {
    var params = {};
    if (options.filters && options.filters.length) {
        params.filters = options.filters;
    }
    if (options.dateMeasures !== undefined) {
        params.dateMeasures = options.dateMeasures;
    }
    if (options.allColumns !== undefined) {
        params.allColumns = options.allColumns;
    }
    if (options.showHidden !== undefined) {
        params.showHidden = options.showHidden;
    }
    request({
        url: buildURL('visualization', 'getMeasures'),
        method: 'GET',
        params: params,
        success: getSuccessCallbackWrapper$2(createMeasures, getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}
function getTypes(options) {
    request({
        url: buildURL('visualization', 'getVisualizationTypes'),
        method: 'GET',
        success: getSuccessCallbackWrapper$2(createTypes, getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}

var Visualization = /*#__PURE__*/Object.freeze({
    Aggregate: Aggregate,
    Dimension: Dimension,
    Filter: Filter$2,
    Interval: Interval,
    Measure: Measure,
    Type: Type,
    get: get$1,
    getData: getData,
    getDataFilterFromURL: getDataFilterFromURL,
    getFromUrl: getFromUrl,
    getMeasures: getMeasures,
    getTypes: getTypes
});

var experimental = {
    SQL: SQL
};

var Query = /*#__PURE__*/Object.freeze({
    containerFilter: containerFilter,
    buildQueryParams: buildQueryParams,
    deleteQueryView: deleteQueryView,
    deleteRows: deleteRows,
    executeSql: executeSql,
    experimental: experimental,
    Filter: Filter,
    GetData: GetData,
    getQueries: getQueries,
    getQueryDetails: getQueryDetails,
    getQueryViews: getQueryViews,
    getSchemas: getSchemas,
    getServerDate: getServerDate,
    insertRows: insertRows,
    saveQueryViews: saveQueryViews,
    saveRows: saveRows,
    selectDistinctRows: selectDistinctRows,
    selectRows: selectRows,
    sqlDateLiteral: sqlDateLiteral,
    sqlDateTimeLiteral: sqlDateTimeLiteral,
    sqlStringLiteral: sqlStringLiteral,
    updateRows: updateRows,
    URL_COLUMN_PREFIX: URL_COLUMN_PREFIX,
    validateQuery: validateQuery,
    Visualization: Visualization
});

function createSession(options) {
    request({
        url: buildURL('reports', 'createSession', options.containerPath),
        method: 'POST',
        jsonData: {
            clientContext: options.clientContext
        },
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}
function deleteSession(options) {
    request({
        url: buildURL('reports', 'deleteSession', options.containerPath),
        method: 'POST',
        params: {
            reportSessionId: options.reportSessionId
        },
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}
function requestExecute(options, isReport) {
    return request({
        url: buildURL('reports', 'execute', options.containerPath),
        method: 'POST',
        jsonData: populateParams(options, isReport),
        success: requestExecuteWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}
function requestExecuteWrapper(callback, scope) {
    var _this = this;
    return getCallbackWrapper(function (data, response, options) {
        if (data && data.outputParams) {
            for (var i = 0; i < data.outputParams.length; i++) {
                var param = data.outputParams[i];
                if (param.type == 'json') {
                    param.value = decode(param.value);
                }
            }
        }
        if (callback) {
            callback.call(scope || _this, data, options, response);
        }
    }, this);
}
function execute$1(options) {
    if (!options) {
        throw 'You must supply a config object to call this method.';
    }
    if (!options.reportId && !options.reportName) {
        throw 'You must supply a value for the reportId or reportName config property.';
    }
    return requestExecute(options, true);
}
function executeFunction(options) {
    if (!options) {
        throw 'You must supply a config object to call this method.';
    }
    if (!options.functionName) {
        throw 'You must supply a value for the functionName config property.';
    }
    return requestExecute(options, false);
}
function getSessions(options) {
    request({
        url: buildURL('reports', 'getSessions', options.containerPath),
        method: 'POST',
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
    });
}
function populateParams(options, isReport) {
    var execParams = {};
    if (isReport) {
        if (options.reportId) {
            execParams.reportId = options.reportId;
        }
        if (options.reportName) {
            execParams.reportName = options.reportName;
        }
        if (options.schemaName) {
            execParams.schemaName = options.schemaName;
        }
        if (options.queryName) {
            execParams.queryName = options.queryName;
        }
    }
    else {
        if (options.functionName) {
            execParams.functionName = options.functionName;
        }
    }
    if (options.reportSessionId) {
        execParams.reportSessionId = options.reportSessionId;
    }
    if (options.inputParams) {
        execParams.inputParams = {};
        for (var i in options.inputParams) {
            if (options.inputParams.hasOwnProperty(i)) {
                execParams.inputParams[i] = options.inputParams[i];
            }
        }
    }
    return execParams;
}

var Report = /*#__PURE__*/Object.freeze({
    createSession: createSession,
    deleteSession: deleteSession,
    execute: execute$1,
    executeFunction: executeFunction,
    getSessions: getSessions
});

var LABKEY$1 = getServerContext();
var currentContainer = LABKEY$1.container;
var currentUser = LABKEY$1.user;
var effectivePermissions = {
    insert: 'org.labkey.api.security.permissions.InsertPermission',
    read: 'org.labkey.api.security.permissions.ReadPermission',
    admin: 'org.labkey.api.security.permissions.AdminPermission',
    del: 'org.labkey.api.security.permissions.DeletePermission',
    readOwn: 'org.labkey.api.security.permissions.ReadSomePermission',
    update: 'org.labkey.api.security.permissions.UpdatePermission'
};
var permissions = {
    read: 1,
    insert: 2,
    update: 4,
    del: 8,
    readOwn: 16,
    updateOwn: 64,
    deleteOwn: 128,
    admin: 32768,
    all: 65535
};
var roles = {
    admin: 65535,
    editor: 15,
    author: 195,
    reader: 1,
    restrictedReader: 16,
    submitter: 2,
    noPerms: 0
};
var systemGroups = {
    administrators: -1,
    users: -2,
    guests: -3,
    developers: -4
};

function createContainer(config) {
    return request({
        url: buildURL('core', 'createContainer.api', config.containerPath),
        method: 'POST',
        jsonData: {
            description: config.description,
            folderType: config.folderType,
            isWorkbook: config.isWorkbook,
            name: config.name,
            title: config.title
        },
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}
function deleteContainer(config) {
    return request({
        url: buildURL('core', 'deleteContainer.api', config.containerPath),
        method: 'POST',
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}
function getContainers(config) {
    var params = {};
    if (config) {
        if (config.container != undefined) {
            if (isArray(config.container)) {
                params.multipleContainers = true;
                params.container = config.container;
            }
            else {
                params.container = [config.container];
            }
        }
        if (config.includeSubfolders != undefined) {
            params.includeSubfolders = config.includeSubfolders === true;
        }
        if (config.depth != undefined) {
            params.depth = config.depth;
        }
        if (config.moduleProperties != undefined) {
            params.moduleProperties = config.moduleProperties;
        }
        if (config.includeEffectivePermissions != undefined) {
            params.includeEffectivePermissions = config.includeEffectivePermissions === true;
        }
    }
    return request({
        url: buildURL('project', 'getContainers.api', config.containerPath),
        params: params,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}
function getFolderTypes(config) {
    return request({
        url: buildURL('core', 'getFolderTypes.api', config.containerPath),
        method: 'POST',
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}
function getHomeContainer() {
    return getServerContext().homeContainer;
}
function getModules(config) {
    return request({
        url: buildURL('admin', 'getModules.api', config.containerPath),
        method: 'POST',
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}
function getSharedContainer() {
    return getServerContext().sharedContainer;
}
function moveContainer(config) {
    var params = {
        addAlias: config.addAlias !== false,
        container: config.container || config.containerPath,
        parent: config.destinationParent || config.parent || config.parentPath
    };
    if (!params.container) {
        throw "'containerPath' must be specified for LABKEY.Security.moveContainer invocation.";
    }
    if (!params.parent) {
        throw "'parent' must be specified for LABKEY.Security.moveContainer invocation.";
    }
    return request({
        url: buildURL('core', 'moveContainer.api', params.container),
        method: 'POST',
        jsonData: params,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}

function getGroupPermissions(config) {
    var params = {};
    if (config.includeSubfolders !== undefined) {
        params.includeSubfolders = config.includeSubfolders === true;
    }
    return request({
        url: buildURL('security', 'getGroupPerms.api', config.containerPath),
        params: params,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}
function getRole(perms) {
    for (var role in roles) {
        if (roles.hasOwnProperty(role)) {
            if (perms === roles[role]) {
                return role;
            }
        }
    }
}
function getRoles(config) {
    return request({
        url: buildURL('security', 'getRoles.api', config.containerPath),
        success: getCallbackWrapper(function (data, req) {
            var i, j, permMap = {}, perm, role;
            for (i = 0; i < data.permissions.length; i++) {
                perm = data.permissions[i];
                permMap[perm.uniqueName] = perm;
            }
            for (i = 0; i < data.roles.length; i++) {
                role = data.roles[i];
                for (j = 0; j < role.permissions.length; ++j) {
                    role.permissions[j] = permMap[role.permissions[j]];
                }
            }
            var success = getOnSuccess(config);
            if (success) {
                success.call(config.scope || this, data.roles, req);
            }
        }, this),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}
function getSchemaPermissions(config) {
    if (!config.schemaName || (config.schemaName && config.schemaName !== 'study')) {
        throw 'Method only works for the study schema';
    }
    var getResourcesConfig = config;
    getResourcesConfig.includeEffectivePermissions = true;
    getResourcesConfig.success = function (json, response) {
        var studyResource = null;
        for (var i = 0; i < json.resources.children.length; i++) {
            var resource = json.resources.children[i];
            if (resource.resourceClass == 'org.labkey.study.model.StudyImpl') {
                studyResource = resource;
                break;
            }
        }
        if (null == studyResource) {
            config.failure.apply(config.scope || this, [{ description: 'No study found in container.' }, response]);
            return;
        }
        var result = {
            queries: {}
        }, dataset;
        for (var i = 0; i < studyResource.children.length; i++) {
            dataset = studyResource.children[i];
            result.queries[dataset.name] = dataset;
            dataset.permissionMap = {};
            for (var j = 0; j < dataset.effectivePermissions.length; j++) {
                dataset.permissionMap[dataset.effectivePermissions[j]] = true;
            }
        }
        config.success.apply(config.scope || this, [{ schemas: { study: result } }, response]);
    };
    return getSecurableResources(getResourcesConfig);
}
function getSecurableResources(config) {
    var params = {};
    if (config.includeSubfolders != undefined) {
        params.includeSubfolders = config.includeSubfolders === true;
    }
    if (config.includeEffectivePermissions != undefined) {
        params.includeEffectivePermissions = config.includeEffectivePermissions === true;
    }
    return request({
        url: buildURL('security', 'getSecurableResources.api', config.containerPath),
        params: params,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}
function getUserPermissions(config) {
    var params = {};
    if (config.userId != undefined) {
        params.userId = config.userId;
    }
    else if (config.userEmail != undefined) {
        params.userEmail = config.userEmail;
    }
    if (config.includeSubfolders != undefined) {
        params.includeSubfolders = config.includeSubfolders === true;
    }
    return request({
        url: buildURL('security', 'getUserPerms.api', config.containerPath),
        params: params,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}
function hasEffectivePermission(effectivePermissions$$1, desiredPermission) {
    for (var i = 0; i < effectivePermissions$$1.length; i++) {
        if (effectivePermissions$$1[i] === desiredPermission) {
            return true;
        }
    }
    return false;
}
function hasPermission(perms, perm) {
    return perms & perm;
}

function createNewUser(config) {
    return request({
        url: buildURL('security', 'createNewUser.api', config.containerPath),
        method: 'POST',
        jsonData: {
            email: config.email,
            sendEmail: config.sendEmail === true
        },
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}
function ensureLogin(config) {
    if (getServerContext().user.isGuest || config.force) {
        if (config.useSiteLoginPage) {
            if (typeof (window) !== undefined) {
                window.location.href = buildURL('login', 'login') + '?returnUrl=' + getLocation();
            }
        }
        else {
            return request({
                url: buildURL('security', 'ensureLogin.api'),
                success: getCallbackWrapper(function (data, req) {
                    if (data.currentUser) {
                        setGlobalUser(data.currentUser);
                    }
                    if (getOnSuccess(config)) {
                        getOnSuccess(config).call(config.scope || this, data, req);
                    }
                }, this),
                failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
            });
        }
    }
    else {
        getOnSuccess(config).call(config.scope);
    }
}
function getUsers(config) {
    var params = {};
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
        params: params,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}

function addGroupMembers(config) {
    return request({
        url: buildURL('security', 'addGroupMember.api', config.containerPath),
        method: 'POST',
        jsonData: {
            groupId: config.groupId,
            principalIds: isArray(config.principalIds) ? config.principalIds : [config.principalIds]
        },
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}
function createGroup(config) {
    return request({
        url: buildURL('security', 'createGroup.api', config.containerPath),
        method: 'POST',
        jsonData: {
            name: config.groupName
        },
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}
function deleteGroup(config) {
    return request({
        url: buildURL('security', 'deleteGroup.api', config.containerPath),
        method: 'POST',
        jsonData: {
            id: config.groupId
        },
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}
function removeGroupMembers(config) {
    return request({
        url: buildURL('security', 'removeGroupMember.api', config.containerPath),
        method: 'POST',
        jsonData: {
            groupId: config.groupId,
            principalIds: isArray(config.principalIds) ? config.principalIds : [config.principalIds]
        },
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}
function renameGroup(config) {
    return request({
        url: buildURL('security', 'renameGroup.api', config.containerPath),
        method: 'POST',
        jsonData: {
            id: config.groupId,
            newName: config.newName
        },
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}

function deletePolicy(config) {
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
function getPolicy(config) {
    return request({
        url: buildURL('security', 'getPolicy.api', config.containerPath),
        jsonData: {
            resourceId: config.resourceId
        },
        success: getCallbackWrapper(function (data, req) {
            data.policy.requestedResourceId = config.resourceId;
            var SecurityPolicy = getServerContext().SecurityPolicy;
            var policy = new SecurityPolicy(data.policy);
            getOnSuccess(config).call(config.scope || this, policy, data.relevantRoles, req);
        }, this),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}
function savePolicy(config) {
    return request({
        url: buildURL('security', 'savePolicy.api', config.containerPath),
        method: 'POST',
        jsonData: config.policy.policy,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true)
    });
}



var Security = /*#__PURE__*/Object.freeze({
    currentContainer: currentContainer,
    currentUser: currentUser,
    effectivePermissions: effectivePermissions,
    permissions: permissions,
    roles: roles,
    systemGroups: systemGroups,
    addGroupMembers: addGroupMembers,
    createContainer: createContainer,
    createGroup: createGroup,
    createNewUser: createNewUser,
    deleteContainer: deleteContainer,
    deleteGroup: deleteGroup,
    deletePolicy: deletePolicy,
    ensureLogin: ensureLogin,
    getContainers: getContainers,
    getFolderTypes: getFolderTypes,
    getGroupPermissions: getGroupPermissions,
    getHomeContainer: getHomeContainer,
    getModules: getModules,
    getPolicy: getPolicy,
    getRole: getRole,
    getRoles: getRoles,
    getSchemaPermissions: getSchemaPermissions,
    getSecurableResources: getSecurableResources,
    getSharedContainer: getSharedContainer,
    getUserPermissions: getUserPermissions,
    getUsers: getUsers,
    hasEffectivePermission: hasEffectivePermission,
    hasPermission: hasPermission,
    moveContainer: moveContainer,
    removeGroupMembers: removeGroupMembers,
    renameGroup: renameGroup,
    savePolicy: savePolicy
});

function addSamplesToRequest(options) {
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
        success: getSuccessCallbackWrapper$3(getOnSuccess(options)),
        failure: getCallbackWrapper(rebindFailure(getOnFailure(options)), this, true)
    });
}
function addVialsToRequest(options) {
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
        success: getSuccessCallbackWrapper$3(options.success),
        failure: getCallbackWrapper(rebindFailure(options.failure), this, true)
    });
}
function cancelRequest(options) {
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
        success: getSuccessCallbackWrapper$3(options.success),
        failure: getCallbackWrapper(rebindFailure(options.failure), this, true)
    });
}
function getOpenRequests(options) {
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
        success: getSuccessCallbackWrapper$3(options.success, 'requests'),
        failure: getCallbackWrapper(rebindFailure(options.failure), this, true)
    });
}
function getProvidingLocations(options) {
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
        success: getSuccessCallbackWrapper$3(options.success, 'locations'),
        failure: getCallbackWrapper(rebindFailure(options.failure), this, true)
    });
}
function getRepositories(options) {
    if (remapArguments(options, arguments)) {
        options = {
            success: arguments[0],
            failure: arguments[1],
            containerPath: arguments[2]
        };
    }
    request({
        url: buildURL('study-samples-api', 'getRespositories', options.containerPath),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        success: getSuccessCallbackWrapper$3(options.success, 'repositories'),
        failure: getCallbackWrapper(options.failure || displayAjaxErrorResponse, this, true)
    });
}
function getRequest(options) {
    if (remapArguments(options, arguments)) {
        options = {
            success: arguments[0],
            requestId: arguments[1],
            failure: arguments[2],
            containerPath: arguments[3]
        };
    }
    request({
        url: buildURL('study-samples-api', 'getRequest', options.containerPath),
        method: 'POST',
        jsonData: {
            requestId: options.requestId
        },
        success: getSuccessCallbackWrapper$3(options.success, 'request'),
        failure: getCallbackWrapper(rebindFailure(options.failure), this, true)
    });
}
function getSpecimenWebPartGroups(options) {
    request({
        url: buildURL('study-samples-api', 'getSpecimenWebPartGroups', options.containerPath),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        success: getSuccessCallbackWrapper$3(options.success),
        failure: getCallbackWrapper(rebindFailure(options.failure), this, true)
    });
}
function getSuccessCallbackWrapper$3(success, root) {
    return getCallbackWrapper(function (data) {
        success(root ? data[root] : data);
    }, this);
}
function getVialsByRowId(options) {
    if (remapArguments(options, arguments)) {
        options = {
            success: arguments[0],
            vialRowIdArray: arguments[1],
            failure: arguments[2],
            containerPath: arguments[3]
        };
    }
    request({
        url: buildURL('study-samples-api', 'getVialsByRowId', options.containerPath),
        method: 'POST',
        jsonData: {
            rowIds: options.vialRowIdArray
        },
        success: getSuccessCallbackWrapper$3(options.success, 'vials'),
        failure: getCallbackWrapper(options.failure || displayAjaxErrorResponse, this, true)
    });
}
function getVialTypeSummary(options) {
    request({
        url: buildURL('study-samples-api', 'getVialTypeSummary', options.containerPath),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        success: getSuccessCallbackWrapper$3(options.success),
        failure: getCallbackWrapper(rebindFailure(options.failure), this, true)
    });
}
var REBIND = function (err, response) {
    return displayAjaxErrorResponse(response, err);
};
function rebindFailure(failure) {
    if (failure) {
        return failure;
    }
    return REBIND;
}
function removeVialsFromRequest(options) {
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
        success: getSuccessCallbackWrapper$3(options.success),
        failure: getCallbackWrapper(rebindFailure(options.failure), this, true)
    });
}
function remapArguments(options, args) {
    return options && (isFunction(options) || args.length > 1);
}

var Specimen = /*#__PURE__*/Object.freeze({
    addSamplesToRequest: addSamplesToRequest,
    addVialsToRequest: addVialsToRequest,
    cancelRequest: cancelRequest,
    getOpenRequests: getOpenRequests,
    getProvidingLocations: getProvidingLocations,
    getRepositories: getRepositories,
    getRequest: getRequest,
    getSpecimenWebPartGroups: getSpecimenWebPartGroups,
    getVialsByRowId: getVialsByRowId,
    getVialTypeSummary: getVialTypeSummary,
    removeVialsFromRequest: removeVialsFromRequest
});



var Visualization$1 = /*#__PURE__*/Object.freeze({
    Aggregate: Aggregate,
    Dimension: Dimension,
    Filter: Filter$2,
    Interval: Interval,
    Measure: Measure,
    Type: Type
});

function importRun(options) {
    if (!window.FormData) {
        throw new Error('modern browser required');
    }
    if (!options.assayId) {
        throw new Error('assayId required');
    }
    var files = [];
    if (options.files) {
        for (var i = 0; i < options.files.length; i++) {
            var f = options.files[i];
            if (f instanceof window.File) {
                files.push(f);
            }
            else if (f.tagName == 'INPUT') {
                for (var j = 0; j < f.files.length; j++) {
                    files.push(f.files[j]);
                }
            }
        }
    }
    if (files.length === 0 && !options.runFilePath && !options.dataRows) {
        throw new Error('At least one of "file", "runFilePath", or "dataRows" is required');
    }
    if ((files.length > 0 ? 1 : 0) + (options.runFilePath ? 1 : 0) + (options.dataRows ? 1 : 0) > 1) {
        throw new Error('Only one of "file", "runFilePath", or "dataRows" is allowed');
    }
    var formData = new FormData();
    formData.append('assayId', options.assayId);
    if (options.name) {
        formData.append('name', options.name);
    }
    if (options.comment) {
        formData.append('comment', options.comment);
    }
    if (options.batchId) {
        formData.append('batchId', options.batchId);
    }
    if (options.properties) {
        for (var key in options.properties) {
            if (options.properties.hasOwnProperty(key)) {
                if (isObject(options.properties[key])) {
                    formData.append("properties['" + key + "']", JSON.stringify(options.properties[key]));
                }
                else {
                    formData.append("properties['" + key + "']", options.properties[key]);
                }
            }
        }
    }
    if (options.batchProperties) {
        for (var key in options.batchProperties) {
            if (options.batchProperties.hasOwnProperty(key)) {
                if (isObject(options.batchProperties[key])) {
                    formData.append("batchProperties['" + key + "']", JSON.stringify(options.batchProperties[key]));
                }
                else {
                    formData.append("batchProperties['" + key + "']", options.batchProperties[key]);
                }
            }
        }
    }
    if (options.dataRows) {
        formData.append('dataRows', JSON.stringify(options.dataRows));
    }
    if (options.runFilePath) {
        formData.append('runFilePath', options.runFilePath);
    }
    if (files && files.length > 0) {
        formData.append('file', files[0]);
        for (var i = 0; i < files.length; i++) {
            formData.append('file' + i, files[i]);
        }
    }
    request({
        url: buildURL('assay', 'importRun.api', options.containerPath),
        method: 'POST',
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        form: formData
    });
}

var Assay$1 = /*#__PURE__*/Object.freeze({
    importRun: importRun
});

if (typeof jQuery !== 'undefined') {
    LABKEY.$ = jQuery;
}
else {
    console.warn('jQuery not available. When using the DOM version of the LabKey API jQuery is expected to be available.');
}
function loadDOMContext() {
    return LABKEY;
}

var _a$1 = loadDOMContext(), $ = _a$1.$, CSRF$1 = _a$1.CSRF;
function submitForm(url, formData) {
    if (!formData) {
        formData = {};
    }
    if (!formData[CSRF_HEADER]) {
        formData[CSRF_HEADER] = CSRF$1;
    }
    var formId = generateUUID();
    var html = [];
    html.push('<f');
    html.push('orm method="POST" id="' + formId + '"action="' + url + '">');
    for (var name_1 in formData) {
        if (formData.hasOwnProperty(name_1)) {
            var value = formData[name_1];
            if (value === undefined) {
                continue;
            }
            html.push('<input type="hidden"' +
                ' name="' + encodeHtml(name_1) + '"' +
                ' value="' + encodeHtml(value) + '" />');
        }
    }
    html.push("</form>");
    $('body').append(html.join(''));
    $('form#' + formId).submit();
}
function alert$2(title, msg) {
    if (typeof Ext4 !== 'undefined') {
        Ext4.Msg.alert(title ? Ext4.htmlEncode(title) : '', msg ? Ext4.htmlEncode(msg) : '');
    }
    else if (typeof Ext !== 'undefined') {
        Ext.Msg.alert(title ? Ext.util.Format.htmlEncode(title) : '', msg ? Ext.util.Format.htmlEncode(msg) : '');
    }
    else if (typeof window !== 'undefined') {
        window.alert(encodeHtml(title + ' : ' + msg));
    }
}
function displayAjaxErrorResponse$1(response, exceptionObj, showExceptionClass, msgPrefix) {
    if (response.status === 0) {
        return;
    }
    alert$2('Error', getMsgFromError$1(response, exceptionObj, {
        msgPrefix: msgPrefix,
        showExceptionClass: showExceptionClass
    }));
}
function getMsgFromError$1(response, exceptionObj, config) {
    config = config || {};
    var error;
    var prefix = config.msgPrefix || 'An error occurred trying to load:\n';
    if (response && response.responseText && response.getResponseHeader('Content-Type')) {
        var contentType = response.getResponseHeader('Content-Type');
        if (contentType.indexOf('application/json') >= 0) {
            var json = decode(response.responseText);
            if (json && json.exception) {
                error = prefix + json.exception;
                if (config.showExceptionClass) {
                    error += '\n(' + (json.exceptionClass ? json.exceptionClass : 'Exception class unknown') + ')';
                }
            }
        }
        else if (contentType.indexOf('text/html') >= 0 && $) {
            var html = $(response.responseText);
            var el = html.find('.exception-message');
            if (el && el.length === 1) {
                error = prefix + el.text().trim();
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
function postToAction(href, formData) {
    submitForm(href, formData);
}
function confirmAndPost(message, href, formData) {
    if (confirm(message)) {
        submitForm(href, formData);
        return true;
    }
    return false;
}
function setWebpartTitle(title, webPartId) {
    $('table#webpart_' + webPartId + ' span[class=labkey-wp-title-text]').html(encodeHtml(title));
}
function signalWebDriverTest(signalName, signalResult) {
    var signalContainerId = 'testSignals';
    var signalContainerSelector = '#' + signalContainerId;
    var signalContainer = $(signalContainerSelector);
    var formHTML = '<div id="' + signalContainerId + '"/>';
    if (!signalContainer.length) {
        $('body').append(formHTML);
        signalContainer = $(signalContainerSelector);
        signalContainer.hide();
    }
    signalContainer.find('div[name="' + signalName + '"]').remove();
    signalContainer.append('<div name="' + signalName + '" id="' + id() + '"/>');
    if (signalResult) {
        signalContainer.find('div[name="' + signalName + '"]').attr('value', signalResult);
    }
}

var Utils$1 = /*#__PURE__*/Object.freeze({
    alert: alert$2,
    displayAjaxErrorResponse: displayAjaxErrorResponse$1,
    getMsgFromError: getMsgFromError$1,
    postToAction: postToAction,
    confirmAndPost: confirmAndPost,
    setWebpartTitle: setWebpartTitle,
    signalWebDriverTest: signalWebDriverTest
});

function exportSql(options) {
    postToAction(buildURL('query', 'exportSql', options.containerPath), {
        containerFilter: options.containerFilter,
        format: options.format,
        schemaName: options.schemaName,
        sql: options.sql
    });
}
function exportTables(options) {
    var formData = {};
    if (options.headerType) {
        formData.headerType = options.headerType;
    }
    var schemas = merge({}, options.schemas);
    for (var schemaName in schemas) {
        if (!schemas.hasOwnProperty(schemaName)) {
            continue;
        }
        var queryList = schemas[schemaName];
        for (var i = 0; i < queryList.length; i++) {
            var querySettings = queryList[i];
            var o = merge({}, querySettings);
            delete o.filter;
            delete o.filterArray;
            delete o.sort;
            o.filters = appendFilterParams(null, querySettings.filters || querySettings.filterArray);
            if (querySettings.sort) {
                o.filters['query.sort'] = querySettings.sort;
            }
            queryList[i] = o;
        }
    }
    formData.schemas = JSON.stringify(schemas);
    postToAction(buildURL('query', 'exportTables.view'), formData);
}
function importData(options) {
    if (!window.FormData) {
        throw new Error('modern browser required');
    }
    var form = new FormData();
    form.append('schemaName', options.schemaName);
    form.append('queryName', options.queryName);
    if (options.text) {
        form.append('text', options.text);
    }
    if (options.path) {
        form.append('path', options.path);
    }
    if (options.format) {
        form.append('format', options.format);
    }
    if (options.module) {
        form.append('module', options.module);
    }
    if (options.moduleResource) {
        form.append('moduleResource', options.moduleResource);
    }
    if (options.importIdentity) {
        form.append('importIdentity', options.importIdentity);
    }
    if (options.importLookupByAlternateKey !== undefined) {
        form.append('importLookupByAlternateKey', options.importLookupByAlternateKey.toString());
    }
    if (options.saveToPipeline !== undefined) {
        form.append('saveToPipeline', options.saveToPipeline.toString());
    }
    if (options.insertOption !== undefined) {
        form.append('insertOption', options.insertOption);
    }
    if (options.file) {
        if (options.file instanceof File) {
            form.append('file', options.file);
        }
        else if (options.file.tagName == 'INPUT' && options.file.files.length > 0) {
            form.append('file', options.file.files[0]);
        }
    }
    return request({
        url: options.importUrl || buildURL('query', 'import.api', options.containerPath),
        method: 'POST',
        form: form,
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        timeout: options.timeout
    });
}

var Query$1 = /*#__PURE__*/Object.freeze({
    exportSql: exportSql,
    exportTables: exportTables,
    importData: importData
});

exports.ActionURL = ActionURL;
exports.Ajax = Ajax;
exports.Assay = Assay;
exports.AssayDOM = Assay$1;
exports.Domain = Domain;
exports.FieldKey = FieldKey;
exports.Filter = Filter$1;
exports.List = List;
exports.Message = Message;
exports.MultiRequest = MultiRequest;
exports.ParticipantGroup = ParticipantGroup;
exports.Pipeline = Pipeline;
exports.Query = Query;
exports.QueryDOM = Query$1;
exports.QueryKey = QueryKey;
exports.Report = Report;
exports.SchemaKey = SchemaKey;
exports.Security = Security;
exports.Specimen = Specimen;
exports.Utils = Utils;
exports.UtilsDOM = Utils$1;
exports.Visualization = Visualization$1;
