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
import { MultiRequest } from './MultiRequest';

describe('MultiRequest', () => {
    it('handles array of requests and add', (done) => {
        // Arrange
        const scope = {};
        let sum = 0;
        function asyncMethod(config: any) {
            sum += config.x;
            setTimeout(config.success, config.timeout);
        }

        const requests = [
            [ asyncMethod, { x: 1, timeout: 25 } ],
            [ asyncMethod, { x: 2, timeout: 50 } ],
            [ asyncMethod, { x: 3, timeout: 75 } ],
            [ asyncMethod, { x: 12, timeout: 100 } ],
        ];

        // @ts-ignore
        // Calculate the sum prior to mutating the requests
        const expectedSum = requests.reduce((total, req) => total + req[1].x, 0);

        // Pop the last request for testing add()
        const [lastRequestFn, lastRequestConfig] = requests.pop();

        function onSend() {
            // Assert
            expect(sum).toEqual(expectedSum);
            expect(this).toEqual(scope);
            done();
        }

        // @ts-ignore
        const multi = new MultiRequest(requests);

        // Apply the last request using .add()
        multi.add(lastRequestFn, lastRequestConfig, scope);

        // Act
        multi.send(onSend, scope);
    });
    it('supports listeners config', (done) => {
        // Arrange
        const scope = {};
        let sum = 0;
        function asyncMethod(config: any) {
            sum += config.x;
            setTimeout(config.success, config.timeout);
        }

        const requests = [
            [ asyncMethod, { x: 13, timeout: 25 } ],
            [ asyncMethod, { x: 5, timeout: 50 } ],
            [ asyncMethod, { x: 71, timeout: 75 } ],
        ];

        // @ts-ignore
        const expectedSum = requests.reduce((total, req) => total + req[1].x, 0);

        function onSend() {
            // Assert
            expect(sum).toEqual(expectedSum);
            expect(this).toEqual(scope);
            done();
        }

        // Act
        // @ts-ignore
        new MultiRequest({
            requests,
            listeners: { done: { fn: onSend }, scope }
        });
    });
});