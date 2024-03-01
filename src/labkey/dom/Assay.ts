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
import { getCallbackWrapper, getOnFailure, getOnSuccess, isObject, RequestCallbackOptions } from '../Utils';

export interface ImportRunOptions extends RequestCallbackOptions {
    allowCrossRunFileInputs?: boolean;
    allowLookupByAlternateKey?: boolean;
    assayId?: number | string;
    auditUserComment?: string;
    batchId?: number | string;
    batchProperties?: any;
    comment?: string;
    comments?: string;
    containerPath?: string;
    dataRows?: any[];
    files?: any[];
    forceAsync?: boolean;
    jobDescription?: string;
    jobNotificationProvider?: string;
    name?: string;
    plateMetadata?: any;
    properties?: any;
    reRunId?: number | string;
    runFilePath?: string;
    saveDataAsFile?: boolean;
    workflowTask?: number;
}

export function importRun(options: ImportRunOptions): XMLHttpRequest {
    if (!FormData) {
        throw new Error('modern browser required');
    }

    if (!options.assayId) {
        throw new Error('assayId required');
    }

    const files = [];
    if (options.files) {
        for (let i = 0; i < options.files.length; i++) {
            const f = options.files[i];
            if (f instanceof File) {
                files.push(f);
            } else if (f.tagName == 'INPUT') {
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

    const formData = new FormData();
    formData.append('assayId', options.assayId as any);
    if (options.name) {
        formData.append('name', options.name);
    }
    if (options.comment) {
        formData.append('comment', options.comment);
    }
    if (options.batchId) {
        formData.append('batchId', options.batchId as any);
    }
    if (options.reRunId) {
        formData.append('reRunId', options.reRunId as string);
    }
    if (options.saveDataAsFile !== undefined) {
        formData.append('saveDataAsFile', options.saveDataAsFile ? 'true' : 'false');
    }
    if (options.jobDescription) {
        formData.append('jobDescription', options.jobDescription);
    }
    if (options.jobNotificationProvider) {
        formData.append('jobNotificationProvider', options.jobNotificationProvider);
    }
    if (options.forceAsync !== undefined) {
        formData.append('forceAsync', options.forceAsync ? 'true' : 'false');
    }
    if (options.allowCrossRunFileInputs !== undefined) {
        formData.append('allowCrossRunFileInputs', options.allowCrossRunFileInputs ? 'true' : 'false');
    }
    if (options.workflowTask !== undefined) {
        formData.append('workflowTask', options.workflowTask.toString(10));
    }
    if (options.allowLookupByAlternateKey !== undefined) {
        formData.append('allowLookupByAlternateKey', options.allowLookupByAlternateKey ? 'true' : 'false');
    }
    if (options.auditUserComment !== undefined) {
        formData.append('auditUserComment', options.auditUserComment);
    }

    if (options.properties) {
        for (const [key, value] of Object.entries(options.properties)) {
            if (isObject(value)) {
                formData.append(`properties['${key}']`, JSON.stringify(value));
            } else {
                formData.append(`properties['${key}']`, options.properties[key]);
            }
        }
    }

    if (options.batchProperties) {
        for (const [key, value] of Object.entries(options.batchProperties)) {
            if (isObject(value)) {
                formData.append(`batchProperties['${key}']`, JSON.stringify(value));
            } else {
                formData.append(`batchProperties['${key}']`, options.batchProperties[key]);
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

    if (options.plateMetadata) {
        formData.append('plateMetadata', JSON.stringify(options.plateMetadata));
    }

    return request({
        url: buildURL('assay', 'importRun.api', options.containerPath),
        method: 'POST',
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        form: formData,
    });
}
