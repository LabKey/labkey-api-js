/*
 * Copyright (c) 2016-2018 LabKey Corporation
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
import { getLocation, getServerContext } from './constants'
import { isArray, isFunction } from './Utils'

/**
 * @hidden
 * @private
 */
function buildParameterMap(paramString?: string): {[key:string]: any} {
    const { postParameters } = getServerContext();

    if (!paramString && postParameters) {
        // The caller hasn't requested us to parse a specific URL, and we have POST parameters that were written
        // back into the page by the server
        return postParameters;
    }

    if (!paramString) {
        paramString = getLocation().search;
    }
    if (paramString.charAt(0) == '?') {
        paramString = paramString.substring(1, paramString.length);
    }

    let paramArray = paramString.split('&');
    let parameters: any = {};

    for (let i = 0; i < paramArray.length; i++) {
        let nameValue = paramArray[i].split('=', 2);
        if (nameValue.length == 1 && nameValue[0] != '') {
            // Handle URL parameters with a name but no value or =
            nameValue[1] = '';
        }

        if (nameValue.length == 2) {
            let name = decodeURIComponent(nameValue[0]);
            if (undefined == parameters[name]) {
                parameters[name] = decodeURIComponent(nameValue[1]);
            }
            else {
                let curValue = parameters[name];
                if (isArray(curValue)) {
                    curValue.push(decodeURIComponent(nameValue[1]));
                }
                else {
                    parameters[name] = [curValue, decodeURIComponent(nameValue[1])];
                }
            }
        }
    }

    return parameters;
}

/**
 * Builds a URL from a controller and an action.  Uses the current container and context path.
 * #### Examples
 * 1. Build the URL for the 'getWebPart' action in the 'reports' controller within the current container
 * ```
 * var url = LABKEY.ActionURL.buildURL("project", "getWebPart");
 * ```
 *
 * 2. Build the URL for the 'updateRows' action in the 'query' controller within the container "My Project/My Folder"
 * ```
 * var url = LABKEY.ActionURL.buildURL("query", "updateRows", "My Project/My Folder");
 * ```
 *
 * 3. Navigate the browser to the study controller's begin action in the current container
 * ```
 * window.location = LABKEY.ActionURL.buildURL("study", "begin");
 * ```
 *
 * 4. Navigate the browser to the study controller's begin action in the folder "/myproject/mystudyfolder"
 * ```
 * window.location = LABKEY.ActionURL.buildURL("study", "begin", "/myproject/mystudyfolder");
 * ```
 *
 * 5. Navigate to the list controller's insert action, passing a returnUrl parameter that points back to the current page:
 * ```
 * window.location = LABKEY.ActionURL.buildURL("list", "insert", LABKEY.ActionURL.getContainer(), {listId: 50, returnUrl: window.location});
 * ```
 * @param controller The controller to use in building the URL
 * @param action The action to use in building the URL
 * @param containerPath The container path to use (defaults to the current container)
 * @param parameters An object with properties corresponding to GET parameters to append to the URL.
 * Parameters will be encoded automatically. Parameter values that are arrays will be appended as multiple parameters
 * with the same name. (Defaults to no parameters)
 * @return URL constructed from the current container and context path, plus the specified controller and action.
 */
export function buildURL(controller: string, action: string, containerPath?: string, parameters?: {[key:string]: any }): string {
    if (!containerPath) {
        containerPath = getContainer();
    }
    containerPath = encodePath(containerPath);

    // ensure that the container begins/ends with a "/"
    if (containerPath.charAt(0) != '/') {
        containerPath = '/' + containerPath;
    }
    if (containerPath.charAt(containerPath.length - 1) != '/') {
        containerPath = containerPath + '/';
    }
    if (action.indexOf('.') == -1) {
        action += '.view';
    }
    const query = queryString(parameters);

    let newURL: string;
    const { contextPath, experimental } = getServerContext();
    if (experimental && experimental.containerRelativeURL) {
        newURL = contextPath + containerPath + controller + '-' + action;
    }
    else {
        newURL = contextPath + '/' + controller + containerPath + action;
    }

    if (query) {
        newURL += '?' + query;
    }

    return newURL;
}

/**
 * @hidden
 * @private
 * Decoder for LabKey container paths that accounts for / to only decode the proper names. NOTE: This method is
 * marked as private and could change at any time.
 * @param encodedPath An encoded container path.
 * @returns An URI decoded container path.
 */
export function decodePath(encodedPath: string): string {
    return codePath(encodedPath, decodeURIComponent);
}

/**
 * @hidden
 * @private
 * Encoder for LabKey container paths that accounts for / to only encode the proper names.
 * NOTE: This method is marked as private and could change at any time.
 * @param decodedPath An unencoded container path.
 * @returns An URI encoded container path.
 */
export function encodePath(decodedPath: string): string {
    return codePath(decodedPath, encodeURIComponent);
}

/**
 * Gets the current action
 * @returns Current action.
 */
export function getAction(): string {
    return getPathFromLocation().action;
}

/**
 * Get the current base URL, which includes context path by default
 * for example: http://labkey.org/labkey/
 * @param noContextPath Set true to omit the context path.  Defaults to false.
 * @returns Current base URL.
 */
export function getBaseURL(noContextPath?: boolean): string {
    const location = getLocation();
    return location.protocol + '//' + location.host + (noContextPath ? '' : getContextPath() + '/');
}

/**
 * Gets the current (unencoded) container path.
 * @returns Current container path.
 */
export function getContainer(): string {
    const { container } = getServerContext();
    if (container && container.path) {
        return container.path;
    }
    return getPathFromLocation().containerPath;
}

/**
 * Gets the current container's name. For example, if you are in the
 * /Project/SubFolder/MyFolder container, this method would return 'MyFolder'
 * while getContainer() would return the entire path.
 * @returns Current container name.
 */
export function getContainerName(): string {
    const containerPath = getContainer();
    return containerPath.substring(containerPath.lastIndexOf('/') + 1);
}

/**
 * Gets the current context path. The default context path for LabKey Server is '/labkey'.
 * @returns Current container path.
 */
export function getContextPath(): string {
    return getServerContext().contextPath;
}

/**
 * Get the current controller name.
 * @returns Current controller.
 */
export function getController(): string {
    return getPathFromLocation().controller;
}

/**
 * Gets a URL parameter by name. Note that if the given parameter name is present more than once
 * in the query string, the returned value will be the first occurrence of that parameter name. To get all
 * instances of the parameter, use getParameterArray().
 * @param parameterName The name of the URL parameter.
 * @returns The value of the named parameter, or undefined of the parameter is not present.
 */
export function getParameter(parameterName: string): any {
    const val = buildParameterMap()[parameterName];
    return (val && isArray(val) && val.length > 0) ? val[0] : val;
}

/**
 * Gets a URL parameter by name. This method will always return an array of values, one for
 * each instance of the parameter name in the query string. If the parameter name appears only once
 * this method will return a one-element array.
 * @param parameterName The name of the URL parameter.
 * @returns An Array of parameter values.
 */
export function getParameterArray(parameterName: string): Array<string> {
    const val = buildParameterMap()[parameterName];
    return (val && !isArray(val)) ? [val] : val;
}

/**
 * Returns an object mapping URL parameter names to parameter values. If a given parameter
 * appears more than once on the query string, the value in the map will be an array instead
 * of a single value. Use LABKEY.Utils.isArray() to determine if the value is an array or not, or use
 * getParameter() or getParameterArray() to retrieve a specific parameter name as a single value
 * or array respectively.
 * @param url The URL to parse. If not specified, the browser's current location will be used.
 * @return Object of parameter names to values.
 */
export function getParameters(url?: string): {[key:string]: any} {
    if (!url) {
        return buildParameterMap(url);
    }

    let paramString = url;

    if (url.indexOf('?') != -1) {
        paramString = url.substring(url.indexOf('?') + 1, url.length);
    }

    return buildParameterMap(paramString);
}

/**
 * Turn the parameter object into a query string (e.g. {x:'fred'} -> "x=fred").
 * The returned query string is not prepended by a question mark ('?').
 *
 * @param parameters An object with properties corresponding to GET parameters to append to the URL.
 * Parameters will be encoded automatically. Parameter values that are arrays will be appended as multiple parameters
 * with the same name. (Defaults to no parameters.)
 */
export function queryString(parameters?: {[key:string]: string | Array<string>}): string {
    if (!parameters) {
        return '';
    }

    let query = '', and = '',
        pval: string | Array<string>,
        parameter: string,
        aval: string;

    for (parameter in parameters) {
        if (parameters.hasOwnProperty(parameter)) {
            pval = parameters[parameter];

            if (pval === null || pval === undefined) {
                pval = '';
            }
            else if (isFunction(pval)) {
                continue;
            }

            if (isArray(pval)) {
                for (let idx = 0; idx < pval.length; ++idx) {
                    aval = pval[idx];
                    query += and + encodeURIComponent(parameter) + '=' + encodeURIComponent(pval[idx]);
                    and = '&';
                }
            }
            else {
                query += and + encodeURIComponent(parameter) + '=' + encodeURIComponent(pval as string);
                and = '&';
            }
        }
    }

    return query;
}

/**
 * @hidden
 * @private
 */
interface ActionPath {
    controller: string
    action: string
    containerPath: string
}

/**
 * @hidden
 * @private
 */
function codePath(path: string, method: (v: string) => string): string {
    let a = path.split('/');
    for (let i=0; i < a.length; i++) {
        a[i] = method(a[i]);
    }
    return a.join('/');
}

// Formerly, parsePathName
/**
 * @hidden
 * @private
 */
function getPathFromLocation(): ActionPath {

    const { contextPath } = getServerContext();
    const start = contextPath ? contextPath.length : 0;

    let path = getLocation().pathname;
    const end = path.lastIndexOf('/');

    let action = path.substring(end + 1);
    path = path.substring(start, end);

    let controller: string = null;
    let dash = action.indexOf('-');

    if (0 < dash) {
        controller = action.substring(0, dash);
        action = action.substring(dash + 1);
    }
    else {
        let slash = path.indexOf('/', 1);
        if (slash < 0) // 21945: e.g. '/admin'
            controller = path.substring(1);
        else
            controller = path.substring(1, slash);
        path = path.substring(slash);
    }

    let dot = action.indexOf('.');
    if (0 < dot) {
        action = action.substring(0, dot);
    }

    return {
        controller: decodeURIComponent(controller),
        action: decodeURIComponent(action),
        containerPath: decodeURI(path)
    }
}