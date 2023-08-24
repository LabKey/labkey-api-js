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
import { buildURL } from '../ActionURL';
import { request } from '../Ajax';
import { FieldKey } from '../FieldKey';
import { SchemaKey } from '../SchemaKey';
import { decode, isArray, isFunction, isString } from '../Utils';

import { Response } from './Response';

export interface IGetDataFilter {
    /** Can be a string, array of strings, or a {@link FieldKey} */
    fieldKey: string[];

    /** Can be a string or a type from {@link Types} */
    type: any;

    /** Optional depending on filter type. The value to filter on. */
    value?: any;
}

export interface IGetDataSource {
    /** The path to the target container to execute the GetData call in. */
    containerPath?: string;

    /** The queryName to use in the request. Required if source.type = "query". */
    queryName?: string;

    /** The schemaName to use in the request. Can be a string, array of strings, or {@link SchemaKey}. */
    schemaName?: string | string[] | SchemaKey;

    /** The LabKey SQL to use in the request. Required if source.type = "sql". */
    sql?: string;

    /**
     * A string with value set to either "query" or "sql". Indicates if the value is "sql" then source.sql is required.
     * If the value is "query" then source.queryName is required.
     */
    type?: 'query' | 'sql';
}

export interface IGetRawDataOptions {
    /**
     * An array containing {@link FieldKey} objects, strings, or arrays of strings.
     * Used to specify which columns the user wants. The columns must match those returned from the last transform.
     */
    columns?: Array<string | string[] | FieldKey>;

    /**
     * If no failure function is provided the response is sent to the console
     * via console.error. If a function is provided the JSON response is passed to it as the only parameter.
     */
    failure?: (json?: any) => any;

    /**
     * Include the Details link column in the set of columns (defaults to false).
     * If included, the column will have the name "~~Details~~". The underlying table/query must support details
     * links or the column will be omitted in the response.
     */
    includeDetailsColumn?: boolean;

    /**
     * The maximum number of rows to return from the server (defaults to 100000). If you want
     * to return all possible rows, set this config property to -1.
     */
    maxRows?: number;

    /**
     * The index of the first row to return from the server (defaults to 0). Use this along
     * with the maxRows config property to request pages of data.
     */
    offset?: number;

    pivot?: IPivot;

    scope?: any;

    /** Define how columns are sorted. */
    sort?: ISort[];

    /** An object which contains parameters related to the source of the request. */
    source: IGetDataSource;

    /**
     * A function to be executed when the GetData request completes successfully. The function will
     * be passed a {@link Response} object.
     */
    success: () => any;

    transforms?: ITransform[];
}

export interface IGetRawDataParams {
    renderer: IRenderer;
    source: IGetDataSource;
    transforms?: ITransform[];
}

export interface IPivot {
    /** The column to pivot by. Can be an array of strings, a string, or a {@link FieldKey} */
    by: string | string[] | FieldKey;

    /**
     * The columns to pivot. Is an array containing strings, arrays of strings, and/or
     * {@link FieldKey} objects.
     */
    columns: Array<string | string[] | FieldKey>;
}

export interface IRenderer {
    columns?: Array<string | string[] | FieldKey>;
    includeDetailsColumn?: boolean;
    maxRows?: number;
    offset?: number;
    sort?: ISort[];
    type?: string;
}

export interface ISort {
    /** Can be 'ASC' or 'DESC', defaults to 'ASC'. */
    dir?: string;

    /** The field key of the column to sort. Can be a string, array of strings, or a {@link FieldKey} */
    fieldKey: string | string[] | FieldKey;
}

export interface ITransform {
    aggregates?: ITransformAggregate[];

    /** An array containing  objects created with {@link create}, {@link Filter} objects, or javascript objects. */
    filters?: IGetDataFilter[];

    /** An array of Objects. Each object can be a string, array of strings, or a {@link FieldKey}. */
    groupBy?: Array<string | string[] | FieldKey>;

    type?: string;
}

export interface ITransformAggregate {
    /** The target column. Can be an array of strings, a string, or a {@link FieldKey} */
    fieldKey: string | string[] | FieldKey;

    /**  The type of aggregate. */
    type: string;
}

/**
 * Used to get the raw data from a GetData request. Roughly equivalent to {@link selectRows} or
 * {@link executeSql}, except it allows the user to pass the data through a series of transforms.
 */
export function getRawData(config: IGetRawDataOptions): XMLHttpRequest {
    const jsonData = validateGetDataConfig(config);
    jsonData.renderer.type = 'json';

    if (!config.success) {
        throw new Error('A success callback is required');
    }

    return request({
        url: buildURL('query', 'getData', config.source.containerPath),
        method: 'POST',
        jsonData,
        success: (response: any, options: any) => {
            const json = decode(response.responseText);
            config.success.call(config.scope || this, new Response(json), response, options);
        },
        failure: (response: any, options: any) => {
            const json = decode(response.responseText);
            if (config.failure) {
                config.failure(json);
            } else {
                if (response.status != 0) {
                    console.error('Failure occurred during getData', json);
                }
            }
        },
    });
}

function validateGetDataConfig(config: IGetRawDataOptions): IGetRawDataParams {
    if (!config || config === null || config === undefined) {
        throw new Error('A config object is required for GetData requests.');
    }

    const source = config.source;
    validateSource(source);

    const jsonData: IGetRawDataParams = {
        renderer: {},
        // Shallow copy source so if the user adds unexpected properties to source the server doesn't throw errors.
        source: {
            schemaName: source.schemaName,
            type: source.type,
        },
    };

    if (source.type === 'query') {
        jsonData.source.queryName = source.queryName;
    } else if (source.type === 'sql') {
        jsonData.source.sql = source.sql;
    }

    if (config.transforms) {
        if (!isArray(config.transforms)) {
            throw new Error('transforms must be an array.');
        }

        jsonData.transforms = config.transforms;
        for (let i = 0; i < jsonData.transforms.length; i++) {
            validateTransform(jsonData.transforms[i]);
        }
    }

    if (config.pivot) {
        validatePivot(config.pivot);
    }

    if (config.columns) {
        if (!isArray(config.columns)) {
            throw new Error('columns must be an array of FieldKeys.');
        }

        for (let i = 0; i < config.columns.length; i++) {
            config.columns[i] = validateFieldKey(config.columns[i]);

            if (!config.columns[i]) {
                throw new Error('columns must be an array of FieldKeys.');
            }
        }

        jsonData.renderer.columns = config.columns;
    }

    if (config.hasOwnProperty('offset')) {
        jsonData.renderer.offset = config.offset;
    }

    if (config.hasOwnProperty('includeDetailsColumn')) {
        jsonData.renderer.includeDetailsColumn = config.includeDetailsColumn;
    }

    if (config.hasOwnProperty('maxRows')) {
        jsonData.renderer.maxRows = config.maxRows;
    }

    if (config.sort) {
        if (!isArray(config.sort)) {
            throw new Error('sort must be an array.');
        }

        for (let i = 0; i < config.sort.length; i++) {
            if (!config.sort[i].fieldKey) {
                throw new Error('Each sort must specify a field key.');
            }

            config.sort[i].fieldKey = validateFieldKey(config.sort[i].fieldKey);

            if (!config.sort[i].fieldKey) {
                throw new Error('Invalid field key specified for sort.');
            }

            if (config.sort[i].dir) {
                config.sort[i].dir = config.sort[i].dir.toUpperCase();
            }
        }

        jsonData.renderer.sort = config.sort;
    }

    return jsonData;
}

/**
 * @hidden
 * @private
 * @param {string | Array<string> | FieldKey} key
 * @returns {Array<string>}
 */
function validateFieldKey(key: string | string[] | FieldKey): string[] {
    if (key instanceof FieldKey) {
        return key.getParts();
    }

    if (key instanceof Array) {
        return key;
    }

    if (isString(key)) {
        return FieldKey.fromString(key).getParts();
    }

    return undefined;
}

function validateFilter(filter: any): IGetDataFilter {
    // TODO: This behavior is changed from original, however, LABKEY.Query.Filter is not an "instance" so
    // need to check whether that ever worked as expected or just worked because of the fallback duck-typing.
    if (filter && isFunction(filter.getColumnName)) {
        return {
            fieldKey: FieldKey.fromString(filter.getColumnName()).getParts(),
            type: filter.getFilterType().getURLSuffix(),
            value: filter.getValue(),
        };
    }

    // If filter isn't a LABKEY.Query.Filter or LABKEY.Filter, then it's probably a raw object.
    if (filter.fieldKey) {
        filter.fieldKey = validateFieldKey(filter.fieldKey);
    } else {
        throw new Error('All filters must have a "fieldKey" attribute.');
    }

    if (!filter.fieldKey) {
        throw new Error('Filter fieldKeys must be valid FieldKeys');
    }

    if (!filter.type) {
        throw new Error('All filters must have a "type" attribute.');
    }
    return filter;
}

/**
 * @hidden
 * @private
 * @param {IPivot} pivot
 */
function validatePivot(pivot: IPivot): void {
    if (!pivot.columns || pivot.columns == null) {
        throw new Error('pivot.columns is required.');
    }

    if (!isArray(pivot.columns)) {
        throw new Error('pivot.columns must be an array of fieldKeys.');
    }

    for (let i = 0; i < pivot.columns.length; i++) {
        pivot.columns[i] = validateFieldKey(pivot.columns[i]);

        if (!pivot.columns[i]) {
            throw new Error('pivot.columns must be an array of fieldKeys.');
        }
    }

    if (!pivot.by || pivot.by == null) {
        throw new Error('pivot.by is required');
    }

    pivot.by = validateFieldKey(pivot.by);

    if (!pivot.by === false) {
        throw new Error('pivot.by must be a fieldKey.');
    }
}

/**
 * @hidden
 * @private
 * @param {string | Array<string> | SchemaKey} key
 * @returns {Array<string>}
 */
function validateSchemaKey(key: string | string[] | SchemaKey): string[] {
    if (key instanceof SchemaKey) {
        return key.getParts();
    }

    if (key instanceof Array) {
        return key;
    }

    if (isString(key)) {
        return SchemaKey.fromString(key).getParts();
    }

    return undefined;
}

/**
 * @hidden
 * @private
 * @param {IGetDataSource} source
 */
function validateSource(source: IGetDataSource): void {
    if (!source || source == null) {
        throw new Error('A source is required for a GetData request.');
    }

    if (!source.type) {
        source.type = 'query';
    }

    if (source.type === 'query') {
        if (!source.queryName || source.queryName == null) {
            throw new Error('A queryName is required for getData requests with type = "query"');
        }
    } else if (source.type === 'sql') {
        if (!source.sql) {
            throw new Error('sql is required if source.type = "sql"');
        }
    } else {
        throw new Error('Unsupported source type.');
    }

    if (!source.schemaName) {
        throw new Error('A schemaName is required.');
    }

    source.schemaName = validateSchemaKey(source.schemaName);

    if (!source.schemaName) {
        throw new Error('schemaName must be a FieldKey');
    }
}

/**
 * @hidden
 * @private
 * @param {ITransform} transform
 */
function validateTransform(transform: ITransform): void {
    // Issue 18138
    if (!transform.type || transform.type !== 'aggregate') {
        transform.type = 'aggregate';
    }

    if (transform.groupBy && transform.groupBy != null) {
        if (!isArray(transform.groupBy)) {
            throw new Error('groupBy must be an array.');
        }
    }

    if (transform.aggregates && transform.aggregates != null) {
        if (!isArray(transform.aggregates)) {
            throw new Error('aggregates must be an array.');
        }

        for (let i = 0; i < transform.aggregates.length; i++) {
            if (!transform.aggregates[i].fieldKey) {
                throw new Error('All aggregates must include a fieldKey.');
            }

            transform.aggregates[i].fieldKey = validateFieldKey(transform.aggregates[i].fieldKey);

            if (!transform.aggregates[i].fieldKey) {
                throw new Error('Aggregate fieldKeys must be valid fieldKeys');
            }

            if (!transform.aggregates[i].type) {
                throw new Error('All aggregates must include a type.');
            }
        }
    }

    if (transform.filters && transform.filters != null) {
        if (!isArray(transform.filters)) {
            throw new Error('The filters of a transform must be an array.');
        }

        for (let i = 0; i < transform.filters.length; i++) {
            transform.filters[i] = validateFilter(transform.filters[i]);
        }
    }
}
