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
import * as sinon from 'sinon';
import * as ActionURL from './ActionURL';

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
});