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
import { buildURL } from '../../ActionURL'
import { request } from '../../Ajax'
import { apply, getCallbackWrapper, getOnFailure, getOnSuccess } from '../../Utils'

import { getSuccessCallbackWrapper } from './Utils'

function createValues(json: any): Array<any> {

    if (json && json.success && json.values) {
        return json.values;
    }

    return [];
}

interface IGetValuesOptions {
    failure?: Function
    scope?: any
    success?: Function
}

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
    getValues(options: IGetValuesOptions): void {

        request({
            url: buildURL('visualization', 'getDimensionValues'),
            method: 'GET',
            params: {
                name: this.name,
                queryName: this.queryName,
                schemaName: this.schemaName
            },
            success: getSuccessCallbackWrapper(createValues, getOnSuccess(options), options.scope),
            failure: getCallbackWrapper(getOnFailure(options), options.scope, true /* isErrorCallback */)
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
