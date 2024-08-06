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
import { CSRF_HEADER, getServerContext } from './constants';
import { buildURL, queryString } from './ActionURL';

const { CSRF, defaultHeaders } = getServerContext();

export let DEFAULT_HEADERS: Record<string, string> = {
    [CSRF_HEADER]: CSRF,
};

// TODO: This should only be pulled from server context
if (defaultHeaders) {
    DEFAULT_HEADERS = defaultHeaders;
}

export type AjaxHandler = (request: XMLHttpRequest, config: RequestOptions) => any;
export type AjaxCallbackHandler = (config: RequestOptions, success: boolean, xhr: XMLHttpRequest) => any;

interface ConfiguredOptions {
    data?: FormData | string;
    isForm: boolean;
    method: string;
    url: string;
}

export interface RequestOptions {
    /**
     * A function called after any success/failure response is received. It will be passed the following arguments:
     * * <b>originalConfig:</b> The config originally supplied to LABKEY.Ajax.request
     * * <b>success:</b> boolean value that is true if the request was successful
     * * <b>xhr:</b> The XMLHttpRequest where the text of the response can be found on xhr.responseText amongst other properties
     */
    callback?: AjaxCallbackHandler;

    /**
     * Save the response as a file. Only works in browser environments.
     * When downloadFile is true, the download filename should be included in the response header (e.g. `Content-Disposition: attachment; filename=data.xlsx`)
     * When downloadFile is a string, the download value will be used as the download filename.
     * The success or failure functions will still be called.
     */
    downloadFile?: boolean | string;

    /**
     * A function called when a failure response is received (determined by XHR readyState, status, or ontimeout
     * if supplied). It will be passed the following arguments:
     * * <b>xhr:</b> The XMLHttpRequest where the text of the response can be found on xhr.responseText amongst other properties
     * * <b>originalConfig:</b> The config originally supplied to LABKEY.Ajax.request
     */
    failure?: AjaxHandler;

    /**
     * FormData or Object consumable by FormData that can be used to POST key/value pairs of form information.
     * For more information, see <a href="https://developer.mozilla.org/en-US/docs/Web/API/FormData">FormData documentation</a>.
     */
    form?: FormData | HTMLFormElement;

    /**
     * Object specifying additional HTTP headers to add the request.
     */
    headers?: Record<string, string>;

    initialConfig?: any;

    /**
     * Data provided to the XMLHttpRequest.send(data) function. If the request is method "POST" this is the body
     * of the request.
     */
    jsonData?: any;

    /**
     * HTTP request method used for the XMLHttpRequest. Examples are "GET", "PUSH, "DELETE", etc.
     * Defaults to "GET" unless jsonData is supplied then the default is changed to "POST". For more information,
     * see this <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods">HTTP request method documentation</a>.
     */
    method?: string;

    /**
     * An object representing URL parameters that will be added to the URL. Note, that if the request is method
     * "POST" and jsonData is not provided these params will be sent via the body of the request.
     */
    params?: Record<string, any>;

    /**
     * A scope for the callback functions. Defaults to "this".
     */
    scope?: any;

    /**
     * A function called when a successful response is received (determined by XHR readyState and status).
     * It will be passed the following arguments:
     * * <b>xhr:</b> The XMLHttpRequest where the text of the response can be found on xhr.responseText amongst other properties
     * * <b>originalConfig:</b> The config originally supplied to LABKEY.Ajax.request
     */
    success?: AjaxHandler;

    /**
     * If a non-null value is supplied then XMLHttpRequest.ontimeout will be hooked to failure.
     */
    timeout?: number;

    /**
     * The url used for the XMLHttpRequest. If you are making a request to the LabKey Server instance
     * see {@link buildURL} for helpful URL construction.
     */
    url: string;
}

/**
 * @hidden
 * @private
 */
function callback(fn: Function, scope: any, args?: any) {
    if (fn) {
        fn.apply(scope, args);
    }
}

/**
 * @hidden
 * @private
 * Returns true iff obj contains case-insensitive key
 */
function contains(obj: Object, key: string) {
    if (key) {
        const lowerKey = key.toLowerCase();
        for (const k in obj) {
            if (obj.hasOwnProperty(k) && k.toLowerCase() === lowerKey) {
                return true;
            }
        }
    }
    return false;
}

/**
 * @hidden
 * @private
 */
function configureHeaders(xhr: XMLHttpRequest, config: RequestOptions, options: ConfiguredOptions): void {
    let headers = config.headers,
        jsonData = config.jsonData;

    if (headers === undefined || headers === null) {
        headers = {};
    }

    // only set Content-Type if this is not FormData and it has not been set explicitly
    if (!options.isForm && !contains(headers, 'Content-Type')) {
        if (jsonData !== undefined && jsonData !== null) {
            headers['Content-Type'] = 'application/json';
        } else {
            headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        }
    }

    if (!contains(headers, 'X-Requested-With')) {
        headers['X-Requested-With'] = 'XMLHttpRequest';
    }

    for (const k in DEFAULT_HEADERS) {
        if (DEFAULT_HEADERS.hasOwnProperty(k)) {
            xhr.setRequestHeader(k, DEFAULT_HEADERS[k]);
        }
    }

    for (const k in headers) {
        if (headers.hasOwnProperty(k)) {
            xhr.setRequestHeader(k, headers[k]);
        }
    }
}

/**
 * @hidden
 * @private
 */
function configureOptions(config: RequestOptions): ConfiguredOptions {
    let data: string;
    let formData: FormData;
    let method = 'GET';
    let isForm = false;

    if (!config || !config.hasOwnProperty('url') || config.url === null) {
        throw new Error('a URL is required to make a request');
    }

    let url = config.url;
    const params = config.params;

    // configure data
    if (config.form) {
        formData =
            config.form instanceof FormData ? (config.form as FormData) : new FormData(config.form as HTMLFormElement);
        isForm = true;
    } else if (config.jsonData) {
        data = JSON.stringify(config.jsonData);
    }

    // configure method
    if (config.hasOwnProperty('method') && config.method !== null) {
        method = config.method.toUpperCase();
    } else if (data) {
        method = 'POST';
    }

    // configure params
    if (params !== undefined && params !== null) {
        const qs = queryString(params);

        // 26617: backwards compatibility to append params to the body in the case of a POST without form/jsonData
        if (method === 'POST' && (data === undefined || data === null)) {
            data = qs;
        } else {
            url += (url.indexOf('?') === -1 ? '?' : '&') + qs;
        }
    }

    return {
        data: isForm ? formData : data,
        isForm,
        method,
        url,
    };
}

/**
 * Parse the filename out of the Content-Disposition header.
 *   https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition
 * Examples:
 *   Content-Disposition: attachment; filename=data.xlsx
 *   Content-Disposition: attachment; filename*=UTF-8''filename.xlsx
 *   Content-Disposition: attachment: filename=data.csv; filename*=UTF-8''filename.csv
 *   Content-Disposition: attachment: filename*=UTF-8''data.csv; filename=filename.csv
 * The pattern below will match the first filename provided (so, data.csv in the last two examples)
 * Exported for jest testing
 * @hidden
 * @private
 */
export function getFilenameFromContentDisposition(disposition: string): string {
    var filename;
    if (disposition && disposition.startsWith('attachment')) {
        const matches = /filename\*?=([^']*'')?(['"].*?['"]|[^;\n]*)/.exec(disposition);
        if (matches && matches[2]) {
            filename = decodeURI(matches[2].replace(/['"]/g, ''));
        }
    }
    return filename;
}

/**
 * Download the file from the ajax response.
 * For now, we assume we are in a browser environment and use the browser's download file prompt
 * by clicking an anchor tag element or navigating by updating window.location.
 * @hidden
 * @private
 */
function downloadFile(xhr: XMLHttpRequest, config: any): void {
    let filename = '';
    if (typeof config.downloadFile === 'string') {
        filename = config.downloadFile;
    } else {
        filename = getFilenameFromContentDisposition(xhr.getResponseHeader('Content-Disposition'));
    }

    const blob = xhr.response;
    const downloadUrl = URL.createObjectURL(blob);

    if (filename) {
        // use HTML5 a[download] attribute to specify filename
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
    } else {
        window.location.href = downloadUrl;
    }

    setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
    }, 100); // cleanup
}

/**
 * Make a XMLHttpRequest nominally to a LabKey instance. Includes success/failure callback mechanism,
 * HTTP header configuration, support for FormData, and parameter encoding amongst other features.
 */
export function request(config: RequestOptions): XMLHttpRequest {
    const options = configureOptions(config);
    const scope = config.hasOwnProperty('scope') && config.scope !== null ? config.scope : this;
    const xhr = new XMLHttpRequest();

    if (config.downloadFile) {
        xhr.responseType = 'blob';
    }

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            const success = (xhr.status >= 200 && xhr.status < 300) || xhr.status == 304;

            if (success && config.downloadFile) {
                downloadFile(xhr, config);
            }

            callback(success ? config.success : config.failure, scope, [xhr, config]);
            callback(config.callback, scope, [config, success, xhr]);
        } else if (xhr.readyState === 2 && xhr.responseType === 'blob') {
            // Change response type of download requests to allow reading any error messages upon failure
            const success = (xhr.status >= 200 && xhr.status < 300) || xhr.status == 304;
            if (!success) {
                xhr.responseType = 'text';
            }
        }
    };

    xhr.open(options.method, options.url, true);

    // configure headers after request is open
    configureHeaders(xhr, config, options);

    // configure timeout after request is open
    if (config.hasOwnProperty('timeout') && config.timeout !== null && config.timeout !== undefined) {
        xhr.ontimeout = function () {
            callback(config.failure, scope, [xhr, config]);
            callback(config.callback, scope, [config, false /* success */, xhr]);
        };
    }

    xhr.send(options.data);

    return xhr;
}
