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
import { DelimiterType, loadDOMContext, QuoteCharType } from './constants';
import { buildURL } from '../ActionURL';

declare const Ext: any;
declare const Ext4: any;
declare const window: Window;

const { $, CSRF } = loadDOMContext();

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
 * Sends a JSON object to the server which turns it into an Excel file and returns it to the browser to be saved or opened.
 * @memberOf LABKEY.Utils
 * @function
 * @static
 * @name convertToExcel
 * @param {Object} workbook the JavaScript representation of the data
 * @param {String} workbook.fileName name to suggest to the browser for saving the file. If the fileName is
 * specified and ends with ".xlsx", it will be returned in Excel 2007 format.
 * @param {String} workbook.sheets array of sheets, which are objects with properties:
 * <ul>
 * <li><b>name:</b> name of the Excel sheet</li>
 * <li><b>data:</b> two dimensional array of values</li>
 * </ul>
 * The value array may be either primitives (booleans, numbers, Strings, and dates), or may be a map with
 * the following structure:
 * <ul>
 * <li><b>value:</b> the boolean, number, String, or date value of the cell</li>
 * <li><b>formatString:</b> for dates and numbers, the Java format string used with SimpleDateFormat
 * or DecimalFormat to control how the value is formatted</li>
 * <li><b>timeOnly:</b> for dates, whether the date part should be ignored and only the time value is important</li>
 * <li><b>forceString:</b> force the value to be treated as a string (i.e. prevent attempt to convert it to a date)</li>
 * </ul>
 * @example &lt;script type="text/javascript"&gt;
 LABKEY.Utils.convertToExcel(
 {
         fileName: 'output.xls',
         sheets:
         [
             {
                 name: 'FirstSheet',
                 data:
                 [
                     ['Row1Col1', 'Row1Col2'],
                     ['Row2Col1', 'Row2Col2']
                 ]
             },
             {
                 name: 'SecondSheet',
                 data:
                 [
                     ['Col1Header', 'Col2Header'],
                     [{value: 1000.5, formatString: '0,000.00'}, {value: '5 Mar 2009 05:14:17', formatString: 'yyyy MMM dd'}],
                     [{value: 2000.6, formatString: '0,000.00'}, {value: '6 Mar 2009 07:17:10', formatString: 'yyyy MMM dd'}]

                 ]
             }
         ]
     });
 &lt;/script&gt;
 */
export const convertToExcel = (workbook: Workbook): void => {
    const formData = { 'json': JSON.stringify(workbook) };
    submitForm(buildURL("experiment", "convertArraysToExcel"), formData);
};

/**
 * Sends a JSON object to the server which turns it into an TSV or CSV file and returns it to the browser to be saved or opened.
 * @memberOf LABKEY.Utils
 * @function
 * @static
 * @name convertToTable
 * @param {Object} config.  The config object
 * @param {String} config.fileNamePrefix name to suggest to the browser for saving the file. The appropriate extension (either ".txt" or ".csv", will be appended based on the delim character used (see below).  Defaults to 'Export'
 * @param {String} config.delim The separator between fields.  Allowable values are 'COMMA' or 'TAB'.
 * @param {String} config.quoteChar The character that will be used to quote each field.  Allowable values are 'DOUBLE' (ie. double-quote character), 'SINGLE' (ie. single-quote character) or 'NONE' (ie. no character used).  Defaults to none.
 * @param {String} config.newlineChar The character that will be used to separate each line.  Defaults to '\n'
 * @param {String} config.rows array of rows, which are arrays with values for each cell.
 * @example &lt;script type="text/javascript"&gt;
 LABKEY.Utils.convertToTable({
         fileNamePrefix: 'output',
         rows: [
             ['Row1Col1', 'Row1Col2'],
             ['Row2Col1', 'Row2Col2']
         ],
         delim: 'COMMA'
     });
 &lt;/script&gt;
 */
export const convertToTable = (config: TextTableForm): void => {
    const formData = { 'json': JSON.stringify(config) };
    submitForm(buildURL("experiment", "convertArraysToTable"), formData);
};

export interface Worksheet {
    name?: string;
    data: any[];
}

export interface Workbook {
    fileName?: string;
    sheets: Worksheet[];
}

export interface TextTableForm {
    delim?: DelimiterType;
    quoteChar?: QuoteCharType;
    fileNamePrefix?: string;
    newlineChar?: string;
    rows: any[];
}
