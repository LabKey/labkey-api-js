"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSRF_HEADER = 'X-LABKEY-CSRF';
function getLocation() {
    return window.location;
}
exports.getLocation = getLocation;
function getServerContext() {
    return LABKEY;
}
exports.getServerContext = getServerContext;
function setGlobalUser(user) {
    LABKEY.user = user;
    return LABKEY;
}
exports.setGlobalUser = setGlobalUser;
var _Window = (function (_super) {
    __extends(_Window, _super);
    function _Window() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return _Window;
}(Window));
if (!window.LABKEY) {
    throw new Error('LABKEY object is required to be initialized prior to loading the API');
}
