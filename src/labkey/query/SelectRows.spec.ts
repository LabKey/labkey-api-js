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
import * as Ajax from '../Ajax';
import { create } from '../Filter';

import { selectRows } from './SelectRows';

describe('selectRows', () => {

    it('should error without required properties', () => {
        expect(() => {
            (selectRows as any)();
        }).toThrow('You must specify a schemaName!');
        expect(() => {
            (selectRows as any)({ schemaName: '', queryName: '' });
        }).toThrow('You must specify a schemaName!');
        expect(() => {
            (selectRows as any)({ schemaName: 'SSS' });
        }).toThrow('You must specify a queryName!');
    });

    it('should respect defaults', () => {
        // Arrange
        const requestSpy = jest.spyOn(Ajax, 'request').mockImplementation();
        const schemaName = 'SSS';
        const queryName = 'QQQ';

        // Act
        selectRows({
            schemaName,
            queryName,
        });

        // Assert
        expect(requestSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                // default to container-free URL
                url: '/query/getQuery.api',

                // default to 'GET' request
                method: 'GET',

                // default to 'query' dataRegionName
                params: {
                    dataRegionName: 'query',
                    'query.queryName': queryName,
                    schemaName,
                },

                // default to not supplying a timeout value
                timeout: undefined,
            })
        );
    });
});

describe('selectRows -- optional parameters', () => {
    const selectRowsRequest = (props: any) => {
        const requestSpy = jest.spyOn(Ajax, 'request').mockImplementation();
        selectRows({
            schemaName: 'SSS',
            queryName: 'QQQ',
            ...props,
        });
        return requestSpy.mock.calls.pop()[0 /* first parameter */];
    };

    const getDRParameterPath = (param: string, dataRegionName = 'query'): string[] => {
        return ['params', `${dataRegionName}.${param}`];
    };

    test('columns', () => {
        // as string
        expect(selectRowsRequest({ columns: 'x,y,z' })).toHaveProperty(getDRParameterPath('columns'), 'x,y,z');

        // as array
        expect(selectRowsRequest({ columns: ['x', 'y', 'z'] })).toHaveProperty(getDRParameterPath('columns'), 'x,y,z');

        // with dataRegionName
        expect(selectRowsRequest({ columns: 'x,y,z', dataRegionName: 'QWP' })).toHaveProperty(
            getDRParameterPath('columns', 'QWP'),
            'x,y,z'
        );
    });

    test('containerPath', () => {
        const containerPath = '/container';
        expect(selectRowsRequest({ containerPath })).toHaveProperty('url', '/query/container/getQuery.api');
    });

    test('dataRegionName', () => {
        const dataRegionName = 'QWP';
        expect(selectRowsRequest({ dataRegionName })).toHaveProperty('params.dataRegionName', dataRegionName);
    });

    test('filterArray', () => {
        const filterArray = [create('x', 42)];
        expect(selectRowsRequest({ filterArray })).toHaveProperty(getDRParameterPath('x~eq'), 42);

        // with dataRegionName
        expect(selectRowsRequest({ filterArray, dataRegionName: 'QWP' })).toHaveProperty(
            getDRParameterPath('x~eq', 'QWP'),
            42
        );
    });

    test('method', () => {
        // default
        expect(selectRowsRequest({})).toHaveProperty('method', 'GET');

        // allow 'POST'
        expect(selectRowsRequest({ method: 'POST' })).toHaveProperty('method', 'POST');

        // ignore others
        expect(selectRowsRequest({ method: 'DELETE' })).toHaveProperty('method', 'GET');
        expect(selectRowsRequest({ method: 'PUT' })).toHaveProperty('method', 'GET');
    });

    test('parameters', () => {
        const parameters = { x: 4, y: 2 };
        const result = selectRowsRequest({ parameters });

        expect(result).toHaveProperty(getDRParameterPath('param.x'), 4);
        expect(result).toHaveProperty(getDRParameterPath('param.y'), 2);

        // with dataRegionName
        expect(selectRowsRequest({ parameters, dataRegionName: 'QWP' })).toHaveProperty(
            getDRParameterPath('param.x', 'QWP'),
            4
        );
    });

    test('timeout', () => {
        expect(selectRowsRequest({ timeout: 50 })).toHaveProperty('timeout', 50);
    });

    test('viewName', () => {
        const viewName = 'allTheColumns';
        expect(selectRowsRequest({ viewName })).toHaveProperty(getDRParameterPath('viewName'), viewName);

        // with dataRegionName
        expect(selectRowsRequest({ viewName, dataRegionName: 'QWP' })).toHaveProperty(
            getDRParameterPath('viewName', 'QWP'),
            viewName
        );
    });

    // TODO: Add coverage for all parameters
});
