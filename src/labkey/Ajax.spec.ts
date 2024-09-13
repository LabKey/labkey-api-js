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

function mockXHR(): void {
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

describe('Ajax', () => {
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
            expect(getFilenameFromContentDisposition('other; filename=data.tsv')).toBeUndefined();
            expect(getFilenameFromContentDisposition('other; filename=attachment.tsv')).toBeUndefined();
        });

        it('should not find a file if there is not a valid filename prefix', () => {
            expect(getFilenameFromContentDisposition('attachment; filename=d ata.xl sx')).toBeUndefined();
            expect(getFilenameFromContentDisposition('attachment; filename*=data.tsv')).toBeUndefined();
            expect(getFilenameFromContentDisposition('attachment; filename*=attachment.tsv')).toBeUndefined();
        });

        it('should find a file with the filename= prefix', () => {
            expect(getFilenameFromContentDisposition('attachment; filename=data.xlsx')).toBe('data.xlsx');
            expect(getFilenameFromContentDisposition('attachment; filename="d ata.xl sx"')).toBe('d ata.xl sx');
            expect(getFilenameFromContentDisposition('attachment;filename="plans.pdf" \t;    \t\t foo=bar')).toBe(
                'plans.pdf'
            );
            expect(getFilenameFromContentDisposition('attachment; filename="£ rates.pdf"')).toBe('£ rates.pdf');
        });

        it('should find a file with the filename*= prefix', () => {
            expect(
                getFilenameFromContentDisposition("attachment; filename=data.xlsx; filename*=UTF-8''datastar.xlsx")
            ).toBe('datastar.xlsx');
            expect(
                getFilenameFromContentDisposition('attachment; filename="d ata.xl sx"; filename*=utf-8\'\'d%20ata.xlsx')
            ).toBe('d ata.xlsx');
            expect(getFilenameFromContentDisposition("attachment; filename*=UTF-8''%E2%82%AC%20rates.pdf")).toBe(
                '€ rates.pdf'
            );
            expect(
                getFilenameFromContentDisposition("attachment; filename*=utf-8''data.xlsx; filename=other.csv")
            ).toBe('data.xlsx');
            expect(
                getFilenameFromContentDisposition("attachment; filename=data.xlsx; filename*=utf-8''other.csv")
            ).toBe('other.csv');
            expect(
                getFilenameFromContentDisposition("attachment; filename*=UTF-8''d%20ata.xlsx; filename=other.csv")
            ).toBe('d ata.xlsx');
            // Issue 50628: verify content-disposition parsing of filenames that include encoded characters
            expect(
                getFilenameFromContentDisposition(
                    'attachment; filename="=?UTF-8?Q?ELN-1005-20240903-5523_London,_England.pdf?="; filename*=UTF-8\'\'ELN-1005-20240903-5523%20London%2C%20England.pdf'
                )
            ).toBe('ELN-1005-20240903-5523 London, England.pdf');
        });
    });
});
