/*
 * Copyright (c) 2017 LabKey Corporation
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
import { buildURL } from '../ActionURL'
import { request } from '../Ajax'
import { FieldKey } from '../fieldKey/FieldKey'
import { SchemaKey } from '../fieldKey/SchemaKey'
import { decode, isArray, isFunction, isString } from '../Utils'

import { Response } from './Response'

export interface IGetDataFilter {
    fieldKey: Array<string>
    value?: any
    type: any
}

export interface IGetDataSource {
    containerPath?: string
    queryName?: string
    schemaName?: string | Array<string> | SchemaKey
    sql?: string
    type?: 'query' | 'sql'
}

export interface IGetRawDataOptions {
    source: IGetDataSource
    success: () => any

    // optional
    columns?: Array<string | Array<string> | FieldKey>
    failure?: (json?: any) => any
    includeDetailsColumn?: boolean
    maxRows?: number
    offset?: number
    pivot?: IPivot
    scope?: any
    sort?: Array<ISort>
    transforms?: Array<ITransform>
}

export interface IGetRawDataParams {
    renderer: IRenderer
    source: IGetDataSource
    transforms?: Array<ITransform>
}

export interface IPivot {
    by: string | Array<string> | FieldKey
    columns: Array<string | Array<string> | FieldKey>
}

export interface IRenderer {
    columns?: Array<string | Array<string> | FieldKey>
    includeDetailsColumn?: boolean
    maxRows?: number
    offset?: number
    sort?: Array<ISort>
    type?: string
}

export interface ISort {
    dir?: string
    fieldKey: string | Array<string> | FieldKey
}

export interface ITransform {
    aggregates?: Array<ITransformAggregate>
    filters?: Array<any>
    groupBy?: Array<string | Array<string> | FieldKey>
    type?: string
}

export interface ITransformAggregate {
    fieldKey: string | Array<string> | FieldKey
    type: string
}

export function getRawData(config: IGetRawDataOptions): XMLHttpRequest {

    let jsonData = validateGetDataConfig(config);
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
            }
            else {
                if (response.status != 0) {
                    console.error('Failure occurred during getData', json);
                }
            }
        }
    })
}

function validateGetDataConfig(config: IGetRawDataOptions): IGetRawDataParams {

    if (!config || config === null || config === undefined) {
        throw new Error('A config object is required for GetData requests.');
    }

    const source = config.source;
    validateSource(source);

    let jsonData: IGetRawDataParams = {
        renderer: {},
        // Shallow copy source so if the user adds unexpected properties to source the server doesn't throw errors.
        source: {
            schemaName: source.schemaName,
            type: source.type
        }
    };

    if (source.type === 'query') {
        jsonData.source.queryName = source.queryName;
    }
    else if (source.type === 'sql') {
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
        if (!isArray(config.sort)){
            throw new Error('sort must be an array.');
        }

        for (let i = 0; i < config.sort.length; i++) {
            if (!config.sort[i].fieldKey) {
                throw new Error("Each sort must specify a field key.");
            }

            config.sort[i].fieldKey = validateFieldKey(config.sort[i].fieldKey);

            if (!config.sort[i].fieldKey) {
                throw new Error("Invalid field key specified for sort.");
            }

            if (config.sort[i].dir) {
                config.sort[i].dir = config.sort[i].dir.toUpperCase();
            }
        }

        jsonData.renderer.sort = config.sort;
    }

    return jsonData;
}

function validateFieldKey(key: string | Array<string> | FieldKey): Array<string> {
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
            value: filter.getValue()
        };
    }

    //If filter isn't a LABKEY.Query.Filter or LABKEY.Filter, then it's probably a raw object.
    if (filter.fieldKey) {
        filter.fieldKey = validateFieldKey(filter.fieldKey);
    }
    else {
        throw new Error('All filters must have a "fieldKey" attribute.');
    }

    if (!filter.fieldKey) {
        throw new Error("Filter fieldKeys must be valid FieldKeys");
    }

    if (!filter.type) {
        throw new Error('All filters must have a "type" attribute.');
    }
    return filter;
}

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

function validateSchemaKey(key: string | Array<string> | SchemaKey): Array<string> {
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
    }
    else if (source.type === 'sql') {
        if (!source.sql) {
            throw new Error('sql is required if source.type = "sql"');
        }
    }
    else {
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