import * as sinon from 'sinon';
import * as ActionURL from './ActionURL';

describe('ActionURL', () => {

    var CONTAINER_NAME = "DefaultContainer";

    describe('buildURL', () => {
        it('should default to the current container if one is not provided', () => {
            var stub = sinon.stub(ActionURL, "getContainer").returns(CONTAINER_NAME);
            var url = ActionURL.buildURL("project", "getWebPart");
            expect(url).toEqual("/project/" + CONTAINER_NAME + "/getWebPart.view");
            stub.restore();
        });

        it('should build the correct URL', () => {
            var url = ActionURL.buildURL("project", "getWebPart", "MyContainer");
            expect(url).toEqual("/project/MyContainer/getWebPart.view");
        });

        it('should build the correct URL with optional parameters', () => {
            var params = {listId: 50, returnUrl: "home", array: [10, "li"]};
            var url = ActionURL.buildURL("project", "getWebPart", "MyContainer", params);
            expect(url).toEqual("/project/MyContainer/getWebPart.view?listId=50&returnUrl=home&array=10&array=li");
        });
    });

    describe('getContainerName', () => {
        it('should get the container name', () => {
            var stub = sinon.stub(ActionURL, "getContainer").returns(CONTAINER_NAME);
            var containerName = ActionURL.getContainerName();
            expect(containerName).toEqual(CONTAINER_NAME);
            stub.restore();
        });
    });
});