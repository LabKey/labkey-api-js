"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var sinon = __importStar(require("sinon"));
var Ajax = __importStar(require("./Ajax"));
function mockXHR() {
    var xhr;
    afterEach(function () {
        xhr.restore();
    });
    beforeEach(function () {
        xhr = sinon.useFakeXMLHttpRequest();
    });
}
describe('request', function () {
    mockXHR();
    it('should require configuration', function () {
        expect(function () {
            Ajax.request();
        }).toThrowError('a URL is required to make a request');
        expect(function () {
            Ajax.request({});
        }).toThrowError("a URL is required to make a request");
    });
    it('should make request with only url', function () {
        expect(Ajax.request({ url: '/users' }).url).toEqual('/users');
    });
});
describe('request headers', function () {
    mockXHR();
    var testCSRF = 'TEST_CSRF_TOKEN';
    var contentTypeForm = 'application/x-www-form-urlencoded;charset=utf-8';
    it('should apply DEFAULT_HEADERS', function () {
        var requestHeaders = Ajax.request({ url: '/projects' }).requestHeaders;
        expect(requestHeaders['Content-Type']).toEqual(contentTypeForm);
        expect(requestHeaders['X-Requested-With']).toEqual('XMLHttpRequest');
        expect(requestHeaders['X-LABKEY-CSRF']).toEqual(testCSRF);
    });
    it('should apply custom headers', function () {
        var requestHeaders = Ajax.request({
            url: '/projects',
            headers: {
                foo: 'bar'
            }
        }).requestHeaders;
        expect(requestHeaders['foo']).toEqual('bar');
        expect(requestHeaders['X-LABKEY-CSRF']).toEqual(testCSRF);
    });
});
describe('request method', function () {
    mockXHR();
    it('should default to GET', function () {
        expect(Ajax.request({ url: '/users' }).method).toEqual('GET');
    });
    it('should default to POST with data', function () {
        expect(Ajax.request({
            url: '/users',
            jsonData: {
                userId: 123
            }
        }).method).toEqual('POST');
    });
    it('should accept GET with data', function () {
        expect(Ajax.request({
            url: '/users',
            method: 'GET',
            jsonData: {
                userId: 123
            }
        }).method).toEqual('GET');
    });
    it('should accept any method', function () {
        expect(Ajax.request({ url: '/users', method: 'DELETE' }).method).toEqual('DELETE');
        expect(Ajax.request({ url: '/users', method: 'PUT' }).method).toEqual('PUT');
        expect(Ajax.request({ url: '/users', method: 'BEEP' }).method).toEqual('BEEP');
    });
});
