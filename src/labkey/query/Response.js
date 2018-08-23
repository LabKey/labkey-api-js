"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Utils_1 = require("../Utils");
var FieldKey_1 = require("../fieldKey/FieldKey");
var SchemaKey_1 = require("../fieldKey/SchemaKey");
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
        this.schemaKey = SchemaKey_1.SchemaKey.fromParts(rawResponse.schemaName);
        var fields = rawResponse.metaData.fields;
        for (var i = 0; i < fields.length; i++) {
            var field = Object.assign({}, fields[i]);
            var lookup = field.lookup;
            field.fieldKey = FieldKey_1.FieldKey.fromParts(field.fieldKey);
            if (lookup && lookup.schemaName) {
                lookup.schemaName = SchemaKey_1.SchemaKey.fromParts(lookup.schemaName);
            }
            if (field.displayField) {
                field.displayField = FieldKey_1.FieldKey.fromParts(field.displayField);
                field.getDisplayField = generateGetDisplayField(field.displayField, fields);
            }
            if (field.extFormatFn) {
                var ext4Index = field.extFormatFn.indexOf('Ext4.'), isExt4Fn = ext4Index === 0 || ext4Index === 1, canEvalExt3 = !isExt4Fn && window && Utils_1.isDefined(window.Ext), canEvalExt4 = isExt4Fn && window && Utils_1.isDefined(window.Ext4);
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
exports.Response = Response;
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
            if (attr.toLowerCase() === columnName && this.hasOwnProperty(attr) && !Utils_1.isFunction(this[attr])) {
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
            if (attr.toLowerCase() === columnName && this.hasOwnProperty(attr) && !Utils_1.isFunction(this[attr])) {
                if (Utils_1.isArray(this[attr])) {
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
exports.Row = Row;
