/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import sinon from 'sinon';

import * as Ajax from './Ajax';
import { getFilenameFromContentDisposition } from './Ajax';

function mockXHR() {
    let xhr: sinon.SinonFakeXMLHttpRequestStatic;

    afterEach(() => {
        xhr.restore();
    });

    beforeEach(() => {
        xhr = sinon.useFakeXMLHttpRequest();
    });
}

// These are properties found on XMLHttpRequest that the TypeScript/XMLHttpRequest definition does not declare
interface FakeXMLHttpRequest extends XMLHttpRequest {
    readonly method: string;
    readonly requestHeaders: Record<string, any>;
    readonly url: string;
}

function request(options: Ajax.RequestOptions): FakeXMLHttpRequest {
    return Ajax.request(options) as FakeXMLHttpRequest;
}

describe('request', () => {
    mockXHR();

    it('should require configuration', () => {
        expect(() => {
            (Ajax.request as any)();
        }).toThrow('a URL is required to make a request');
        expect(() => {
            (Ajax.request as any)({});
        }).toThrow('a URL is required to make a request');
    });
    it('should make request with only url', () => {
        expect(request({ url: '/users' }).url).toEqual('/users');
    });
});

describe('request headers', () => {
    mockXHR();

    const testCSRF = 'TEST_CSRF_TOKEN';
    const contentTypeForm = 'application/x-www-form-urlencoded;charset=utf-8';

    it('should apply DEFAULT_HEADERS', () => {
        const requestHeaders = request({ url: '/projects' }).requestHeaders;

        expect(requestHeaders['Content-Type']).toEqual(contentTypeForm);
        expect(requestHeaders['X-Requested-With']).toEqual('XMLHttpRequest');
        expect(requestHeaders['X-LABKEY-CSRF']).toEqual(testCSRF);
    });
    it('should apply custom headers', () => {
        const requestHeaders = request({
            url: '/projects',
            headers: {
                foo: 'bar',
            },
        }).requestHeaders;

        expect(requestHeaders['foo']).toEqual('bar');
        expect(requestHeaders['X-LABKEY-CSRF']).toEqual(testCSRF); // it shouldn't lose other headers
    });
});

describe('request method', () => {
    mockXHR();

    it('should default to GET', () => {
        expect(request({ url: '/users' }).method).toEqual('GET');
    });
    it('should default to POST with data', () => {
        expect(
            request({
                url: '/users',
                jsonData: {
                    userId: 123,
                },
            }).method
        ).toEqual('POST');
    });
    it('should accept GET with data', () => {
        expect(
            request({
                url: '/users',
                method: 'GET',
                jsonData: {
                    userId: 123,
                },
            }).method
        ).toEqual('GET');
    });
    it('should accept any method', () => {
        expect(request({ url: '/users', method: 'DELETE' }).method).toEqual('DELETE');
        expect(request({ url: '/users', method: 'PUT' }).method).toEqual('PUT');
        expect(request({ url: '/users', method: 'BEEP' }).method).toEqual('BEEP');
    });
});

describe('getFilenameFromContentDisposition', () => {
    it('should not find a file if there is no attachment prefix', () => {
        expect(getFilenameFromContentDisposition('other: filename=data.tsv')).toBeUndefined();
        expect(getFilenameFromContentDisposition('other: filename=attachment.tsv')).toBeUndefined();
    });

    it('should find a file with the filename= prefix', () => {
        expect(getFilenameFromContentDisposition('attachment; filename=data.xlsx')).toBe('data.xlsx');
        expect(getFilenameFromContentDisposition('attachment; filename=d%20ata.xlsx')).toBe('d ata.xlsx');
    });

    it('should find a file with the filename*= prefix', () => {
        expect(getFilenameFromContentDisposition('attachment; filename*=data.xlsx')).toBe('data.xlsx');
        expect(getFilenameFromContentDisposition('attachment; filename*=d%20ata.xlsx')).toBe('d ata.xlsx');
        expect(getFilenameFromContentDisposition("attachment; filename*=UTF-8''data.xlsx")).toBe('data.xlsx');
        expect(getFilenameFromContentDisposition("attachment; filename*=UTF-8''d%20ata.xlsx")).toBe('d ata.xlsx');
    });

    it('should use the first filename specified', () => {
        expect(getFilenameFromContentDisposition('attachment; filename*=data.xlsx; filename=other.csv')).toBe(
            'data.xlsx'
        );
        expect(getFilenameFromContentDisposition('attachment; filename=data.xlsx; filename*=other.csv')).toBe(
            'data.xlsx'
        );
        expect(getFilenameFromContentDisposition("attachment; filename*=UTF-8''d%20ata.xlsx; filename=other.csv")).toBe(
            'd ata.xlsx'
        );
    });
});
