"use strict";

const sinon = require('sinon');

const Ajax = require('../src/labkey/Ajax');

function mockXHR() {
    let xhr;

    afterEach(() => {
        xhr.restore();
    });

    beforeEach(() => {
        xhr = sinon.useFakeXMLHttpRequest();
    });
}

describe('request', () => {

    mockXHR();

    it('should require configuration', () => {
        expect(() => {
            Ajax.request();
        }).toThrowError('a URL is required to make a request');
        expect(() => {
            Ajax.request({});
        }).toThrowError("a URL is required to make a request");
    });
    it('should make request with only url', () => {
        expect(Ajax.request({ url: '/users' }).url).toEqual('/users');
    });
});

describe('request headers', () => {

    mockXHR();

    const testCSRF = 'TEST_CSRF_TOKEN';
    const contentTypeForm = 'application/x-www-form-urlencoded;charset=utf-8';

    it('should apply DEFAULT_HEADERS', () => {
        const requestHeaders = Ajax.request({ url: '/projects' }).requestHeaders;

        expect(requestHeaders['Content-Type']).toEqual(contentTypeForm);
        expect(requestHeaders['X-Requested-With']).toEqual('XMLHttpRequest');
        expect(requestHeaders['X-LABKEY-CSRF']).toEqual(testCSRF);
    });
    it('should apply custom headers', () => {
        const requestHeaders = Ajax.request({
            url: '/projects',
            headers: {
                foo: 'bar'
            }
        }).requestHeaders;

        expect(requestHeaders['foo']).toEqual('bar');
        expect(requestHeaders['X-LABKEY-CSRF']).toEqual(testCSRF); // it shouldn't lose other headers
    })
});

describe('request method', () => {

    mockXHR();

    it('should default to GET', () => {
        expect(Ajax.request({ url: '/users' }).method).toEqual('GET');
    });
    it('should default to POST with data', () => {
        expect(Ajax.request({
            url: '/users',
            jsonData: {
                userId: 123
            }
        }).method).toEqual('POST');
    });
    it('should accept GET with data', () => {
        expect(Ajax.request({
            url: '/users',
            method: 'GET',
            jsonData: {
                userId: 123
            }
        }).method).toEqual('GET');
    });
    it('should accept any method', () => {
        expect(Ajax.request({ url: '/users', method: 'DELETE' }).method).toEqual('DELETE');
        expect(Ajax.request({ url: '/users', method: 'PUT' }).method).toEqual('PUT');
        expect(Ajax.request({ url: '/users', method: 'BEEP' }).method).toEqual('BEEP');
    });

});