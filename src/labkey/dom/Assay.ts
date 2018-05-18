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
import { getCallbackWrapper, getOnFailure, getOnSuccess, isObject } from '../Utils'

import { FormWindow } from './constants'

declare let window: FormWindow;

interface IImportRunOptions {
    assayId?: number
    batchId?: number
    batchProperties?: any
    comment?: string
    comments?: string
    containerPath?: string
    dataRows?: Array<any>
    failure?: Function
    files: Array<any>
    name?: string
    properties?: any
    runFilePath?: string
    scope?: any
    success: Function
}

export function importRun(options: IImportRunOptions): void {

    if (!window.FormData) {
        throw new Error('modern browser required');
    }
    
    if (!options.assayId) {
        throw new Error('assayId required');
    }

    let files = [];
    if (options.files) {
        for (let i = 0; i < options.files.length; i++) {
            let f = options.files[i];
            if (f instanceof window.File) {
                files.push(f);
            }
            else if (f.tagName == 'INPUT') {
                for (let j = 0; j < f.files.length; j++) {
                    files.push(f.files[j]);
                }
            }
        }
    }

    if (files.length === 0 && !options.runFilePath && !options.dataRows) {
        throw new Error('At least one of "file", "runFilePath", or "dataRows" is required');
    }

    if ((files.length > 0 ? 1 : 0) + (options.runFilePath ? 1 : 0) + (options.dataRows ? 1 : 0) > 1) {
        throw new Error('Only one of "file", "runFilePath", or "dataRows" is allowed');
    }

    let formData = new FormData();
    formData.append('assayId', options.assayId as any);
    formData.append('name', options.name);
    formData.append('comment', options.comment);

    if (options.batchId) {
        formData.append('batchId', options.batchId as any);
    }

    if (options.properties) {
        for (let key in options.properties) {
            if (options.properties.hasOwnProperty(key)) {
                if (isObject(options.properties[key])) {
                    formData.append("properties['" + key + "']", JSON.stringify(options.properties[key]));
                }
                else {
                    formData.append("properties['" + key + "']", options.properties[key]);
                }
            }
        }
    }

    if (options.batchProperties) {
        for (let key in options.batchProperties) {
            if (options.batchProperties.hasOwnProperty(key)) {
                if (isObject(options.batchProperties[key])) {
                    formData.append("batchProperties['" + key + "']", JSON.stringify(options.batchProperties[key]));
                }
                else {
                    formData.append("batchProperties['" + key + "']", options.batchProperties[key]);
                }
            }
        }
    }

    if (options.dataRows) {
        formData.append('dataRows', JSON.stringify(options.dataRows));
    }

    if (options.runFilePath) {
        formData.append('runFilePath', options.runFilePath);
    }

    if (files && files.length > 0) {
        formData.append('file', files[0]);
        for (let i = 0; i < files.length; i++) {
            formData.append('file' + i, files[i]);
        }
    }

    request({
        url: buildURL('assay', 'importRun.api', options.containerPath),
        method: 'POST',
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true /* isErrorCallback */),
        form: formData
    });
}