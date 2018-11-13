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
import { create as createDomain, CreateDomainOptions } from './Domain'

export interface ICreateOptions {
    domainDesign: any
    keyName: string
    keyType?: string
    kind?: string
    options?: any
}

/**
 * Create a new list.
 * A primary key column must be specified with the properties 'keyName' and 'keyType'. If the key is not
 * provided in the domain design's array of fields, it will be automatically added to the domain.
 * @param config
 */
export function create(config: ICreateOptions) {
    
    let domainOptions: CreateDomainOptions = {
        domainDesign: config,
        options: {}
    };
    
    if (!domainOptions.domainDesign.name) {
        throw new Error('List name required');
    }
    
    if (!config.kind) {
        if (config.keyType == 'int') {
            config.kind = 'IntList';
        }
        else if (config.keyType == 'string') {
            config.kind = 'VarList';
        }
    }

    if (config.kind != 'IntList' && config.kind != 'VarList') {
        throw new Error('Domain kind or keyType required');
    }
    domainOptions.kind = config.kind;

    if (!config.keyName) {
        throw new Error('List keyName required');
    }
    domainOptions.options.keyName = config.keyName;
    
    createDomain(domainOptions);
}