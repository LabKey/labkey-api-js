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
import { request } from '../Ajax'
import { buildURL } from '../ActionURL'
import { getCallbackWrapper, getOnFailure, getOnSuccess } from '../Utils'

function mapArguments(args: any): ISaveRowsOptions {
    return {
        // These don't make any sense...
        // schemaName: args[0],
        // queryName: args[1],
        // rows: args[2],
        success: args[3],
        failure: args[4]
    };
}

interface ICommand {
    command: 'delete' | 'insert' | 'update',
    extraContext?: any
    rows: Array<any>
}

interface ISaveRowsOptions {
    apiVersion?: string | number
    commands?: Array<ICommand>
    containerPath?: string
    extraContext?: any
    failure?: Function
    scope?: any
    success?: Function
    timeout?: number
    transacted?: boolean
    validateOnly?: boolean
}

/**
 * Save inserts, updates, and/or deletes to potentially multiple tables with a single request.
 */
export function saveRows(options: ISaveRowsOptions): XMLHttpRequest {

    if (arguments.length > 1) {
        options = mapArguments(arguments);
    }

    return request({
        url: buildURL('query', 'saveRows.api', options.containerPath),
        method: 'POST',
        jsonData: {
            apiVersion: options.apiVersion,
            commands: options.commands,
            containerPath: options.containerPath,
            extraContext: options.extraContext,
            transacted: options.transacted === true,
            validateOnly: options.validateOnly === true
        },
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true /* isErrorCallback */),
        timeout: options.timeout
    });
}