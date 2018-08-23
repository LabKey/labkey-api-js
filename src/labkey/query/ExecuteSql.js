"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Ajax_1 = require("../Ajax");
var ActionURL_1 = require("../ActionURL");
var Utils_1 = require("../Utils");
var Utils_2 = require("./Utils");
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
    return Ajax_1.request({
        url: ActionURL_1.buildURL('query', 'executeSql.api', options.containerPath, buildURLParams(options)),
        method: 'POST',
        success: Utils_2.getSuccessCallbackWrapper(Utils_1.getOnSuccess(options), options.stripHiddenColumns, options.scope, options.requiredVersion),
        failure: Utils_1.getCallbackWrapper(Utils_1.getOnFailure(options), options.scope, true),
        jsonData: buildParams(options),
        timeout: options.timeout
    });
}
exports.executeSql = executeSql;
