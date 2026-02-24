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
import * as ActionURL from './ActionURL';
import { getServerContext } from './constants';
import { queryString } from './ActionURL';

describe('ActionURL', () => {
    const CONTAINER_NAME = 'DefaultContainer';

    describe('buildURL', () => {
        // NOTE: sinon.stub can work in node.js if change ActionURL.buildURL to invoke this.getContainer() instead of getContainer(), however it breaks when used in the browser
        // it('should default to the current container if one is not provided', () => {
        //     let stub = sinon.stub(ActionURL, "getContainer").returns(CONTAINER_NAME);
        //     let url = ActionURL.buildURL("project", "getWebPart");
        //     expect(url).toEqual("/project/" + CONTAINER_NAME + "/getWebPart.view");
        //     stub.restore();
        // });

        it('should build the correct URL', () => {
            const url = ActionURL.buildURL('project', 'getWebPart', 'MyContainer');
            expect(url).toEqual('/MyContainer/project-getWebPart.view');
        });

        it('should build the correct URL with optional parameters', () => {
            const params = { listId: 50, returnUrl: 'home', array: [10, 'li'] };
            const url = ActionURL.buildURL('project', 'getWebPart', 'MyContainer', params);
            expect(url).toEqual('/MyContainer/project-getWebPart.view?listId=50&returnUrl=home&array=10&array=li');
        });
    });

    describe('getContainerName', () => {
        // NOTE: sinon.stub can work in node.js if change ActionURL.getContainerName to invoke this.getContainer() instead of getContainer(), however it breaks when used in the browser
        // it('should get the container name', () => {
        //     let stub = sinon.stub(ActionURL, "getContainer").returns(CONTAINER_NAME);
        //     let containerName = ActionURL.getContainerName();
        //     expect(containerName).toEqual(CONTAINER_NAME);
        //     stub.restore();
        // });
    });

    describe('getPathFromLocation', () => {
        function validatePath(
            pathname: string,
            contextPath: string,
            containerPath: string,
            controller: string,
            action: string
        ): void {
            const path = ActionURL.getPathFromLocation(pathname);

            expect(path.contextPath).toEqual(contextPath);
            expect(path.containerPath).toEqual(containerPath);
            expect(path.controller).toEqual(controller);
            expect(path.action).toEqual(action);
        }

        afterEach(() => {
            getServerContext().contextPath = '';
        });

        test('without context path', () => {
            // new style URL
            validatePath('/home/project-begin.view', '', '/home', 'project', 'begin');
            validatePath('/home/with/folder/project-begin.view', '', '/home/with/folder', 'project', 'begin');
            validatePath('/%E2%98%83/%E2%9D%86/%E2%A8%8Drosty-%F0%9D%95%8Anow.view', '', '/☃/❆', '⨍rosty', '𝕊now');
            validatePath(
                '/home%2C%2B%2B%3B%40%26%3D%24%23%2Cfolder/project-begin.view',
                '',
                '/home,++;@&=$#,folder',
                'project',
                'begin'
            );
            validatePath(
                '/my%20folder/my%20path/pipeline-status-action.view?rowId=123',
                '',
                '/my folder/my path',
                'pipeline-status',
                'action'
            );

            // old style URL
            validatePath('/project/home/begin.view', '', '/home', 'project', 'begin');
            validatePath('/project/home/with/folder/begin.view', '', '/home/with/folder', 'project', 'begin');
            validatePath('/%E2%A8%8Drosty/%E2%98%83/%E2%9D%86/%F0%9D%95%8Anow.view', '', '/☃/❆', '⨍rosty', '𝕊now');
            validatePath(
                '/pipeline-status/my%20folder/my%20path/action.view?rowId=123',
                '',
                '/my folder/my path',
                'pipeline-status',
                'action'
            );
        });

        test('with context path', () => {
            let contextPath = '/myContextPath';
            getServerContext().contextPath = contextPath;

            // new style URL
            validatePath(`${contextPath}/1/project-begin.view`, contextPath, '/1', 'project', 'begin');
            validatePath(`${contextPath}/1/2/3/project-begin.view`, contextPath, '/1/2/3', 'project', 'begin');
            validatePath(
                `${contextPath}/my%20folder/my%20path/pipeline-status-action.view?rowId=123`,
                contextPath,
                '/my folder/my path',
                'pipeline-status',
                'action'
            );
            contextPath = '/my, CommaContext';
            getServerContext().contextPath = contextPath;
            validatePath(
                `${contextPath}/1%2C%202/pro%2C%20ject-be%2C%20%2Cgin.view`,
                contextPath,
                '/1, 2',
                'pro, ject',
                'be, ,gin'
            );
            validatePath(
                `${contextPath}/1%2C%202%2C%203/project-begin.view`,
                contextPath,
                '/1, 2, 3',
                'project',
                'begin'
            );

            // old style URL
            validatePath(`${contextPath}/project/home/begin.view`, contextPath, '/home', 'project', 'begin');
            validatePath(
                `${contextPath}/project/home/with/folder/begin.view`,
                contextPath,
                '/home/with/folder',
                'project',
                'begin'
            );
            validatePath(
                `${contextPath}/pipeline-status/my%20folder/my%20path/action.view?rowId=123`,
                contextPath,
                '/my folder/my path',
                'pipeline-status',
                'action'
            );
        });
    });

    describe('queryString', () => {
        test('empty object returns empty string', () => {
            expect(queryString()).toEqual('');
            expect(queryString(undefined)).toEqual('');
            expect(queryString({})).toEqual('');
        });

        test('supports null values', () => {
            let expected = 'paramOne=';
            expect(queryString({ paramOne: null })).toEqual(expected);

            expected = 'paramOne=&paramTwo=';
            expect(queryString({ paramOne: null, paramTwo: undefined })).toEqual(expected);
        });

        test('supports strings', () => {
            let expected = 'paramOne=valueOne';
            expect(queryString({ paramOne: 'valueOne' })).toEqual(expected);

            expected = 'paramOne=valueOne&paramTwo=valueTwo';
            expect(queryString({ paramOne: 'valueOne', paramTwo: 'valueTwo' })).toEqual(expected);

            expected = 'encoded%20Param%20One=encoded%20Value%20One&paramTwo=valueTwo';
            expect(queryString({ 'encoded Param One': 'encoded Value One', paramTwo: 'valueTwo' })).toEqual(expected);
        });

        test('supports numbers', () => {
            let expected = 'paramOne=1';
            expect(queryString({ paramOne: 1 })).toEqual(expected);

            expected = 'paramOne=1&paramTwo=2.2';
            expect(queryString({ paramOne: 1, paramTwo: 2.2 })).toEqual(expected);

            expected = 'encoded%20Param%20One=1&paramTwo=2.34';
            expect(queryString({ 'encoded Param One': 1, paramTwo: 2.34 })).toEqual(expected);
        });

        test('supports arrays', () => {
            let expected = 'paramOne=v1&paramOne=v2&paramOne=v3';
            expect(queryString({ paramOne: ['v1', 'v2', 'v3'] })).toEqual(expected);

            expected = 'paramOne=v1&paramOne=v2&paramOne=v3&paramTwo=1&paramTwo=2&paramTwo=3';
            expect(queryString({ paramOne: ['v1', 'v2', 'v3'], paramTwo: [1, 2, 3] })).toEqual(expected);

            expected =
                'encoded%20Param%20One=p%261&encoded%20Param%20One=p%262&encoded%20Param%20One=p%263&paramTwo=one&paramTwo=v%202&paramTwo=2.2&paramTwo=3.3';
            expect(
                queryString({ 'encoded Param One': ['p&1', 'p&2', 'p&3'], paramTwo: ['one', 'v 2', 2.2, 3.3] })
            ).toEqual(expected);
        });

        test('supports boolean', () => {
            let expected = 'paramOne=true';
            expect(queryString({ paramOne: true })).toEqual(expected);

            expected = 'paramOne=true&param%20Two=false';
            expect(queryString({ paramOne: true, 'param Two': false })).toEqual(expected);
        });

        test('supports everything', () => {
            const params: Record<string, any> = {
                strParam: 'My&String Value',
                numParam: 1,
                'array Param': ['value&one', 'value two', 'valueThree', 1, 2.2, 3.34, true],
                nullParam: null,
                undefinedParam: undefined,
                boolParam: false,
            };
            const expected =
                'strParam=My%26String%20Value&numParam=1&array%20Param=value%26one&array%20Param=value%20two&array%20Param=valueThree&array%20Param=1&array%20Param=2.2&array%20Param=3.34&array%20Param=true&nullParam=&undefinedParam=&boolParam=false';
            expect(queryString(params)).toEqual(expected);
        });
    });
});
