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
import { loadDOMContext } from './constants';
import { buildURL } from '../ActionURL';

declare const Ext: any;
declare const Ext4: any;
declare const window: Window;

const { $, CSRF } = loadDOMContext();

export interface Worksheet {
    name?: string;
    data: any[];
}

export interface Workbook {
    fileName?: string;
    sheets: Worksheet[];
    auditMessage?: string;
}

export interface ConvertToTableOptions {
    delim?: DelimiterType;
    quoteChar?: QuoteCharType;
    fileNamePrefix?: string;
    newlineChar?: string;
    rows: any[];
    auditMessage?: string;
}

// Maps to TSVWriter.DELIM for delimited data export
export enum DelimiterType {
    COLON = 'COLON',
    COMMA = 'COMMA',
    SEMICOLON = 'SEMICOLON',
    TAB = 'TAB',
}

// Maps to TSVWriter.QUOTE for delimited data export
export enum QuoteCharType {
    DOUBLE = 'DOUBLE',
    NONE = 'NONE',
    SINGLE = 'SINGLE',
}

/**
 * Insert a hidden html <form> into to page, put the form values into it, and submit it - the server's response
 * will make the browser pop up a dialog.
 */
function submitForm(url: string, formData?: {[key: string]: any}): void {
    if (!formData) {
        formData = {};
    }
    if (!formData[CSRF_HEADER]) {
        formData[CSRF_HEADER] = CSRF;
    }

    const formId = generateUUID();

    let html = [];
    html.push('<f');   // avoid form tag, it causes skipfish false positive
    html.push('orm method="POST" id="' + formId + '"action="' + url + '">');
    for (let name in formData) {
        if (formData.hasOwnProperty(name)) {
            let value = formData[name];
            if (value === undefined) {
                continue;
            }

            html.push('<input type="hidden"' +
                ' name="' + encodeHtml(name) + '"' +
                ' value="' + encodeHtml(value) + '" />');
        }
    }
    html.push("</form>");

    $('body').append(html.join(''));
    $('form#' + formId).submit();
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
export function postToAction(href: string, formData?: {[key: string]: any}): void {
    submitForm(href, formData);
}

/**
 * POSTs the form values to the given href, including CSRF token.
 * Displays a confirmation dialog with the specified message and then, if confirmed, POSTs the form values to the href, using {postToAction}.
 */
export function confirmAndPost(message: string, href: string, formData?: {[key: string]: any}): boolean {
    if (confirm(message)) {
        submitForm(href, formData);
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

/**
 * Sends a JSON object to the server which turns it into an Excel file
 * #### Examples
 *
 *  ```js
 *  LABKEY.Utils.convertToExcel(
 *  {
 *      fileName: 'output.xls',
 *      sheets:
 *      [
 *          {
 *              name: 'FirstSheet',
 *              data:
 *              [
 *                  ['Row1Col1', 'Row1Col2'],
 *                  ['Row2Col1', 'Row2Col2']
 *             ]
 *          },
 *          {
 *              name: 'SecondSheet',
 *              data:
 *              [
 *                  ['Col1Header', 'Col2Header'],
 *                  [{value: 1000.5, formatString: '0,000.00'}, {value: '5 Mar 2009 05:14:17', formatString: 'yyyy MMM dd'}],
 *                  [{value: 2000.6, formatString: '0,000.00'}, {value: '6 Mar 2009 07:17:10', formatString: 'yyyy MMM dd'}]
 *              ]
 *          }
 *     ]
 *  });
 *  ```
 *
 */
export const convertToExcel = (workbook: Workbook): void => {
    const formData = { 'json': JSON.stringify(workbook) };
    submitForm(buildURL("experiment", "convertArraysToExcel"), formData);
};

/**
 * Sends a JSON object to the server which turns it into an TSV or CSV file and returns it to the browser to be saved or opened.
 *
 * #### Examples
 *
 * ```js
 * LABKEY.Utils.convertToTable({
 *      fileNamePrefix: 'output',
 *      rows: [
 *          ['Row1Col1', 'Row1Col2'],
 *          ['Row2Col1', 'Row2Col2']
 *      ],
 *      delim: DelimiterType.COMMA,
 *      quoteChar: QuoteCharType.DOUBLE
 * });
 * ```
 */
export const convertToTable = (config: ConvertToTableOptions): void => {
    const formData = { 'json': JSON.stringify(config) };
    submitForm(buildURL("experiment", "convertArraysToTable"), formData);
};
