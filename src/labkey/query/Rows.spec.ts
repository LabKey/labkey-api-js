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

import { bindFormData, deleteRows, insertRows, updateRows } from './Rows';

describe('deleteRows', () => {
    it('should support original method signature', () => {
        // Original method signature:
        // deleteRows(schemaName, queryName, rows, success, failure)

        // Arrange
        const requestSpy = jest.spyOn(Ajax, 'request').mockImplementation();
        const schemaName = 'SSS';
        const queryName = 'QQQ';
        const rows = [{ rowId: 1 }, { rowId: 2 }];

        // Act
        (deleteRows as any)(schemaName, queryName, rows, undefined, undefined);

        // Assert
        expect(requestSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                method: 'POST',
                jsonData: expect.objectContaining({
                    queryName,
                    rows,
                    schemaName,
                }),
                url: '/query/deleteRows.api',
            })
        );
    });
});

describe('insertRows', () => {
    it('should support original method signature', () => {
        // Original method signature:
        // insertRows(schemaName, queryName, rows, success, failure)

        // Arrange
        const requestSpy = jest.spyOn(Ajax, 'request').mockImplementation();
        const schemaName = 'SSS';
        const queryName = 'QQQ';
        const rows = [{ rowId: 1 }, { rowId: 2 }];

        // Act
        (insertRows as any)(schemaName, queryName, rows, undefined, undefined);

        // Assert
        expect(requestSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                method: 'POST',
                jsonData: expect.objectContaining({
                    queryName,
                    rows,
                    schemaName,
                }),
                url: '/query/insertRows.api',
            })
        );
    });

    it('should support form data', () => {
        // Arrange
        const requestSpy = jest.spyOn(Ajax, 'request').mockImplementation();
        const schemaName = 'SSS';
        const queryName = 'QQQ';
        const rows = [{ rowId: 1 }, { rowId: 2 }];

        const form = new FormData();
        form.append('test1', 'test2');

        // Act
        insertRows({ schemaName, queryName, rows, form });

        // Assert
        expect(requestSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                method: 'POST',
                form: expect.anything(),
                url: '/query/insertRows.api',
            })
        );
        expect(requestSpy).toHaveBeenCalledWith(
            expect.not.objectContaining({
                jsonData: expect.anything(),
            })
        );
    });

    it('should support file data', () => {
        // Arrange
        const requestSpy = jest.spyOn(Ajax, 'request').mockImplementation();
        const schemaName = 'SSS';
        const queryName = 'QQQ';
        const rows = [{ rowId: 1 }, { rowId: 2 }, { rowId: 3, someFile: new File([], '') }];

        // Act
        insertRows({ autoFormFileData: true, schemaName, queryName, rows });

        // Assert
        expect(requestSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                method: 'POST',
                form: expect.anything(),
                url: '/query/insertRows.api',
            })
        );
    });
});

describe('updateRows', () => {
    it('should support original method signature', () => {
        // Original method signature:
        // updateRows(schemaName, queryName, rows, success, failure)

        // Arrange
        const requestSpy = jest.spyOn(Ajax, 'request').mockImplementation();
        const schemaName = 'SSS';
        const queryName = 'QQQ';
        const rows = [{ rowId: 1 }, { rowId: 2 }];

        // Act
        (updateRows as any)(schemaName, queryName, rows, undefined, undefined);

        // Assert
        expect(requestSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                method: 'POST',
                jsonData: expect.objectContaining({
                    queryName,
                    rows,
                    schemaName,
                }),
                url: '/query/updateRows.api',
            })
        );
    });

    it('should support form data', () => {
        // Arrange
        const requestSpy = jest.spyOn(Ajax, 'request').mockImplementation();
        const schemaName = 'SSS';
        const queryName = 'QQQ';
        const rows = [{ rowId: 1 }, { rowId: 2 }];

        const form = new FormData();
        form.append('test1', 'test2');

        // Act
        updateRows({ schemaName, queryName, rows, form });

        // Assert
        expect(requestSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                method: 'POST',
                form: expect.anything(),
                url: '/query/updateRows.api',
            })
        );
        expect(requestSpy).toHaveBeenCalledWith(
            expect.not.objectContaining({
                jsonData: expect.anything(),
            })
        );
    });
});

describe('bindFormData', () => {
    const requestOptions = {
        action: 'some.api',
        autoFormFileData: true,
        queryName: 'query',
        schemaName: 'schema',
    };
    it('supports no form', () => {
        expect(bindFormData({}, requestOptions)).toEqual(undefined);
    });
    it('supports user provided form', () => {
        const expectedForm = new FormData();
        expect(bindFormData({}, { ...requestOptions, form: expectedForm })).toEqual(expectedForm);
    });
    it('processes File data', () => {
        // Arrange
        const fileA = new File([], '');
        const fileB = new File([], '');
        const fileC = new File([], '');
        const rows = [
            { firstFile: fileA, rowId: 1 },
            { rowId: 2, firstFile: fileC, secondFile: fileB },
        ];

        // Act
        const form = bindFormData({ rows }, requestOptions, true);

        expect(form).toBeDefined();
        expect(form.get('firstFile::0')).toEqual(fileA);
        expect(form.get('secondFile::1')).toEqual(fileB);
        expect(form.get('firstFile::1')).toEqual(fileC);
    });
});
