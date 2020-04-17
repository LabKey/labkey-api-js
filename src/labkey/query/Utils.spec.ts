/*
 * Copyright (c) 2020 LabKey Corporation
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
import { ContainerFilter, containerFilter, getSuccessCallbackWrapper } from './Utils'
import { Response } from './Response'

describe('ContainerFilter', () => {
    it('should be a case-sensitive string-based enum', () => {
        // The "value" of the enumeration is expected to bind to Java classes which is case-sensitive
        expect(ContainerFilter.allFolders).toEqual('AllFolders');
        expect(ContainerFilter.current).toEqual('Current');
        expect(ContainerFilter.currentAndFirstChildren).toEqual('CurrentAndFirstChildren');
        expect(ContainerFilter.currentAndParents).toEqual('CurrentAndParents');
        expect(ContainerFilter.currentAndSubfolders).toEqual('CurrentAndSubfolders');
        expect(ContainerFilter.currentPlusProject).toEqual('CurrentPlusProject');
        expect(ContainerFilter.currentPlusProjectAndShared).toEqual('CurrentPlusProjectAndShared');

        // All "values" of the ContainerFilter enum should be covered here -- if it has changed
        // this test will fail and the test should be updated accordingly.
        expect(Object.keys(ContainerFilter).length).toEqual(7);
    });
    it('should be equivalent to "containerFilter"', () => {
        // Backwards compatibility support
        expect(ContainerFilter).toStrictEqual(containerFilter);
    });
});

describe('getSuccessCallbackWrapper', () => {
    const mockJSONResponse = () => {
        const response = new XMLHttpRequest();
        response.open('GET', 'test');
        response.setRequestHeader('Content-Type', 'application/json');
        (response as any).responseJSON = {
            schemaName: 'SSS',
            queryName: 'QQQ',
            metaData: { fields: [] },
            rows: []
        };
        return response;
    };

    it('should ignore apply scope', () => {
        const me = this;
        const onSuccess = getSuccessCallbackWrapper(function() {
            expect(this === me).toBe(false);
        });

        // An explicit scope is not provided to getSuccessCallbackWrapper so the returned
        // function wrapper should respect scope being applied.
        onSuccess.apply(me, [mockJSONResponse(), { url: 'test'}]);
    });

    it('should respect explicit scope', () => {
        const me = this;
        const other = {};
        const onSuccess = getSuccessCallbackWrapper(function() {
            expect(this).toStrictEqual(other);
        }, false, other);

        // An explicit scope is provided to getSuccessCallbackWrapper so the returned function
        // wrapper should respect the explicit scope over the applied scope.
        onSuccess.apply(me, [mockJSONResponse(), { url: 'test' }]);
    });

    it('should maintain backwards compatibility for requiredVersion', () => {
        [13.2, '13.2', 16.2, 17.1].forEach(version => {
            const onSuccess = getSuccessCallbackWrapper((data: any) => {
                expect(data instanceof Response).toBe(true);
            }, false, undefined, version);

            onSuccess(mockJSONResponse(), { url: 'test' });
        });

        [undefined, null, '8.3', 8.3, 12.1, '16.2', '17.1', 'foo', 17.1111].forEach(version => {
            const onSuccess = getSuccessCallbackWrapper((data: any) => {
                expect(data instanceof Response).toBe(false);
            }, false, undefined, version);

            onSuccess(mockJSONResponse(), { url: 'test' });
        });
    })
});