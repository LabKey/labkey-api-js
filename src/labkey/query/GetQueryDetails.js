"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Ajax_1 = require("../Ajax");
var ActionURL_1 = require("../ActionURL");
var Utils_1 = require("../Utils");
function buildParams(options) {
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
    return Ajax_1.request({
        url: ActionURL_1.buildURL('query', 'getQueryDetails.api', options.containerPath),
        method: 'GET',
        success: Utils_1.getCallbackWrapper(Utils_1.getOnSuccess(options), options.scope),
        failure: Utils_1.getCallbackWrapper(Utils_1.getOnFailure(options), options.scope, true),
        params: buildParams(options)
    });
}
exports.getQueryDetails = getQueryDetails;
