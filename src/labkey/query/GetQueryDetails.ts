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
import { request } from '../Ajax';
import { buildURL } from '../ActionURL';
import { getCallbackWrapper, getOnFailure, getOnSuccess, RequestCallbackOptions } from '../Utils';
import { Container } from '../constants';

import { getMethod } from './Utils';
import { QueryColumn } from './types';

export interface QueryImportTemplate {
    label: string;
    url: string;
}

export interface QueryIndex {
    columns: string[];
    type: string;
}

export interface QueryView {
    analyticsProviders: any[];
    columns: QueryViewColumn[];
    containerFilter: any;
    containerPath: string;
    default: boolean;
    deletable: boolean;
    editable: boolean;
    fields: QueryColumn[];
    filter: QueryViewFilter[];
    hidden: boolean;
    inherit: boolean;
    label: string;
    name: string;
    owner: string;
    revertable: boolean;
    savable: boolean;
    session: boolean;
    shared: boolean;
    sort: QueryViewSort[];
    viewDataUrl: string;
}

export interface QueryViewColumn {
    fieldKey: string;
    key: string;
    name: string;
}

export interface QueryViewFilter {
    fieldKey: string;
    op: string;
    value: string;
}

export interface QueryViewSort {
    dir: string;
    fieldKey: string;
}

// TODO: This interface should overlap more closely with getQueries or at least be a strict
// supserset of getQueries properties for any given query.
export interface QueryDetailsResponse {
    auditHistoryUrl?: string;
    canEdit: boolean;
    canEditSharedViews: boolean;
    columns: QueryColumn[];
    createDefinitionUrl?: string;
    defaultView: { columns: QueryColumn[] };
    description: string;
    editDefinitionUrl: string;
    exception?: string;
    iconURL?: string;
    importMessage?: string;
    importTemplates: QueryImportTemplate[];
    importUrl?: string;
    importUrlDisabled?: boolean;
    indices: { [index: string]: QueryIndex };
    insertUrl?: string;
    insertUrlDisabled?: boolean;
    isInherited: boolean;
    isMetadataOverrideable: boolean;
    isTemporary: boolean;
    isUserDefined: boolean;
    moduleName?: string;
    name: string;
    schemaName: string;
    targetContainers: Container[];
    title: string;
    titleColumn: string;
    viewDataUrl: string;
    views: QueryView[];
    warning?: string;
}

export interface GetQueryDetailsOptions extends RequestCallbackOptions<QueryDetailsResponse> {
    /**
     * A container path in which to execute this command. If not supplied,
     * the current container will be used.
     */
    containerPath?: string;
    /** A field key or Array of field keys to include in the metadata. */
    fields?: string | string[];
    /** When specified the response will only include columns from the specified foreign key query. */
    fk?: string;
    /** Include trigger metadata in the response. */
    includeTriggers?: boolean;
    /** Initialize the view based on the default view iff the view doesn't yet exist. */
    initializeMissingView?: boolean;
    /** Specify the HTTP method to use when making the request. Defaults to GET. */
    method?: 'GET' | 'POST';
    /** The name of the query. */
    queryName: string;
    /** The name of the schema. */
    schemaName: string;
    /**
     * A view name or Array of view names to include custom view details.
     * Use '*' to include all views for the query.
     */
    viewName?: string | string[];
}

/**
 * Returns details about a given query including detailed information about result columns.
 *
 * @returns In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request. In server-side scripts,
 * this method will return the JSON response object (first parameter of the success or failure callbacks).
 */
export function getQueryDetails(options: GetQueryDetailsOptions): XMLHttpRequest {
    const params: any = {};

    if (options.schemaName) {
        params.schemaName = options.schemaName;
    }

    if (options.queryName) {
        params.queryName = options.queryName;
    }

    if (options.viewName != undefined) {
        params.viewName = options.viewName;
    }

    if (options.fields) {
        params.fields = options.fields;
    }

    if (options.fk) {
        params.fk = options.fk;
    }

    if (options.initializeMissingView !== undefined) {
        params.initializeMissingView = options.initializeMissingView;
    }

    if (options.includeTriggers !== undefined) {
        params.includeTriggers = options.includeTriggers;
    }

    return request({
        url: buildURL('query', 'getQueryDetails.api', options.containerPath),
        method: getMethod(options.method),
        success: getCallbackWrapper(getOnSuccess(options), options.scope),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        params,
    });
}
