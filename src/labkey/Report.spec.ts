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
import * as Ajax from './Ajax'

import { execute } from './Report'

describe('execute', () => {
    it('should stringify "inputParams" object', () => {
        // Arrange
        const requestSpy = jest.spyOn(Ajax, 'request').mockImplementation();

        // Act
        execute({
            reportId: 'db:123',
            inputParams: {
                x: 1,
                y: 2,
                z: 'foo'
            }
        });

        // Assert
        expect(requestSpy).toHaveBeenCalledWith(expect.objectContaining({
            url: '/reports/execute.api',
            method: 'POST',
            jsonData: {
                reportId: 'db:123',
                'inputParams[x]': 1,
                'inputParams[y]': 2,
                'inputParams[z]': 'foo',
            }
        }));
    });
});