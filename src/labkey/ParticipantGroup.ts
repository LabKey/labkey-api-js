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
import { buildURL } from './ActionURL'
import { request } from './Ajax'
import { getCallbackWrapper } from './Utils'

export interface IUpdateParticipantGroupOptions {
    // required
    /** The integer ID of the desired participant group */
    rowId: number

    // optional
    /** The container path in which the relevant study is defined. If not supplied, the current container path will be used.*/
    containerPath?: string
    /** Set of IDs to be removed from the group if they are already members */
    deleteParticipantIds?: Array<string>
    /** The new value for the description of the group */
    description?: string
    /** Set of IDs to be added to the group if they are not already members */
    ensureParticipantIds?: Array<string>
    failure?: () => any
    filters?: any
    /** The new value for the label of the group */
    label?: string
    method?: string
    /** Set of IDs to be members of the group */
    participantIds?: Array<string>
    success?: (group?: any) => any
}

/**
 * Updates an existing participant group, already saved and accessible to the current user on the server.
 */
export function updateParticipantGroup(config: IUpdateParticipantGroupOptions): void {

    let jsonData: IUpdateParticipantGroupOptions = {
        rowId: config.rowId
    };

    if (config.participantIds) {
        jsonData.participantIds = config.participantIds;
    }
    if (config.ensureParticipantIds) {
        jsonData.ensureParticipantIds = config.ensureParticipantIds;
    }
    if (config.deleteParticipantIds) {
        jsonData.deleteParticipantIds = config.deleteParticipantIds;
    }
    if (config.label) {
        jsonData.label = config.label;
    }
    if (config.description) {
        jsonData.description = config.description;
    }
    if (config.filters) {
        jsonData.filters = config.filters;
    }

    request({
        url: buildURL('participant-group', 'updateParticipantGroup.api', config.containerPath),
        method: config.method || 'POST',
        jsonData,
        success: getCallbackWrapper(function(data: any) {
            config.success(data.group);
        }, this),
        failure: getCallbackWrapper(config.failure, this, true)
    });
}