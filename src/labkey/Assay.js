"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ActionURL_1 = require("./ActionURL");
var Ajax_1 = require("./Ajax");
var Filter_1 = require("./filter/Filter");
var Utils_1 = require("./Utils");
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
exports.getAll = getAll;
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
    Ajax_1.request({
        url: ActionURL_1.buildURL('assay', 'assayList', options.containerPath),
        method: 'POST',
        jsonData: options.parameters,
        success: getSuccessCallbackWrapper(Utils_1.getOnSuccess(options), options.scope),
        failure: Utils_1.getCallbackWrapper(Utils_1.getOnFailure(options), options.scope, true),
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
exports.getById = getById;
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
exports.getByName = getByName;
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
exports.getByType = getByType;
function getNAbRuns(options) {
    var params = Utils_1.merge({}, options);
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
    var success = Utils_1.getOnSuccess(options);
    Ajax_1.request({
        url: ActionURL_1.buildURL('nabassay', 'getNabRuns', options.containerPath),
        method: 'GET',
        params: Filter_1.appendFilterParams(params, options.filterArray),
        success: Utils_1.getCallbackWrapper(function (data) {
            if (success) {
                success.call(options.scope, data.runs);
            }
        }, this),
        failure: Utils_1.getCallbackWrapper(Utils_1.getOnFailure(options), options.scope, true),
        timeout: options.timeout
    });
}
exports.getNAbRuns = getNAbRuns;
function getStudyNabGraphURL(options) {
    var params = {};
    Utils_1.applyTranslated(params, options, { objectIds: 'id' }, true, false);
    Ajax_1.request({
        url: ActionURL_1.buildURL('nabassay', 'getStudyNabGraphURL'),
        method: 'GET',
        params: params,
        success: Utils_1.getCallbackWrapper(Utils_1.getOnSuccess(options), options.scope),
        failure: Utils_1.getCallbackWrapper(Utils_1.getOnFailure(options) || Utils_1.displayAjaxErrorResponse, options.scope, true),
        timeout: options.timeout
    });
}
exports.getStudyNabGraphURL = getStudyNabGraphURL;
function getStudyNabRuns(options) {
    var params = Utils_1.merge({}, options);
    var success = Utils_1.getOnSuccess(options);
    Ajax_1.request({
        url: ActionURL_1.buildURL('nabassay', 'getStudyNabRuns', options.containerPath),
        method: 'GET',
        params: params,
        success: Utils_1.getCallbackWrapper(function (data) {
            if (success) {
                success.call(options.scope, data.runs);
            }
        }, this),
        failure: Utils_1.getCallbackWrapper(Utils_1.getOnFailure(options) || Utils_1.displayAjaxErrorResponse, options.scope, true),
        timeout: options.timeout
    });
}
exports.getStudyNabRuns = getStudyNabRuns;
function getSuccessCallbackWrapper(success, scope) {
    var _this = this;
    return Utils_1.getCallbackWrapper(function (data, response) {
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
