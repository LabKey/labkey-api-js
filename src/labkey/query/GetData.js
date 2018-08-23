"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ActionURL_1 = require("../ActionURL");
var Ajax_1 = require("../Ajax");
var FieldKey_1 = require("../fieldKey/FieldKey");
var SchemaKey_1 = require("../fieldKey/SchemaKey");
var Utils_1 = require("../Utils");
var Response_1 = require("./Response");
function getRawData(config) {
    var _this = this;
    var jsonData = validateGetDataConfig(config);
    jsonData.renderer.type = 'json';
    if (!config.success) {
        throw new Error('A success callback is required');
    }
    return Ajax_1.request({
        url: ActionURL_1.buildURL('query', 'getData', config.source.containerPath),
        method: 'POST',
        jsonData: jsonData,
        success: function (response, options) {
            var json = Utils_1.decode(response.responseText);
            config.success.call(config.scope || _this, new Response_1.Response(json), response, options);
        },
        failure: function (response, options) {
            var json = Utils_1.decode(response.responseText);
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
exports.getRawData = getRawData;
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
        if (!Utils_1.isArray(config.transforms)) {
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
        if (!Utils_1.isArray(config.columns)) {
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
        if (!Utils_1.isArray(config.sort)) {
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
    if (key instanceof FieldKey_1.FieldKey) {
        return key.getParts();
    }
    if (key instanceof Array) {
        return key;
    }
    if (Utils_1.isString(key)) {
        return FieldKey_1.FieldKey.fromString(key).getParts();
    }
    return undefined;
}
function validateFilter(filter) {
    if (filter && Utils_1.isFunction(filter.getColumnName)) {
        return {
            fieldKey: FieldKey_1.FieldKey.fromString(filter.getColumnName()).getParts(),
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
    if (!Utils_1.isArray(pivot.columns)) {
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
    if (key instanceof SchemaKey_1.SchemaKey) {
        return key.getParts();
    }
    if (key instanceof Array) {
        return key;
    }
    if (Utils_1.isString(key)) {
        return SchemaKey_1.SchemaKey.fromString(key).getParts();
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
        if (!Utils_1.isArray(transform.groupBy)) {
            throw new Error('groupBy must be an array.');
        }
    }
    if (transform.aggregates && transform.aggregates != null) {
        if (!Utils_1.isArray(transform.aggregates)) {
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
        if (!Utils_1.isArray(transform.filters)) {
            throw new Error('The filters of a transform must be an array.');
        }
        for (var i = 0; i < transform.filters.length; i++) {
            transform.filters[i] = validateFilter(transform.filters[i]);
        }
    }
}
