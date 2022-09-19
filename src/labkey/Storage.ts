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

export interface StorageCommandResponse {
    /** Data object with the key/value pairs from the storage item in the given command */
    data?: Record<string, any>;
    /** Success message from the response */
    message?: string;
    /** Boolean indicating if the command was successful */
    success: boolean;
}

export interface IStorageCommandOptions extends RequestCallbackOptions<StorageCommandResponse> {
    /** The container path in which to execute the command. */
    containerPath?: string;
    /** The specific set of props will differ for each storage item type:
     * - Physical Location: name, description, locationId (rowId of the parent Physical Location)
     * - Freezer: name, description, locationId (rowId of the parent Physical Location), manufacturer, freezerModel, temperature, temperatureUnits, serialNumber, sensorName, lossRate, status
     * - Shelf/Rack/Canister: name, description, locationId (rowId of the parent freezer or Shelf/Rack/Canister)
     * - Storage Unit Type: name, description, unitType (one of the following: "Box", "Plate", "Bag", "Cane", "Tube Rack"), rows, cols (required if positionFormat is not "Num"), positionFormat (one of the following: "Num", "AlphaNum", "AlphaAlpha", "NumAlpha", "NumNum"), positionOrder (one of the following: "RowColumn", "ColumnRow")
     * - Terminal Storage Location: name, description, typeId (rowId of the Storage Unit Type), locationId (rowId of the parent freezer or Shelf/Rack/Canister)
     */
    props: Record<string, any>;
    /** Storage items can be of the following types: Physical Location, Freezer, Shelf, Rack, Canister, Storage Unit Type, or Terminal Storage Location. */
    type: STORAGE_TYPES;
}

/**
 * Create a new LabKey Freezer Manager storage item that can be used in the creation of a freezer hierarchy.
 * Freezer hierarchies consist of a top level Freezer, which can have any combination of child non-terminal
 * storage locations (i.e. those that do not directly contain samples but can contain other units) and terminal
 * storage locations (i.e. units in the freezer that directly contain samples and cannot contain other units).
 * See the <a href="https://www.labkey.org/SampleManagerHelp/wiki-page.view?name=createFreezer">LabKey Documentation</a> for further details.
 *
 * A freezer may also have a parent hierarchy, which defines the physical location of the freezer.
 * See the <a href="https://www.labkey.org/SampleManagerHelp/wiki-page.view?name=freezerLocation">LabKey Documentation</a> for further details.
 *
 * ```js
 * // Create a freezer with two shelves
 * LABKEY.Storage.createStorageItem({
 *      type: 'Freezer',
 *      props: {
 *          name: 'Freezer #1',
 *          description: 'Test freezer from API',
 *          serialNumber: 'ABC123',
 *          status: 'Active'
 *      },
 *      success: function(response) {
 *          console.log(response);
 *          var freezerRowId = response.data.rowId;
 *
 *          LABKEY.Storage.createStorageItem({
 *              type: 'Shelf',
 *              props: {
 *                  name: 'Shelf #1',
 *                  description: 'This shelf is for samples from Lab A.',
 *                  locationId: freezerRowId
 *              },
 *              success: function(response) {
 *                  console.log(response);
 *              }
 *          });
 *
 *          LABKEY.Storage.createStorageItem({
 *              type: 'Shelf',
 *              props: {
 *                  name: 'Shelf #2',
 *                  description: 'This shelf is for samples from Lab B.',
 *                  locationId: freezerRowId
 *              },
 *              success: function(response) {
 *                  console.log(response);
 *              }
 *          });
 *      }
 * });
 * ```
 *
 * ```js
 * // Create a terminal storage location in the freezer
 * LABKEY.Storage.createStorageItem({
 *      type: 'Storage Unit Type',
 *      props: {
 *          name: '10 X 10 Box',
 *          unitType: 'Box',
 *          rows: 10,
 *          cols: 10
 *      },
 *      success: function(response) {
 *          console.log(response);
 *          var boxTypeId = response.data.rowId;
 *
 *          LABKEY.Storage.createStorageItem({
 *              type: 'Terminal Storage Location',
 *              props: {
 *                  name: 'Box #1',
 *                  typeId: boxTypeId,
 *                  locationId: 8088, // rowId of Shelf #2
 *              },
 *              success: function(response) {
 *                  console.log(response);
 *              }
 *          });
 *      }
 * });
 * ```
 */
export function createStorageItem(config: IStorageCommandOptions): XMLHttpRequest {
    return request({
        url: buildURL('storage', 'create.api', config.containerPath),
        method: 'POST',
        jsonData: {
            type: config.type,
            props: config.props,
        },
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
    });
}

/**
 * Update an existing LabKey Freezer Manager storage item to change its properties or location within the freezer hierarchy.
 * For the UpdateCommand, the "rowId" primary key value is required to be set within the props.
 *
 * ```js
 * // Update the properties of a freezer
 * LABKEY.Storage.updateStorageItem({
 *      type: 'Freezer',
 *      props: {
 *          rowId: 8087,
 *          description: 'Updated freezer from API',
 *          status: 'Defrosting'
 *      },
 *      success: function(response) {
 *          console.log(response);
 *      }
 * });
 * ```
 *
 * ```js
 * // Update the location of a box in the freezer
 * LABKEY.Storage.updateStorageItem({
 *      type: 'Terminal Storage Location',
 *      props: {
 *          rowId: 19382,
 *          locationId: 8089 // move Box #1 from Shelf #1 to Shelf #2
 *      },
 *      success: function(response) {
 *          console.log(response);
 *      }
 * });
 * ```
 */
export function updateStorageItem(config: IStorageCommandOptions): XMLHttpRequest {
    return request({
        url: buildURL('storage', 'update.api', config.containerPath),
        method: 'POST',
        jsonData: {
            type: config.type,
            props: config.props,
        },
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
    });
}

export interface DeleteStorageCommandOptions extends IStorageCommandOptions {
    /** the "rowId" primary key value for the storage item/row to be deleted */
    rowId: number;
}

/**
 * Delete an existing LabKey Freezer Manager storage item. Note that deletion of freezers or locations within the
 * freezer hierarchy will cascade the delete down the hierarchy to remove child locations and terminal storage locations.
 * Samples in the deleted freezer location(s) will not be deleted but will be removed from storage.
 *
 * ```js
 * // Delete the freezer, which will delete the full hierarchy of non-terminal and terminal storage locations
 * LABKEY.Storage.deleteStorageItem({
 *      type: 'Freezer',
 *      rowId: 8087,
 *      success: function(response) {
 *          console.log(response);
 *      }
 * });
 * ```
 */
export function deleteStorageItem(config: DeleteStorageCommandOptions): XMLHttpRequest {
    return request({
        url: buildURL('storage', 'delete.api', config.containerPath),
        method: 'POST',
        jsonData: {
            type: config.type,
            props: { rowId: config.rowId },
        },
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true),
    });
}

enum STORAGE_TYPES {
    PhysicalLocation = 'Physical Location',
    Freezer = 'Freezer',
    Shelf = 'Shelf',
    Rack = 'Rack',
    Canister = 'Canister',
    StorageUnitType = 'Storage Unit Type',
    TerminalStorageLocation = 'Terminal Storage Location',
}
