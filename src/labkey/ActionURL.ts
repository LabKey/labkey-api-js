import { loadContext } from './constants'
import { isArray } from './Utils'

declare var window: Window;
const LABKEY = loadContext();

const activePath = parsePathName(window.location.pathname);

function buildParameterMap(paramString: string): any {
    throw new Error('ActionURL.buildParameterMap() Not Yet Implemented');
}

export function buildURL(controller: string, action: string, containerPath?: string, parameters?: {[key:string]: string | Array<string>}): string {
    if (containerPath) {
        containerPath = encodePath(containerPath);
    }
    else {
        containerPath = getContainer(); // TODO: Shouldn't we be encoding this as well?
    }

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
    var query = queryString(parameters);

    var newURL: string;
    if (LABKEY.experimental && LABKEY.experimental.containerRelativeURL) {
        newURL = LABKEY.contextPath + containerPath + controller + '-' + action;
    }
    else {
        newURL = LABKEY.contextPath + '/' + controller + containerPath + action;
    }

    if (query) {
        newURL += '?' + query;
    }

    return newURL;
}

/**
 * @private
 * Decoder for LabKey container paths that accounts for / to only decode the proper names. NOTE: This method is
 * marked as private and could change at any time.
 * @param {String} encodedPath An encoded container path.
 * @returns {String} An URI decoded container path.
 */
export function decodePath(encodedPath: string): string {
    return codePath(encodedPath, decodeURIComponent);
}

/**
 * @private
 * Encoder for LabKey container paths that accounts for / to only encode the proper names.
 * NOTE: This method is marked as private and could change at any time.
 * @param {string} decodedPath An unencoded container path.
 * @returns {string} An URI encoded container path.
 */
export function encodePath(decodedPath: string): string {
    return codePath(decodedPath, encodeURIComponent);
}

/**
 * Gets the current action
 * @returns {string} Current action.
 */
export function getAction(): string {
    return activePath.action;
}

/**
 * Get the current base URL, which includes context path by default
 * for example: http://labkey.org/labkey/
 * @param {boolean} [noContextPath] Set true to omit the context path.  Defaults to false.
 * @return {String} Current base URL.
 */
export function getBaseURL(noContextPath: boolean): string {
    return window.location.protocol + '//' + window.location.host + (noContextPath ? '' : getContextPath() + '/');
}

/**
 * Gets the current (unencoded) container path.
 * @returns {string} Current container path.
 */
export function getContainer(): string {
    if (LABKEY.container && LABKEY.container.path) {
        return LABKEY.container.path;
    }
    return activePath.containerPath;
}

/**
 * Gets the current container's name. For example, if you are in the
 * /Project/SubFolder/MyFolder container, this method would return 'MyFolder'
 * while getContainer() would return the entire path.
 * @returns {string} Current container name.
 */
export function getContainerName(): string {
    var containerPath = getContainer();
    var start = containerPath.lastIndexOf('/');
    return containerPath.substring(start + 1);
}

/**
 * Gets the current context path. The default context path for LabKey Server is '/labkey'.
 * @returns {string} Current container path.
 */
export function getContextPath(): string {
    return LABKEY.contextPath;
}

/**
 * Gets a URL parameter by name. This method will always return an array of values, one for
 * each instance of the parameter name in the query string. If the parameter name appears only once
 * this method will return a one-element array.
 * @param {String} parameterName The name of the URL parameter.
 */
export function getParameterArray(parameterName: string): Array<string> {
    throw new Error('ActionURL.getParameterArray() Not Yet Implemented');
}

/**
 * Returns an object mapping URL parameter names to parameter values. If a given parameter
 * appears more than once on the query string, the value in the map will be an array instead
 * of a single value. Use LABKEY.Utils.isArray() to determine if the value is an array or not, or use
 * getParameter() or getParameterArray() to retrieve a specific parameter name as a single value
 * or array respectively.
 * @param {String} [url] The URL to parse. If not specified, the browser's current location will be used.
 * @return {Object} Map of parameter names to values.
 */
export function getParameters(url: string): any {
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
 * @param {Object} [parameters] An object with properties corresponding to GET parameters to append to the URL.
 * Parameters will be encoded automatically. Parameter values that are arrays will be appended as multiple parameters
 * with the same name. (Defaults to no parameters.)
 */
export function queryString(parameters: {[key:string]: string | Array<string>}): string {
    if (!parameters) {
        return '';
    }

    var query = '', and = '',
        pval: string | Array<string>,
        parameter: string,
        aval: string;

    for (parameter in parameters) {
        if (parameters.hasOwnProperty(parameter)) {
            pval = parameters[parameter];

            if (pval === null || pval === undefined)
                pval = '';

            if (isArray(pval)) {
                for (var idx = 0; idx < pval.length; ++idx) {
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

interface ActionPath {
    controller: string
    action: string
    containerPath: string
}

function codePath(path: string, method: (v: string) => string): string {
    var a = path.split('/');
    for (var i=0; i < a.length; i++) {
        a[i] = method(a[i]);
    }
    return a.join('/');
}

function parsePathName(path:string): ActionPath {

    const start = LABKEY.contextPath.length;
    const end = path.lastIndexOf('/');

    var action = path.substring(end + 1);
    path = path.substring(start, end);

    var controller:string = null;
    var dash = action.indexOf('-');

    if (0 < dash) {
        controller = action.substring(0, dash);
        action = action.substring(dash + 1);
    }
    else {
        var slash = path.indexOf('/', 1);
        if (slash < 0) // 21945: e.g. '/admin'
            controller = path.substring(1);
        else
            controller = path.substring(1, slash);
        path = path.substring(slash);
    }

    var dot = action.indexOf('.');
    if (0 < dot) {
        action = action.substring(0, dot);
    }

    return {
        controller: decodeURIComponent(controller),
        action: decodeURIComponent(action),
        containerPath: decodeURI(path)
    }
}