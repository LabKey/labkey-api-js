"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Utils_1 = require("../../Utils");
function getSuccessCallbackWrapper(processor, onSuccess, scope) {
    var _this = this;
    return Utils_1.getCallbackWrapper(function (json, response) {
        if (onSuccess) {
            onSuccess.call(scope || _this, processor(json) || null, response);
        }
    });
}
exports.getSuccessCallbackWrapper = getSuccessCallbackWrapper;
