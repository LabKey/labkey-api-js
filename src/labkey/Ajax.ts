import { loadContext } from './constants'
import { queryString } from './ActionURL'

const LABKEY = loadContext();

export const DEFAULT_HEADERS: {[key: string]: string} = {
    'X-LABKEY-CSRF': LABKEY.CSRF
};

interface ConfiguredOptions {
    // Required
    isForm: boolean
    method: string
    url: string

    // Optional
    data?: FormData | string
}

interface RequestOptions {
    // Required
    url: string

    // Optional
    callback?: (config: RequestOptions, success: boolean, xhr: XMLHttpRequest) => void
    failure?: (request: XMLHttpRequest, config: RequestOptions) => void
    form?: FormData | HTMLFormElement
    headers?: {[key:string]: string}
    jsonData?: Object
    method?: string
    params?: {[key:string]: string | Array<string>}
    scope?: any
    success?: (request: XMLHttpRequest, config: RequestOptions) => void
    timeout?: number
}

function callback(fn: Function, scope: any, args?: any) {
    if (fn) {
        fn.apply(scope, args);
    }
}

/**
 * Returns true iff obj contains case-insensitive key
 * @param {object} obj
 * @param {string} key
 */
function contains(obj: Object, key: string) {
    if (key) {
        var lowerKey = key.toLowerCase();
        for (var k in obj) {
            if (obj.hasOwnProperty(k) && k.toLowerCase() === lowerKey) {
                return true;
            }
        }
    }
    return false;
}

function configureHeaders(xhr: XMLHttpRequest, config: RequestOptions, options: ConfiguredOptions): void {
    var headers = config.headers,
        jsonData = config.jsonData;

    if (headers === undefined || headers === null) {
        headers = {};
    }

    // only set Content-Type if this is not FormData and it has not been set explicitly
    if (!options.isForm && !contains(headers, 'Content-Type')) {
        if (jsonData !== undefined && jsonData !== null) {
            headers['Content-Type'] = 'application/json';
        }
        else {
            headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        }
    }

    if (!contains(headers, 'X-Requested-With')) {
        headers['X-Requested-With'] = 'XMLHttpRequest';
    }

    for (var k in DEFAULT_HEADERS) {
        if (DEFAULT_HEADERS.hasOwnProperty(k)) {
            xhr.setRequestHeader(k, DEFAULT_HEADERS[k]);
        }
    }

    for (var k in headers) {
        if (headers.hasOwnProperty(k)) {
            xhr.setRequestHeader(k, headers[k]);
        }
    }
}

function configureOptions(config: RequestOptions): ConfiguredOptions {
    var data: string;
    var formData: FormData;
    var method = 'GET';
    var isForm = false;

    if (!config.hasOwnProperty('url') || config.url === null) {
        throw new Error('a URL is required to make a request');
    }

    var url = config.url;
    var params = config.params;

    // configure data
    if (config.form) {
        formData = config.form instanceof FormData ? config.form as FormData : new FormData(config.form as HTMLFormElement);
        isForm = true;
    }
    else if (config.jsonData) {
        data = JSON.stringify(config.jsonData);
    }

    // configure method
    if (config.hasOwnProperty('method') && config.method !== null) {
        method = config.method.toUpperCase();
    }
    else if (data) {
        method = 'POST';
    }

    // configure params
    if (params !== undefined && params !== null) {

        var qs = queryString(params);

        // 26617: backwards compatibility to append params to the body in the case of a POST without form/jsonData
        if (method === 'POST' && (data === undefined || data === null)) {
            data = qs;
        }
        else {
            url += (url.indexOf('?') === -1 ? '?' : '&') + qs;
        }
    }

    return {
        url,
        method,
        data: isForm ? formData : data,
        isForm
    }
}

export function request(config: RequestOptions): XMLHttpRequest {
    var options = configureOptions(config);
    var scope = config.hasOwnProperty('scope') && config.scope !== null ? config.scope : this;
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            var success = (xhr.status >= 200 && xhr.status < 300) || xhr.status == 304;

            callback(success ? config.success : config.failure, scope, [xhr, config]);
            callback(config.callback, scope, [config, success, xhr]);
        }
    };

    xhr.open(options.method, options.url, true /* async */);

    // configure headers after request is open
    configureHeaders(xhr, config, options);

    // configure timeout after request is open
    if (config.hasOwnProperty('timeout') && config.timeout !== null && config.timeout !== undefined) {
        xhr.ontimeout = function() {
            callback(config.failure, scope, [xhr, config]);
            callback(config.callback, scope, [config, false /* success */, xhr]);
        };
    }

    xhr.send(options.data);

    return xhr;
}