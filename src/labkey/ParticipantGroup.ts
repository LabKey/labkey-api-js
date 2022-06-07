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
import { buildURL } from './ActionURL';
import { request } from './Ajax';
import { getCallbackWrapper, getOnFailure, getOnSuccess, RequestCallbackOptions } from './Utils';

export interface UpdateParticipantGroupOptions extends RequestCallbackOptions {
    /**
     * The container path in which the relevant study is defined.
     * If not supplied, the current container path will be used.
     */
    containerPath?: string;
    /** Set of IDs to be removed from the group if they are already members */
    deleteParticipantIds?: string[];
    /** The new value for the description of the group */
    description?: string;
    /** Set of IDs to be added to the group if they are not already members */
    ensureParticipantIds?: string[];
    filters?: any;
    /** The new value for the label of the group */
    label?: string;
    /** Set of IDs to be members of the group */
    participantIds?: string[];
    /** The integer ID of the desired participant group */
    rowId: number;
}

/**
 * Updates an existing participant group, already saved and accessible to the current user on the server.
 */
export function updateParticipantGroup(options: UpdateParticipantGroupOptions): XMLHttpRequest {
    const jsonData: any = {
        rowId: options.rowId,
    };

    if (options.participantIds) {
        jsonData.participantIds = options.participantIds;
    }
    if (options.ensureParticipantIds) {
        jsonData.ensureParticipantIds = options.ensureParticipantIds;
    }
    if (options.deleteParticipantIds) {
        jsonData.deleteParticipantIds = options.deleteParticipantIds;
    }
    if (options.label) {
        jsonData.label = options.label;
    }
    if (options.description) {
        jsonData.description = options.description;
    }
    if (options.filters) {
        jsonData.filters = options.filters;
    }

    return request({
        url: buildURL('participant-group', 'updateParticipantGroup.api', options.containerPath),
        method: 'POST',
        jsonData,
        success: getCallbackWrapper(getOnSuccess(options), options.scope, false, data => data.group),
        failure: getCallbackWrapper(getOnFailure(options), this, true),
    });
}
