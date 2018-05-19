/*
 * Copyright (c) 2016-2017 LabKey Corporation
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
import { isArray, isDefined, isFunction } from '../Utils'

import { FieldKey } from '../fieldKey/FieldKey'
import { SchemaKey } from '../fieldKey/SchemaKey'

interface ExtRoot {
    Ext?: any
    Ext4?: any
}

declare type ExtWindow = Window & ExtRoot;

declare const window: ExtWindow;

function generateColumnModel(fields: Array<any>): Array<any> {
    let columns = [];

    for (let i = 0; i < fields.length; i++) {
        columns.push({
            scale: fields[i].scale,
            hidden: fields[i].hidden,
            sortable: fields[i].sortable,
            align: fields[i].align,
            width: fields[i].width,
            dataIndex: fields[i].fieldKey.toString(),
            required: fields[i].nullable, // Not sure if this is correct.
            editable: fields[i].userEditable,
            header: fields[i].shortCaption
        })
    }

    return columns;
}

function generateGetDisplayField(fieldKey: FieldKey, fields: Array<any>): Function {
    return () => {
        const fieldString = fieldKey.toString();
        for (let i = 0; i < fields.length; i++) {
            if (fieldString === fields[i].fieldKey.toString()) {
                return fields[i];
            }
        }
        return null;
    }
}

export class Response {
    columnModel: any;
    formatVersion: number;
    metaData: any;
    queryName: string;
    rowCount: number;
    rows: Array<Row>;
    schemaKey: SchemaKey;
    schemaName: string;
    [attr:string]: any;

    constructor(rawResponse: any) {

        // Shallow copy the rawResponse
        for (let attr in rawResponse) {
            if (rawResponse.hasOwnProperty(attr)) {
                this[attr] = rawResponse[attr];
            }
        }

        // Wrap the Schema, Lookup, and Field Keys.
        this.schemaKey = SchemaKey.fromParts(rawResponse.schemaName);

        const fields = rawResponse.metaData.fields;

        for (let i=0; i < fields.length; i++) {
            let field = Object.assign({}, fields[i]);
            const lookup = field.lookup;

            field.fieldKey = FieldKey.fromParts(field.fieldKey);

            if (lookup && lookup.schemaName) {
                lookup.schemaName = SchemaKey.fromParts(lookup.schemaName);
            }

            if (field.displayField) {
                field.displayField = FieldKey.fromParts(field.displayField);
                field.getDisplayField = generateGetDisplayField(field.displayField, fields);
            }

            // Only parse the 'extFormatFn' if ExtJS is present
            // checking to see if the fn ExtJS version and the window ExtJS version match
            if (field.extFormatFn) {
                const ext4Index = field.extFormatFn.indexOf('Ext4.'),
                      isExt4Fn = ext4Index === 0 || ext4Index === 1,
                      canEvalExt3 = !isExt4Fn && window && isDefined(window.Ext),
                      canEvalExt4 = isExt4Fn && window && isDefined(window.Ext4);

                if (canEvalExt3 || canEvalExt4) {
                    field.extFormatFn = eval(field.extFormatFn);
                }
            }

            this.metaData.fields[i] = field;
        }

        // Generate Column Model
        this.columnModel = generateColumnModel(this.metaData.fields);

        // Wrap the rows -- may not be in the response (e.g. maxRows: 0)
        if (this.rows !== undefined) {
            for (let i = 0; i < this.rows.length; i++) {
                this.rows[i] = new Row(this.rows[i]);
            }
        }
        else {
            this.rows = [];
        }
    }

    getColumnModel(): any {
        return this.columnModel;
    }

    getMetaData(): any {
        return this.metaData;
    }

    getQueryName(): string {
        return this.queryName;
    }

    getRow(idx: number): Row {
        if (this.rows[idx] !== undefined) {
            return this.rows[idx];
        }

        throw new Error('No row found for index ' + idx);
    }

    getRowCount(): number {
        return this.rowCount;
    }

    getRows(): Array<Row> {
        return this.rows;
    }

    getSchemaName(asString?: boolean): string {
        // TODO: Shouldn't this return this.schemaKey when !asString?
        return asString ? this.schemaKey.toString() : this.schemaName;
    }
}

export class Row {
    links: any;
    [attr:string]: any;

    constructor(rawRow: any) {
        this.links = null;

        if (rawRow.links) {
            this.links = rawRow.links;
        }

        for (let attr in rawRow.data) {
            if (rawRow.data.hasOwnProperty(attr)) {
                this[attr] = rawRow.data[attr];
            }
        }
    }

    get(columnName: string): any {
        columnName = columnName.toLowerCase();

        for (let attr in this) {
            if (attr.toLowerCase() === columnName && this.hasOwnProperty(attr) && !isFunction(this[attr])) {
                return this[attr];
            }
        }

        return null;
    }

    getLink(linkType: string): any {
        if (this.links && this.links.hasOwnProperty(linkType)) {
            return this.links[linkType];
        }

        return null;
    }

    getLinks(): any {
        return this.links;
    }

    getValue(columnName: string): any {
        columnName = columnName.toLowerCase();

        for (let attr in this) {
            if (attr.toLowerCase() === columnName && this.hasOwnProperty(attr) && !isFunction(this[attr])) {
                if (isArray(this[attr])) {
                    return this[attr].map((i: any) => i.value);
                }
                if (this[attr].hasOwnProperty('value')) {
                    return this[attr].value;
                }
            }
        }

        return null;
    }
}