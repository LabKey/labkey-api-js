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
import { apply, getCallbackWrapper, getOnFailure, getOnSuccess, RequestCallbackOptions } from '../../Utils';

function createValues(json: any): any[] {
    if (json && json.success && json.values) {
        return json.values;
    }

    return [];
}

/**
 * @namespace Dimension's are data elements (columns) on which {@link Measure} objects
 * can be pivoted or transformed. For example, the 'Analyte Name' dimension may be used to pivot a single 'Result' measure
 * into one series per Analyte.
 */
export class Dimension {
    description: string;
    _isUserDefined: boolean;
    label: string;
    name: string;
    queryName: string;
    schemaName: string;
    type: string;

    constructor(config: any) {
        if (config && config.hasOwnProperty('isUserDefined')) {
            this._isUserDefined = config['isUserDefined'];
        }
        apply(this, config);
    }

    /**
     * Returns a description of this dimension.
     * @returns {string}
     */
    getDescription(): string {
        return this.description;
    }

    /**
     * Returns the label of this dimension.
     * @returns {string}
     */
    getLabel(): string {
        return this.label;
    }

    /**
     * Returns the column name of this dimension.
     * @returns {string}
     */
    getName(): string {
        return this.name;
    }

    /**
     * Returns the name of the query associated with this dimension.
     * @returns {string}
     */
    getQueryName(): string {
        return this.queryName;
    }

    /**
     * Returns the name of the schema associated with this dimension.
     * @returns {string}
     */
    getSchemaName(): string {
        return this.schemaName;
    }

    /**
     * Returns the data types of this dimension.
     * @returns {string}
     */
    getType(): string {
        return this.type;
    }

    /**
     * Returns the set of available unique values for this dimension.
     */
    getValues(options: RequestCallbackOptions<Array<{ value: any }>>): XMLHttpRequest {
        return request({
            url: buildURL('visualization', 'getDimensionValues.api'),
            params: {
                name: this.name,
                queryName: this.queryName,
                schemaName: this.schemaName,
            },
            success: getCallbackWrapper(getOnSuccess(options), options.scope, false, createValues),
            failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        });
    }

    /**
     * Returns whether this dimension is part of a user-defined query (versus a built-in/system-provided query).
     * @returns {boolean}
     */
    isUserDefined(): boolean {
        return this._isUserDefined;
    }
}
