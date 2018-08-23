"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ActionURL_1 = require("../../ActionURL");
var Ajax_1 = require("../../Ajax");
var Utils_1 = require("../../Utils");
var Utils_2 = require("./Utils");
function createValues(json) {
    if (json && json.success && json.values) {
        return json.values;
    }
    return [];
}
var Dimension = (function () {
    function Dimension(config) {
        if (config && config.hasOwnProperty('isUserDefined')) {
            this._isUserDefined = config['isUserDefined'];
        }
        Utils_1.apply(this, config);
    }
    Dimension.prototype.getDescription = function () {
        return this.description;
    };
    Dimension.prototype.getLabel = function () {
        return this.label;
    };
    Dimension.prototype.getName = function () {
        return this.name;
    };
    Dimension.prototype.getQueryName = function () {
        return this.queryName;
    };
    Dimension.prototype.getSchemaName = function () {
        return this.schemaName;
    };
    Dimension.prototype.getType = function () {
        return this.type;
    };
    Dimension.prototype.getValues = function (options) {
        Ajax_1.request({
            url: ActionURL_1.buildURL('visualization', 'getDimensionValues'),
            method: 'GET',
            params: {
                name: this.name,
                queryName: this.queryName,
                schemaName: this.schemaName
            },
            success: Utils_2.getSuccessCallbackWrapper(createValues, Utils_1.getOnSuccess(options), options.scope),
            failure: Utils_1.getCallbackWrapper(Utils_1.getOnFailure(options), options.scope, true)
        });
    };
    Dimension.prototype.isUserDefined = function () {
        return this._isUserDefined;
    };
    return Dimension;
}());
exports.Dimension = Dimension;
