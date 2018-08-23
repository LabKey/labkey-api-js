"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _a;
var constants_1 = require("./constants");
var ActionURL_1 = require("./ActionURL");
var _b = constants_1.getServerContext(), CSRF = _b.CSRF, defaultHeaders = _b.defaultHeaders;
exports.DEFAULT_HEADERS = (_a = {},
    _a[constants_1.CSRF_HEADER] = CSRF,
    _a);
if (defaultHeaders) {
    exports.DEFAULT_HEADERS = defaultHeaders;
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
    for (var k in exports.DEFAULT_HEADERS) {
        if (exports.DEFAULT_HEADERS.hasOwnProperty(k)) {
            xhr.setRequestHeader(k, exports.DEFAULT_HEADERS[k]);
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
        var qs = ActionURL_1.queryString(params);
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
exports.request = request;
