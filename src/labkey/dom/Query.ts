/*
 * Copyright (c) 2016 LabKey Corporation
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
import { buildURL } from '../ActionURL'
import { encodeHtml, generateUUID, merge } from '../Utils'
import { appendFilterParams } from '../filter/Filter'

import { loadDOMContext } from './constants'

const { $, CSRF } = loadDOMContext();

interface IExportSqlOptions {
    containerFilter?: string
    containerPath?: string
    format?: string
    schemaName: string
    sql: string
}

/**
 * Execute arbitrary LabKey SQL and export the results to Excel or TSV. After this method is
 * called, the user will be prompted to accept a file from the server, and most browsers will allow
 * the user to either save it or open it in an appropriate application.
 * For more information, see the
 * <a href="https://www.labkey.org/wiki/home/Documentation/page.view?name=labkeySql">
 * LabKey SQL Reference</a>.
 */
export function exportSql(options: IExportSqlOptions): void {

    submitForm(buildURL('query', 'exportSql', options.containerPath), {
        containerFilter: options.containerFilter,
        format: options.format,
        schemaName: options.schemaName,
        sql: options.sql
    });
}

interface IExportTablesOptions {
    headerType?: string
    schemas: any
}

/**
 * @private
 * Export a set of tables
 */
export function exportTables(options: IExportTablesOptions): void {
    let formData: any = {};

    if (options.headerType) {
        formData.headerType = options.headerType;
    }

    // Create a copy of the schema config that we can mutate
    let schemas = merge({}, options.schemas);
    for (let schemaName in schemas) {
        if (!schemas.hasOwnProperty(schemaName)) {
            continue;
        }

        let queryList = schemas[schemaName];
        for (let i = 0; i < queryList.length; i++) {
            let querySettings = queryList[i];
            let o = merge({}, querySettings);

            delete o.filter;
            delete o.filterArray;
            delete o.sort;

            // Turn the filters array into a filters map similar to QueryWebPart.js
            o.filters = appendFilterParams(null, querySettings.filters || querySettings.filterArray);

            if (querySettings.sort) {
                o.filters['query.sort'] = querySettings.sort;
            }

            queryList[i] = o;
        }
    }

    formData.schemas = JSON.stringify(schemas);

    submitForm(buildURL('query', 'exportTables.view'), formData);
}

/**
 * Insert a hidden <form> into to page, put the JSON into it, and submit it - the server's response
 * will make the browser pop up a dialog.
 */
function submitForm(url: string, formData: any): void {
    if (!formData[CSRF_HEADER]) {
        formData[CSRF_HEADER] = CSRF;
    }

    const formId = generateUUID();

    let html = '<form method="POST" id="' + formId + '" action="' + url + '">';
    for (let name in formData) {
        if (formData.hasOwnProperty(name)) {
            let value = formData[name];
            if (value == undefined) {
                continue;
            }

            html += '<input type="hidden"' +
                ' name="' + encodeHtml(name) + '"' +
                ' value="' + encodeHtml(value) + '" />';
        }
    }
    html += "</form>";

    $('body').append(html);
    $('form#' + formId).submit();
}