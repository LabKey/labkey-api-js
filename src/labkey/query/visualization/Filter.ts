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

export interface ICreateOptions {
    queryName?: string
    queryType?: TQueryType
    schemaName: string
}

/**
 * Creates a new filter object for use in getMeasures().
 */
export function create(options: ICreateOptions): string {
    if (!options.schemaName) {
        throw new Error('You must supply a value for schemaName in your configuration object!');
    }

    let params = [
        options.schemaName,
        options.queryName ? options.queryName : '~'
    ];

    if (options.queryType) {
        params.push(options.queryType);
    }

    return params.join('|');
}

export type TQueryType = 'ALL' | 'BUILT_IN' | 'CUSTOM' | 'DATASETS';

/**
 * Visualization Possible query types for measure filters.
 */
export const QueryType: {
    [key: string]: string
} = {
    /** Return only queries that are built-in to the server */
    BUILT_IN : 'builtIn',
    /** Return only queries that are custom (user defined) */
    CUSTOM : 'custom',
    /** Return only datasets */
    DATASETS : 'datasets',
    /** Return all queries (both built-in and custom) */
    ALL : 'all'
};