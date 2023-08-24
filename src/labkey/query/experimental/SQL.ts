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
import { buildURL } from '../../ActionURL';
import { request } from '../../Ajax';
import { getCallbackWrapper, getOnFailure, getOnSuccess, wafEncode } from '../../Utils';

const CONTROL_CHARS: any = {
    nul: '\x00',
    bs: '\x08', // backspace
    rs: '\x1E', // record separator
    us: '\x1F', // unit separator
};

const CONVERTERS: any = {
    BIGINT: parseInt, // parseDouble?
    BOOLEAN: parseInt,
    DOUBLE: parseFloat,
    INTEGER: parseInt,
    NUMERIC: parseFloat,
    REAL: parseFloat,
    SMALLINT: parseInt,
    TIMESTAMP: convertDate,
    TINYINT: parseInt,
};

export function asObjects(fields: string[], rows: any[]): any {
    const p: any = {};
    for (let f = 0; f < fields.length; f++) {
        p[fields[f]] = null;
    }

    const result = [];
    for (let r = 0; r < rows.length; r++) {
        const arr = rows[r];
        const obj = Object.assign({}, p);
        const l = Math.min(fields.length, arr.length);
        for (let c = 0; c < l; c++) {
            obj[fields[c]] = arr[c];
        }
        result.push(obj);
    }

    return result;
}

function convertDate(s: any): Date {
    if (!s) {
        return null;
    }

    let number;
    if (s.indexOf('-') > 0) {
        number = Date.parse(s);
    } else {
        number = parseFloat(s);
    }

    return new Date(!isNaN(number) && isFinite(number) ? number : s);
}

export interface IExecuteOptions {
    containerPath?: string;
    eol?: string;
    failure?: Function;
    parameters?: any;
    schema: string;
    scope?: any;
    sep?: string;
    sql: string;
    success?: Function;
    timeout?: number;
}

export function execute(options: IExecuteOptions): XMLHttpRequest {
    if (!options.schema) {
        throw 'You must specify a schema!';
    }

    if (!options.sql) {
        throw 'You must specify sql statement!';
    }

    const eol = options.eol || CONTROL_CHARS.us + '\n';
    const sep = options.sep || CONTROL_CHARS.us + '\t';

    const jsonData: any = {
        compact: 1,
        eol,
        parameters: options.parameters,
        schema: options.schema,
        sep,
        sql: wafEncode(options.sql),
    };

    return request({
        url: buildURL('sql', 'execute', options.containerPath),
        method: 'POST',
        jsonData,
        success: response => {
            const result = parseRows(response.responseText, sep, eol);
            getOnSuccess(options)(result);
        },
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        timeout: options.timeout,
    });
}

function identity(x: any): any {
    return x;
}

interface IParsedRows {
    names: string[];
    rows: string[];
    types: string[];
}

function parseRows(text: string, sep: string, eol: string): IParsedRows {
    let rows = text.split(eol);
    if (trimRight(rows[rows.length - 1]) === '') {
        rows.pop();
    }

    // names
    let x = 0;
    const meta = rows[x++].split(sep);
    const names = rows[x++].split(sep);

    // types
    const colConverters: any[] = [];
    const types = rows[x++].split(sep);
    for (let i = 0; i < types.length; i++) {
        colConverters.push(CONVERTERS[types[i]] || identity);
    }

    // skip all metadata rows
    rows = rows.slice(meta.length);

    // rows
    for (let r = 0; r < rows.length; r++) {
        const row: any = rows[r].split(sep);
        for (let c = 0; c < row.length; c++) {
            const s = row[c];
            if (s === '') {
                row[c] = null;
            } else if (CONTROL_CHARS.bs === s && r > 0) {
                row[c] = rows[r - 1][c];
            } else {
                row[c] = colConverters[c](s);
            }
        }
        rows[r] = row;
    }

    return {
        names,
        rows,
        types,
    };
}

function trimRight(s: string): string {
    return s.replace(/[\s\uFEFF\xA0]+$/g, '');
}
