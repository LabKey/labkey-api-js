"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Ajax_1 = require("../Ajax");
var ActionURL_1 = require("../ActionURL");
var Utils_1 = require("../Utils");
function mapArguments(args) {
    return {
        success: args[3],
        failure: args[4]
    };
}
function saveRows(options) {
    if (arguments.length > 1) {
        options = mapArguments(arguments);
    }
    return Ajax_1.request({
        url: ActionURL_1.buildURL('query', 'saveRows.api', options.containerPath),
        method: 'POST',
        jsonData: {
            apiVersion: options.apiVersion,
            commands: options.commands,
            containerPath: options.containerPath,
            extraContext: options.extraContext,
            transacted: options.transacted === true,
            validateOnly: options.validateOnly === true
        },
        success: Utils_1.getCallbackWrapper(Utils_1.getOnSuccess(options), options.scope),
        failure: Utils_1.getCallbackWrapper(Utils_1.getOnFailure(options), options.scope, true),
        timeout: options.timeout
    });
}
exports.saveRows = saveRows;
