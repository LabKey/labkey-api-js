"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("./constants");
var Utils_1 = require("./Utils");
function buildParameterMap(paramString) {
    var postParameters = constants_1.getServerContext().postParameters;
    if (!paramString && postParameters) {
        return postParameters;
    }
    if (!paramString) {
        paramString = constants_1.getLocation().search;
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
                if (Utils_1.isArray(curValue)) {
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
        containerPath = exports.getContainer();
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
    var _a = constants_1.getServerContext(), contextPath = _a.contextPath, experimental = _a.experimental;
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
exports.buildURL = buildURL;
function decodePath(encodedPath) {
    return codePath(encodedPath, decodeURIComponent);
}
exports.decodePath = decodePath;
function encodePath(decodedPath) {
    return codePath(decodedPath, encodeURIComponent);
}
exports.encodePath = encodePath;
function getAction() {
    return getPathFromLocation().action;
}
exports.getAction = getAction;
function getBaseURL(noContextPath) {
    var location = constants_1.getLocation();
    return location.protocol + '//' + location.host + (noContextPath ? '' : exports.getContextPath() + '/');
}
exports.getBaseURL = getBaseURL;
function getContainer() {
    var container = constants_1.getServerContext().container;
    if (container && container.path) {
        return container.path;
    }
    return getPathFromLocation().containerPath;
}
exports.getContainer = getContainer;
function getContainerName() {
    var containerPath = exports.getContainer();
    return containerPath.substring(containerPath.lastIndexOf('/') + 1);
}
exports.getContainerName = getContainerName;
function getContextPath() {
    return constants_1.getServerContext().contextPath;
}
exports.getContextPath = getContextPath;
function getController() {
    return getPathFromLocation().controller;
}
exports.getController = getController;
function getParameter(parameterName) {
    var val = buildParameterMap()[parameterName];
    return (val && Utils_1.isArray(val) && val.length > 0) ? val[0] : val;
}
exports.getParameter = getParameter;
function getParameterArray(parameterName) {
    var val = buildParameterMap()[parameterName];
    return (val && !Utils_1.isArray(val)) ? [val] : val;
}
exports.getParameterArray = getParameterArray;
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
exports.getParameters = getParameters;
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
            if (Utils_1.isArray(pval)) {
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
exports.queryString = queryString;
function codePath(path, method) {
    var a = path.split('/');
    for (var i = 0; i < a.length; i++) {
        a[i] = method(a[i]);
    }
    return a.join('/');
}
function getPathFromLocation() {
    var contextPath = constants_1.getServerContext().contextPath;
    var start = contextPath ? contextPath.length : 0;
    var path = constants_1.getLocation().pathname;
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
