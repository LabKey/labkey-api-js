/*
 * Copyright (c) 2017-2018 LabKey Corporation
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
import { CSRF_HEADER } from '../constants'
import { decode, encodeHtml, generateUUID, id } from '../Utils'
import { loadDOMContext } from './constants'

declare const Ext: any;
declare const Ext4: any;
declare const window: Window;

const { $, CSRF } = loadDOMContext();

/**
 * Insert a hidden html <form> into to page, put the form values into it, and submit it - the server's response
 * will make the browser pop up a dialog.
 */
function submitForm(url: string, formData?: Record<string, any>, formProps?: Partial<HTMLFormElement>): void {
    if (!formData) {
        formData = {};
    }
    if (!formData[CSRF_HEADER]) {
        formData[CSRF_HEADER] = CSRF;
    }

    const formElement = document.createElement('form');
    formElement.action = url;
    formElement.id = generateUUID();
    formElement.method = 'POST';

    if (formProps) {
        Object.keys(formProps).forEach((prop) => {
            formElement[prop] = formProps[prop];
        });
    }

    Object.keys(formData).forEach((name) => {
        const value = formData[name];

        if (value === undefined) {
            return;
        }

        const inputElement = document.createElement('input');
        inputElement.type = 'hidden';
        inputElement.name = name;
        inputElement.value = value;

        formElement.appendChild(inputElement);
    });

    document.body.appendChild(formElement);
    formElement.submit();
}

/**
 * Display an error dialog
 */
export function alert(title: string, msg?: string) {
    if (typeof Ext4 !== 'undefined') {
        Ext4.Msg.alert(title ? Ext4.htmlEncode(title) : '', msg ? Ext4.htmlEncode(msg) : '')
    }
    else if (typeof Ext !== 'undefined') {
        Ext.Msg.alert(title ? Ext.util.Format.htmlEncode(title) : '', msg ? Ext.util.Format.htmlEncode(msg) : '');
    }
    else if (typeof window !== 'undefined') {
        window.alert(encodeHtml(title + ' : ' + msg));
    }
}

/**
 * Shows an error dialog box to the user in response to an error from an AJAX request,
 * including any error messages from the server.
 */
export function displayAjaxErrorResponse(response: XMLHttpRequest, exceptionObj?: any, showExceptionClass?: boolean, msgPrefix?: string): void {
    if (response.status === 0) {
        // Don't show an error dialog if the user cancelled the request in the browser, like navigating
        // to another page
        return;
    }

    alert('Error', getMsgFromError(response, exceptionObj, {
        msgPrefix,
        showExceptionClass
    }));
}

/**
 * @Override
 * Generates a display string from the response to an error from an AJAX request
 */
export function getMsgFromError(response: XMLHttpRequest, exceptionObj: any, config: any): string {
    config = config || {};
    let error;
    let prefix = config.msgPrefix || 'An error occurred trying to load:\n';

    if (response && response.responseText && response.getResponseHeader('Content-Type')) {
        const contentType = response.getResponseHeader('Content-Type');

        if (contentType.indexOf('application/json') >= 0) {
            const json = decode(response.responseText);

            if (json && json.exception) {
                error = prefix + json.exception;
                if (config.showExceptionClass) {
                    error += '\n(' + (json.exceptionClass ? json.exceptionClass : 'Exception class unknown') + ')';
                }
            }
        }
        else if (contentType.indexOf('text/html') >= 0 && $) {
            const html = $(response.responseText);
            const el = html.find('.exception-message');
            if (el && el.length === 1) {
                error = prefix + el.text().trim();
            }
        }
    }
    if (!error) {
        error = prefix + 'Status: ' + response.statusText + ' (' + response.status + ')';
    }
    if (exceptionObj && exceptionObj.message) {
        error += '\n' + exceptionObj.name + ': ' + exceptionObj.message;
    }

    return error;
}

/**
 * POSTs the form values to the given href, including CSRF token.
 */
export function postToAction(href: string, formData?: Record<string, any>, formProps?: Partial<HTMLFormElement>): void {
    submitForm(href, formData, formProps);
}

/**
 * POSTs the form values to the given href, including CSRF token.
 * Displays a confirmation dialog with the specified message and then, if confirmed, POSTs the form values to the href, using {postToAction}.
 */
export function confirmAndPost(
    message: string,
    href: string,
    formData?: Record<string, any>,
    formProps?: Partial<HTMLFormElement>
): boolean {
    if (confirm(message)) {
        submitForm(href, formData, formProps);
        return true;
    }

    return false;
}

/**
 * Sets the title of the webpart on the page. This change is not sticky, so it will be reverted on refresh.
 */
export function setWebpartTitle(title: string, webPartId: number): void {
    $('table#webpart_' + webPartId + ' span[class=labkey-wp-title-text]').html(encodeHtml(title));
}

export function signalWebDriverTest(signalName: string, signalResult?: any): void {
    let signalContainerId = 'testSignals';
    let signalContainerSelector = '#' + signalContainerId;
    let signalContainer = $(signalContainerSelector);
    let formHTML = '<div id="' + signalContainerId + '"/>';

    if (!signalContainer.length) {
        $('body').append(formHTML);
        signalContainer = $(signalContainerSelector);
        signalContainer.hide();
    }

    signalContainer.find('div[name="' + signalName + '"]').remove();
    signalContainer.append('<div name="' + signalName + '" id="' + id() + '"/>');
    if (signalResult) {
        signalContainer.find('div[name="' + signalName + '"]').attr('value', signalResult);
    }
}