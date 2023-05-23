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
import { create as createDomain, CreateDomainOptions, DomainDesign } from './Domain';

// The configuration options intermix the DomainDesign configuration with the CreateDomainOptions.
// This can be very confusing, so we've limited the scope of which domain design configuration options are supported.
// Users can specify all available DomainDesign configuration options by specifying `domainDesign` explicitly.
export type DomainDesignOptions = Pick<DomainDesign, 'description' | 'fields' | 'indices' | 'name'>;

export interface ListCreateOptions extends DomainDesignOptions, CreateDomainOptions {
    /**
     * @deprecated Use `options.keyName` instead.
     * The name of the key column. The `options.keyName` takes precedence if both are specified.
     */
    keyName?: string;
    /**
     * @deprecated Use `kind` instead.
     * The type of the key column. Can be `IntList`, `VarList`, or `AutoIncrementInteger`.
     * The `kind` takes precedence if both are specified.
     * Note: If the `AutoIncrementInteger` configuration is desired and you're specifying `kind` then the
     * `kind` should be set to `IntList` and the `options.keyType` should be set to `AutoIncrementInteger`.
     */
    keyType?: string;
}

/**
 * Create a new List.
 * Lists support three types of primary key configurations; `IntList`, `VarList`, or `AutoIncrementInteger`.
 * These key configurations determine what "kind" of List is created.
 * If the key field configuration is not provided in the domain design's array of fields,
 * it will be automatically added to the domain.
 * Note: If a `domainDesign` is specified then it's configuration will take precedence over other `DomainDesign`
 * properties that are specified.
 *
 * ```
 *  // Creates a List with a string primary key.
 *  LABKEY.List.create({
 *      fields: [{
 *          name: 'partCode', rangeURI: 'string',
 *      },{
 *          name: 'manufacturer', rangeURI: 'string',
 *      },{
 *          name: 'purchaseDate', rangeURI: 'date',
 *      }],
 *      kind: 'VarList',
 *      name: 'Parts',
 *      options: {
 *          keyName: 'partCode',
 *          keyType: 'Varchar',
 *      }
 *  });
 *
 *  // Creates a List with an auto-incrementing primary key.
 *  LABKEY.List.create({
 *      description: 'teams in the league',
 *      kind: 'IntList',
 *      fields: [{
 *          name: 'rowId', rangeURI: 'int',
 *      },{
 *          name: 'name', rangeURI: 'string', required: true,
 *      },{
 *          name: 'slogan', rangeURI: 'multiLine',
 *      },{
 *          name: 'logo', rangeURI: 'Attachment',
 *      }],
 *      name: 'Teams',
 *      options: {
 *          keyName: 'rowId',
 *          keyType: 'AutoIncrementInteger',
 *      }
 *  });
 * ```
 */
export function create(config: ListCreateOptions) {
    // Separate out `ListCreateOptions` configuration
    const { keyName, keyType, ...options } = config;

    // Separate out `DomainDesignOptions` configuration
    const { description, fields, indices, name, ...createDomainOptions } = options;

    const domainOptions: CreateDomainOptions = {
        ...createDomainOptions,
        options: createDomainOptions.options ?? {},
    };

    // If a `domainDesign` is not explicitly provided then fallback to `DomainDesignOptions` options
    if (!domainOptions.domainDesign) {
        domainOptions.domainDesign = { description, fields, indices, name };
    }

    if (!domainOptions.domainDesign.name) {
        throw new Error('List name required');
    }

    // Handle `keyType` only if `kind` is not specified
    if (!domainOptions.kind) {
        if (keyType === 'int' || keyType === 'IntList') {
            domainOptions.kind = 'IntList';
        } else if (keyType === 'string' || keyType === 'VarList') {
            domainOptions.kind = 'VarList';
            domainOptions.options.keyType = 'Varchar';
        } else if (keyType === 'AutoIncrementInteger') {
            domainOptions.kind = 'IntList';
            domainOptions.options.keyType = 'AutoIncrementInteger';
        } else {
            throw new Error('List kind or keyType required');
        }
    }

    // Handle `keyName` only if `options.keyName` is not specified
    if (!domainOptions.options.keyName) {
        if (keyName) {
            domainOptions.options.keyName = keyName;
        } else {
            throw new Error('List keyName or options.keyName required');
        }
    }

    createDomain(domainOptions);
}
