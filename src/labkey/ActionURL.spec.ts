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

describe('ActionURL', () => {

    let CONTAINER_NAME = "DefaultContainer";

    describe('buildURL', () => {

        // NOTE: sinon.stub can work in node.js if change ActionURL.buildURL to invoke this.getContainer() instead of getContainer(), however it breaks when used in the browser
        // it('should default to the current container if one is not provided', () => {
        //     let stub = sinon.stub(ActionURL, "getContainer").returns(CONTAINER_NAME);
        //     let url = ActionURL.buildURL("project", "getWebPart");
        //     expect(url).toEqual("/project/" + CONTAINER_NAME + "/getWebPart.view");
        //     stub.restore();
        // });

        it('should build the correct URL', () => {
            let url = ActionURL.buildURL("project", "getWebPart", "MyContainer");
            expect(url).toEqual("/project/MyContainer/getWebPart.view");
        });

        it('should build the correct URL with optional parameters', () => {
            let params = {listId: 50, returnUrl: "home", array: [10, "li"]};
            let url = ActionURL.buildURL("project", "getWebPart", "MyContainer", params);
            expect(url).toEqual("/project/MyContainer/getWebPart.view?listId=50&returnUrl=home&array=10&array=li");
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
        function validatePath(pathname: string, contextPath: string, containerPath: string, controller: string, action: string): void {
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
            validatePath('/my%20folder/my%20path/pipeline-status-action.view?rowId=123', '', '/my folder/my path', 'pipeline-status', 'action');

            // old style URL
            validatePath('/project/home/begin.view', '', '/home', 'project', 'begin');
            validatePath('/project/home/with/folder/begin.view', '', '/home/with/folder', 'project', 'begin');
            validatePath('/%E2%A8%8Drosty/%E2%98%83/%E2%9D%86/%F0%9D%95%8Anow.view', '', '/☃/❆', '⨍rosty', '𝕊now');
            validatePath('/pipeline-status/my%20folder/my%20path/action.view?rowId=123', '', '/my folder/my path', 'pipeline-status', 'action');
        });

        test('with context path', () => {
            const contextPath = '/myContextPath';
            getServerContext().contextPath = contextPath;

            // new style URL
            validatePath(`${contextPath}/1/project-begin.view`, contextPath, '/1', 'project', 'begin');
            validatePath(`${contextPath}/1/2/3/project-begin.view`, contextPath, '/1/2/3', 'project', 'begin');
            validatePath(`${contextPath}/my%20folder/my%20path/pipeline-status-action.view?rowId=123`, contextPath, '/my folder/my path', 'pipeline-status', 'action');

            // old style URL
            validatePath(`${contextPath}/project/home/begin.view`, contextPath, '/home', 'project', 'begin');
            validatePath(`${contextPath}/project/home/with/folder/begin.view`, contextPath, '/home/with/folder', 'project', 'begin');
            validatePath(`${contextPath}/pipeline-status/my%20folder/my%20path/action.view?rowId=123`, contextPath, '/my folder/my path', 'pipeline-status', 'action');
        });
    });
});