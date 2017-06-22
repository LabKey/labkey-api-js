/*
 * Copyright (c) 2016-2017 LabKey Corporation
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
import { CSRF_HEADER, loadContext } from './constants'
import { queryString } from './ActionURL'

const { CSRF, defaultHeaders } = loadContext();

export let DEFAULT_HEADERS: {[key: string]: string} = {
    [CSRF_HEADER]: CSRF
};

// TODO: This should only be pulled from server context
if (defaultHeaders) {
    DEFAULT_HEADERS = defaultHeaders;
}

export type AjaxHandler = (request: XMLHttpRequest, config: RequestOptions) => any;
export type AjaxCallbackHandler = (config: RequestOptions, success: boolean, xhr: XMLHttpRequest) => any;

interface ConfiguredOptions {
    // Required
    isForm: boolean
    method: string
    url: string

    // Optional
    data?: FormData | string
}

export interface RequestOptions {
    // Required
    url: string

    // Optional
    callback?: AjaxCallbackHandler
    failure?: AjaxHandler
    form?: FormData | HTMLFormElement
    headers?: {[key:string]: string}
    initialConfig?: any
    jsonData?: any
    method?: string
    params?: {[key:string]: any}
    scope?: any
    success?: AjaxHandler
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
        const lowerKey = key.toLowerCase();
        for (let k in obj) {
            if (obj.hasOwnProperty(k) && k.toLowerCase() === lowerKey) {
                return true;
            }
        }
    }
    return false;
}

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
        }
        else {
            headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        }
    }

    if (!contains(headers, 'X-Requested-With')) {
        headers['X-Requested-With'] = 'XMLHttpRequest';
    }

    for (let k in DEFAULT_HEADERS) {
        if (DEFAULT_HEADERS.hasOwnProperty(k)) {
            xhr.setRequestHeader(k, DEFAULT_HEADERS[k]);
        }
    }

    for (let k in headers) {
        if (headers.hasOwnProperty(k)) {
            xhr.setRequestHeader(k, headers[k]);
        }
    }
}

function configureOptions(config: RequestOptions): ConfiguredOptions {
    let data: string;
    let formData: FormData;
    let method = 'GET';
    let isForm = false;

    if (!config || !config.hasOwnProperty('url') || config.url === null) {
        throw new Error('a URL is required to make a request');
    }

    let url = config.url;
    let params = config.params;

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

        let qs = queryString(params);

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
    let options = configureOptions(config);
    let scope = config.hasOwnProperty('scope') && config.scope !== null ? config.scope : this;
    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            let success = (xhr.status >= 200 && xhr.status < 300) || xhr.status == 304;

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