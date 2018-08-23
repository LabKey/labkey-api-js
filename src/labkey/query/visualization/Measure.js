"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ActionURL_1 = require("../../ActionURL");
var Ajax_1 = require("../../Ajax");
var Utils_1 = require("../../Utils");
var Dimension_1 = require("./Dimension");
var Utils_2 = require("./Utils");
function createDimensions(json) {
    var dimensions = [];
    if (json.dimensions && json.dimensions.length) {
        for (var i = 0; i < json.dimensions.length; i++) {
            dimensions.push(new Dimension_1.Dimension(json.dimensions[i]));
        }
    }
    return dimensions;
}
var Measure = (function () {
    function Measure(config) {
        if (config && config.hasOwnProperty('isUserDefined')) {
            this._isUserDefined = config['isUserDefined'];
        }
        Utils_1.apply(this, config);
    }
    Measure.prototype.getDescription = function () {
        return this.description;
    };
    Measure.prototype.getDimensions = function (options) {
        var params = {
            queryName: this.queryName,
            schemaName: this.schemaName
        };
        if (options.includeDemographics) {
            params.includeDemographics = true;
        }
        Ajax_1.request({
            url: ActionURL_1.buildURL('visualization', 'getDimensions'),
            method: 'GET',
            params: params,
            success: Utils_2.getSuccessCallbackWrapper(createDimensions, Utils_1.getOnSuccess(options), options.scope),
            failure: Utils_1.getCallbackWrapper(Utils_1.getOnFailure(options), options.scope, true)
        });
    };
    Measure.prototype.getLabel = function () {
        return this.label;
    };
    Measure.prototype.getName = function () {
        return this.name;
    };
    Measure.prototype.getQueryName = function () {
        return this.queryName;
    };
    Measure.prototype.getSchemaName = function () {
        return this.schemaName;
    };
    Measure.prototype.getType = function () {
        return this.type;
    };
    Measure.prototype.isUserDefined = function () {
        return this._isUserDefined;
    };
    return Measure;
}());
exports.Measure = Measure;
