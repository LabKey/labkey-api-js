/*
 * Copyright (c) 2018 LabKey Corporation
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
export interface IExpObject {
    /**
     * User editable comment.
     */
    comment: string

    /**
     * When the ExpObject was created.
     */
    created: Date

    /**
     * The person who created the ExpObject.
     */
    createdBy: string

    /**
     * The id of the ExpObject
     */
    id: number

    /**
     * The LSID of the ExpObject
     */
    lsid: string

    /**
     * When the ExpObject was last modified.
     */
    modified: Date

    /**
     * The person who last modified the ExpObject.
     */
    modifiedBy: string

    /**
     * The name of the ExpObject
     */
    name: string

    /**
     * Map of property descriptor names to values. Most types, such as strings and
     * numbers, are just stored as simple properties. Properties of type FileLink will be returned by the server in the
     * same format as [[Data]] objects (missing many properties such as id and createdBy if they exist on disk
     * but have no row with metadata in the database). FileLink values are accepted from the client in the same way,
     * or a simple value of the following three types: the data's RowId, the data's LSID, or the full path
     * on the server's file system.
     */
    properties: {[key: string]: any}

    /**
     * The id of the ExpObject (alias of id property)
     */
    rowId: number
}

export class ExpObject implements IExpObject {

    comment: string;
    created: Date;
    createdBy: string;
    id: number;
    lsid: string;
    modified: Date;
    modifiedBy: string;
    name: string;
    properties: {[key: string]: any};
    rowId: number;

    constructor(options: Partial<IExpObject>) {
        options = options || {};
        this.lsid = options.lsid;
        this.name = options.name;
        this.id = options.id || options.rowId;
        this.rowId = this.id;
        this.comment = options.comment;
        this.created = options.created;
        this.createdBy = options.createdBy;
        this.modified = options.modified;
        this.modifiedBy = options.modifiedBy;
        this.properties = options.properties || {};
    }

    getSomething(): number {
        return this.rowId;
    }
}

export class RunGroup extends ExpObject {

    constructor(options: any) {
        super(options);
    }
}