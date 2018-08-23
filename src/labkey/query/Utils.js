"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ActionURL_1 = require("../ActionURL");
var Ajax_1 = require("../Ajax");
var Filter_1 = require("../filter/Filter");
var Utils_1 = require("../Utils");
var Response_1 = require("./Response");
exports.containerFilter = {
    current: 'current',
    currentAndFirstChildren: 'currentAndFirstChildren',
    currentAndSubfolders: 'currentAndSubfolders',
    currentPlusProject: 'currentPlusProject',
    currentAndParents: 'currentAndParents',
    currentPlusProjectAndShared: 'currentPlusProjectAndShared',
    allFolders: 'allFolders'
};
exports.URL_COLUMN_PREFIX = '_labkeyurl_';
function buildQueryParams(schemaName, queryName, filterArray, sort, dataRegionName) {
    var _a;
    var regionName = Utils_1.ensureRegionName(dataRegionName);
    var params = (_a = {
            dataRegionName: regionName
        },
        _a[regionName + '.queryName'] = queryName,
        _a.schemaName = schemaName,
        _a);
    if (sort) {
        params[regionName + '.sort'] = sort;
    }
    return Filter_1.appendFilterParams(params, filterArray, regionName);
}
exports.buildQueryParams = buildQueryParams;
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
    return Ajax_1.request({
        url: ActionURL_1.buildURL('query', 'deleteView.api', options.containerPath),
        method: 'POST',
        success: Utils_1.getCallbackWrapper(Utils_1.getOnSuccess(options), options.scope),
        failure: Utils_1.getCallbackWrapper(Utils_1.getOnFailure(options), options.scope, true),
        jsonData: jsonData
    });
}
exports.deleteQueryView = deleteQueryView;
function getDataViews(options) {
    var jsonData = {
        includeData: true,
        includeMetadata: false
    };
    if (options.dataTypes) {
        jsonData.dataTypes = options.dataTypes;
    }
    var onSuccess = Utils_1.getOnSuccess(options);
    var success = Utils_1.getCallbackWrapper(function (data, response, options) {
        if (onSuccess) {
            onSuccess.call(options.scope || this, data.data, options, response);
        }
    }, this);
    return Ajax_1.request({
        url: ActionURL_1.buildURL('reports', 'browseData.api', options.containerPath),
        method: 'POST',
        success: success,
        failure: Utils_1.getCallbackWrapper(Utils_1.getOnFailure(options), options.scope, true),
        jsonData: jsonData
    });
}
exports.getDataViews = getDataViews;
function getMethod(value) {
    if (value && (value.toUpperCase() === 'GET' || value.toUpperCase() === 'POST'))
        return value.toUpperCase();
    return 'GET';
}
exports.getMethod = getMethod;
function getQueries(options) {
    var params = {};
    Utils_1.applyTranslated(params, options, {
        schemaName: 'schemaName',
        includeColumns: 'includeColumns',
        includeUserQueries: 'includeUserQueries',
        includeSystemQueries: 'includeSystemQueries'
    }, false, false);
    return Ajax_1.request({
        url: ActionURL_1.buildURL('query', 'getQueries.api', options.containerPath),
        method: 'GET',
        success: Utils_1.getCallbackWrapper(Utils_1.getOnSuccess(options), options.scope),
        failure: Utils_1.getCallbackWrapper(Utils_1.getOnFailure(options), options.scope, true),
        params: params
    });
}
exports.getQueries = getQueries;
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
    return Ajax_1.request({
        url: ActionURL_1.buildURL('query', 'getQueryViews.api', options.containerPath),
        method: 'GET',
        success: Utils_1.getCallbackWrapper(Utils_1.getOnSuccess(options), options.scope),
        failure: Utils_1.getCallbackWrapper(Utils_1.getOnFailure(options), options.scope, true),
        params: params
    });
}
exports.getQueryViews = getQueryViews;
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
    return Ajax_1.request({
        url: ActionURL_1.buildURL('query', 'getSchemas.api', options.containerPath),
        method: 'GET',
        success: Utils_1.getCallbackWrapper(Utils_1.getOnSuccess(options), options.scope),
        failure: Utils_1.getCallbackWrapper(Utils_1.getOnFailure(options), options.scope, true),
        params: params
    });
}
exports.getSchemas = getSchemas;
function getServerDate(options) {
    return Ajax_1.request({
        url: ActionURL_1.buildURL('query', 'getServerDate.api'),
        success: Utils_1.getCallbackWrapper(function (json) {
            var onSuccess = Utils_1.getOnSuccess(options);
            if (json && json.date && onSuccess) {
                onSuccess(new Date(json.date));
            }
        }, this),
        failure: Utils_1.getCallbackWrapper(Utils_1.getOnFailure(options), options.scope)
    });
}
exports.getServerDate = getServerDate;
function getSuccessCallbackWrapper(fn, stripHiddenCols, scope, requiredVersion) {
    var _this = this;
    if (requiredVersion) {
        var versionString = requiredVersion.toString();
        if (versionString === '13.2' || versionString === '16.2' || versionString === '17.1') {
            return Utils_1.getCallbackWrapper(function (data, response, options) {
                if (data && fn) {
                    fn.call(scope || _this, new Response_1.Response(data), response, options);
                }
            }, this);
        }
    }
    return Utils_1.getCallbackWrapper(function (data, response, options) {
        if (fn) {
            if (data && data.rows && stripHiddenCols) {
                stripHiddenColData(data);
            }
            fn.call(scope || _this, data, options, response);
        }
    }, this);
}
exports.getSuccessCallbackWrapper = getSuccessCallbackWrapper;
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
    return Ajax_1.request({
        url: ActionURL_1.buildURL('query', 'saveQueryViews.api', options.containerPath),
        method: 'POST',
        jsonData: jsonData,
        success: Utils_1.getCallbackWrapper(Utils_1.getOnSuccess(options), options.scope),
        failure: Utils_1.getCallbackWrapper(Utils_1.getOnFailure(options), options.scope, true)
    });
}
exports.saveQueryViews = saveQueryViews;
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
exports.sqlDateLiteral = sqlDateLiteral;
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
exports.sqlDateTimeLiteral = sqlDateTimeLiteral;
function sqlStringLiteral(str) {
    if (str === undefined || str === null || str == '') {
        return 'NULL';
    }
    return "'" + str.toString().replace("'", "''") + "'";
}
exports.sqlStringLiteral = sqlStringLiteral;
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
            delete row[exports.URL_COLUMN_PREFIX + hiddenCols[h]];
        }
    }
}
function validateQuery(options) {
    var action = options.validateQueryMetadata ? 'validateQueryMetadata.api' : 'validateQuery.api';
    var params = {};
    Utils_1.applyTranslated(params, options, {
        successCallback: false,
        errorCallback: false,
        scope: false
    });
    return Ajax_1.request({
        url: ActionURL_1.buildURL('query', action, options.containerPath),
        method: 'GET',
        params: params,
        success: Utils_1.getCallbackWrapper(Utils_1.getOnSuccess(options), options.scope),
        failure: Utils_1.getCallbackWrapper(Utils_1.getOnFailure(options), options.scope, true)
    });
}
exports.validateQuery = validateQuery;
