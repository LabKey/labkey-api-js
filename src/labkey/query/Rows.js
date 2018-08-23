"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Ajax_1 = require("../Ajax");
var ActionURL_1 = require("../ActionURL");
var Utils_1 = require("../Utils");
var Utils_2 = require("./Utils");
function deleteRows(options) {
    if (arguments.length > 1)
        options = queryArguments(arguments);
    options.action = 'deleteRows.api';
    return sendRequest(options);
}
exports.deleteRows = deleteRows;
function insertRows(options) {
    if (arguments.length > 1)
        options = queryArguments(arguments);
    options.action = 'insertRows.api';
    return sendRequest(options);
}
exports.insertRows = insertRows;
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
function buildSelectDistinctParams(options) {
    var params = Utils_2.buildQueryParams(options.schemaName, options.queryName, options.filterArray, options.sort, options.dataRegionName);
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
    return Ajax_1.request({
        url: ActionURL_1.buildURL('query', 'selectDistinct.api', options.containerPath),
        method: Utils_2.getMethod(options.method),
        success: Utils_2.getSuccessCallbackWrapper(Utils_1.getOnSuccess(options), false, options.scope),
        failure: Utils_1.getCallbackWrapper(Utils_1.getOnFailure(options), options.scope, true),
        params: buildSelectDistinctParams(options)
    });
}
exports.selectDistinctRows = selectDistinctRows;
function buildParams(options) {
    var params = Utils_2.buildQueryParams(options.schemaName, options.queryName, options.filterArray, options.sort, options.dataRegionName);
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
        params[dataRegionName + '.columns'] = Utils_1.isArray(options.columns) ? options.columns.join(',') : options.columns;
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
    return Ajax_1.request({
        url: ActionURL_1.buildURL('query', 'getQuery.api', options.containerPath),
        method: Utils_2.getMethod(options.method),
        success: Utils_2.getSuccessCallbackWrapper(Utils_1.getOnSuccess(options), options.stripHiddenColumns, options.scope, options.requiredVersion),
        failure: Utils_1.getCallbackWrapper(Utils_1.getOnFailure(options), options.scope, true),
        params: buildParams(options),
        timeout: options.timeout
    });
}
exports.selectRows = selectRows;
function sendRequest(options) {
    return Ajax_1.request({
        url: ActionURL_1.buildURL('query', options.action, options.containerPath),
        method: 'POST',
        success: Utils_1.getCallbackWrapper(Utils_1.getOnSuccess(options), options.scope),
        failure: Utils_1.getCallbackWrapper(Utils_1.getOnFailure(options), options.scope, true),
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
exports.updateRows = updateRows;
