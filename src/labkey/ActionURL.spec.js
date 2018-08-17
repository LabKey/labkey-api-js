"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var sinon = __importStar(require("sinon"));
var ActionURL = __importStar(require("./ActionURL"));
describe('ActionURL', function () {
    var CONTAINER_NAME = "DefaultContainer";
    describe('buildURL', function () {
        it('should default to the current container if one is not provided', function () {
            var stub = sinon.stub(ActionURL, "getContainer").returns(CONTAINER_NAME);
            var url = ActionURL.buildURL("project", "getWebPart");
            expect(url).toEqual("/project/" + CONTAINER_NAME + "/getWebPart.view");
            stub.restore();
        });
        it('should build the correct URL', function () {
            var url = ActionURL.buildURL("project", "getWebPart", "MyContainer");
            expect(url).toEqual("/project/MyContainer/getWebPart.view");
        });
        it('should build the correct URL with optional parameters', function () {
            var params = { listId: 50, returnUrl: "home", array: [10, "li"] };
            var url = ActionURL.buildURL("project", "getWebPart", "MyContainer", params);
            expect(url).toEqual("/project/MyContainer/getWebPart.view?listId=50&returnUrl=home&array=10&array=li");
        });
    });
    describe('getContainerName', function () {
        it('should get the container name', function () {
            var stub = sinon.stub(ActionURL, "getContainer").returns(CONTAINER_NAME);
            var containerName = ActionURL.getContainerName();
            expect(containerName).toEqual(CONTAINER_NAME);
            stub.restore();
        });
    });
});
