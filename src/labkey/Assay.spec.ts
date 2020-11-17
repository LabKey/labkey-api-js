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
import * as Ajax from './Ajax';
import { getAll, getAssays, getById, getByName, getByType } from './Assay';

describe('assayList.api requests', () => {
    const success = jest.fn();
    const failure = jest.fn();
    const containerPath = '/my/special/folder';
    let requestSpy: any;

    beforeEach(() => {
        requestSpy = jest.spyOn(Ajax, 'request').mockImplementation();
    });

    afterEach(() => {
        requestSpy.mockRestore();
    });

    test('#getAll', () => {
        // Act
        getAll({ containerPath, failure, success });

        // Assert
        expect(requestSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                url: '/assay/my/special/folder/assayList.api',
            })
        );
    });

    test('#getById', () => {
        // Arrange
        const assayId = 1557;

        // Act
        getById({ success, failure, id: assayId, containerPath });

        // Assert
        expect(requestSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                jsonData: { id: assayId },
                url: '/assay/my/special/folder/assayList.api',
            })
        );
    });

    test('#getByName', () => {
        // Arrange
        const assayName = 'MyAssayName';

        // Act
        getByName({ success, failure, name: assayName, containerPath });

        // Assert
        expect(requestSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                jsonData: { name: assayName },
                url: '/assay/my/special/folder/assayList.api',
            })
        );
    });

    test('#getByType', () => {
        // Arrange
        const assayType = 'EliSpot';

        // Act
        getByType({ success, failure, type: assayType, containerPath });

        // Assert
        expect(requestSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                jsonData: { type: assayType },
                url: '/assay/my/special/folder/assayList.api',
            })
        );
    });

    test('getAssays move parameters', () => {
        // Arrange
        const id = 42;
        const name = 'Jackie';
        const plateEnabled = true;
        const status = 'Archived';
        const type = 'Player';

        // Act
        getAssays({ failure, id, name, plateEnabled, status, success, type });

        // Assert
        expect(requestSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                jsonData: { id, name, plateEnabled, status, type },
                url: '/assay/assayList.api',
            })
        );
    });
});
