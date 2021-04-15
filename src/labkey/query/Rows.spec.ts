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
import * as Ajax from '../Ajax'
import {
    deleteRows,
    insertRows,
    updateRows,
} from './Rows'

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
        expect(requestSpy).toHaveBeenCalledWith(expect.objectContaining({
            method: 'POST',
            jsonData: expect.objectContaining({
                queryName,
                rows,
                schemaName,
            }),
            url: '/query/deleteRows.api',
        }));
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
        expect(requestSpy).toHaveBeenCalledWith(expect.objectContaining({
            method: 'POST',
            jsonData: expect.objectContaining({
                queryName,
                rows,
                schemaName,
            }),
            url: '/query/insertRows.api',
        }));
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
        (insertRows as any)({ schemaName, queryName, rows, form });

        // Assert
        expect(requestSpy).toHaveBeenCalledWith(expect.objectContaining({
            method: 'POST',
            form: expect.anything(),
            jsonData: expect.objectContaining({
                queryName,
                rows,
                schemaName,
            }),
            url: '/query/insertRows.api',
        }));
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
        expect(requestSpy).toHaveBeenCalledWith(expect.objectContaining({
            method: 'POST',
            jsonData: expect.objectContaining({
                queryName,
                rows,
                schemaName,
            }),
            url: '/query/updateRows.api',
        }));
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
        (updateRows as any)({ schemaName, queryName, rows, form });

        // Assert
        expect(requestSpy).toHaveBeenCalledWith(expect.objectContaining({
            method: 'POST',
            form: expect.anything(),
            jsonData: expect.objectContaining({
                queryName,
                rows,
                schemaName,
            }),
            url: '/query/updateRows.api',
        }));
    });
});