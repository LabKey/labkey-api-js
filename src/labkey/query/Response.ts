/*
 * Copyright (c) 2016-2018 LabKey Corporation
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
import { isArray, isFunction } from '../Utils';

import { FieldKey } from '../FieldKey';
import { SchemaKey } from '../SchemaKey';

export interface ResponseColumn {
    align: string;
    dataIndex: string;
    editable: boolean;
    header: string;
    hidden: boolean;
    required: boolean;
    scale: number;
    sortable: boolean;
    width: number;
}

/**
 * @hidden
 * @private
 */
function generateColumnModel(fields: MetadataField[]): ResponseColumn[] {
    const columns = [];

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
            header: fields[i].shortCaption,
        });
    }

    return columns;
}

export type GetDisplayField = () => MetadataField;

/**
 * @hidden
 * @private
 */
function generateGetDisplayField(fieldKey: FieldKey, fields: any[]): GetDisplayField {
    return () => {
        const fieldString = fieldKey.toString();
        for (let i = 0; i < fields.length; i++) {
            if (fieldString === fields[i].fieldKey.toString()) {
                return fields[i];
            }
        }
        return null;
    };
}

export interface MetadataField {
    align?: string;
    autoIncrement: boolean;
    calculated: boolean;
    caption: string;
    defaultValue?: any;
    /** Description of the underlying column */
    description?: string;
    /** Whether this field is a dimension. Data dimensions define logical groupings of measures. */
    dimension: boolean;
    /** If the field has a display field this is the field key for that field. */
    displayField?: FieldKey;
    excelFormat?: string;
    excludeFromShifting?: boolean;
    extFormat?: string;
    extFormatFn?: Function;
    facetingBehaviorType?: string;
    /** FieldKey for this field. */
    fieldKey: FieldKey;
    friendlyType: string;
    /** If the field has a display field this function will return the metadata field object for that field. */
    getDisplayField?: GetDisplayField;
    /** Whether this field is hidden and not normally shown in grid views. */
    hidden: boolean;
    importAliases?: string[];
    inputType?: string;
    jsonType: string;
    keyField: boolean;
    label?: string;
    /**
     * If the field is a lookup, there will be four sub-properties listed under this property:
     * schema, table, displayColumn, and keyColumn, which describe the schema, table, and display
     * column, and key column of the lookup table (query).
     */
    lookup?: any;
    /**
     * Whether this field is a measure.
     * Measures are fields that contain data subject to charting and other analysis.
     */
    measure: boolean;
    mvEnabled: boolean;
    /** The name of the field. */
    name: string;
    nullable: boolean;
    readOnly: boolean;
    recommendedVariable?: boolean;
    scale?: number;
    shortCaption: string;
    /** Whether this field is intended to be shown in details views. */
    shownInDetailsView: boolean;
    /** Whether this field is intended to be shown in insert views. */
    shownInInsertView: boolean;
    /** Whether this field is intended to be shown in lookup views. */
    shownInLookupView: boolean;
    /** Whether this field is intended to be shown in update views. */
    shownInUpdateView: boolean;
    sortable: boolean;
    sqlType?: string;
    tsvFormat?: string;
    /** JavaScript type name of the field. */
    type: string;
    userEditable: boolean;
    width: number;
}

export interface ResponseMetadata {
    /** Description of the underlying query */
    description: string;
    fields: MetadataField[];
    /** Name of the primary key column. */
    id: string;
    importMessage?: string;
    /**
     * An array of templates (label/URL) that should be used as the options for excel upload.
     * Each URL should either point to a static template file or an action to generate the template.
     * If no custom templates have been provided, it will return the default URL.
     */
    importTemplates?: Array<{ label: string; url: string }>;
    /** Name of the property containing rows ("rows"). */
    root: string;
    /** Title of the underlying query */
    title: string;
    /** Name of the top-level property containing the row count ("rowCount") in our case. */
    totalProperty: string;
}

/** The class used to wrap the response object from {@link getRawData}, {@link selectRows}, and {@link executeSql}. */
export class Response {
    columnModel: any;
    formatVersion: number;
    metaData: ResponseMetadata;
    queryName: string;
    rowCount: number;
    rows: Row[];
    schemaKey: SchemaKey;
    schemaName: string;
    [attr: string]: any;

    /**
     * @param rawResponse The raw JSON response object returned from the server when executing {@link getRawData},
     * {@link selectRows}, or {@link executeSql} when requiredVersion is greater than 13.2.
     */
    constructor(rawResponse: any) {
        // Shallow copy the rawResponse
        for (const attr in rawResponse) {
            if (rawResponse.hasOwnProperty(attr)) {
                this[attr] = rawResponse[attr];
            }
        }

        // Wrap the Schema, Lookup, and Field Keys.
        this.schemaKey = SchemaKey.fromParts(rawResponse.schemaName);

        // Metadata optionally available (e.g. if "includeMetadata" is set to false)
        if (rawResponse.metaData?.fields?.length > 0) {
            const fields = rawResponse.metaData.fields;

            for (let i = 0; i < fields.length; i++) {
                const field = Object.assign({}, fields[i]);
                const lookup = field.lookup;

                field.fieldKey = FieldKey.fromParts(field.fieldKey);

                if (lookup && lookup.schemaName) {
                    lookup.schemaName = SchemaKey.fromParts(lookup.schemaName);
                }

                if (field.displayField) {
                    field.displayField = FieldKey.fromParts(field.displayField);
                    field.getDisplayField = generateGetDisplayField(field.displayField, fields);
                }

                this.metaData.fields[i] = field;
            }

            // Generate Column Model
            this.columnModel = generateColumnModel(this.metaData.fields);
        } else {
            this.columnModel = [];
        }

        // Wrap the rows -- may not be in the response (e.g. maxRows: 0)
        if (this.rows !== undefined) {
            for (let i = 0; i < this.rows.length; i++) {
                this.rows[i] = new Row(this.rows[i]);
            }
        } else {
            this.rows = [];
        }
    }

    /**
     * Returns an array of objects that can be used to assist in creating grids.
     */
    getColumnModel(): ResponseColumn[] {
        return this.columnModel;
    }

    /**
     * Gets the metaData object from the response.
     */
    getMetaData(): ResponseMetadata {
        return this.metaData;
    }

    /**
     * Returns the query name from the Response.
     */
    getQueryName(): string {
        return this.queryName;
    }

    /**
     * Get a specific row from the row array.
     * @param idx The index of the row you need.
     */
    getRow(idx: number): Row {
        if (this.rows[idx] !== undefined) {
            return this.rows[idx];
        }

        throw new Error('No row found for index ' + idx);
    }

    /**
     * Gets the row count from the response, which is the total number of rows in the query, not necessarily the number
     * of rows returned. For example, if setting maxRows to 100 on a query that has 5,000 rows, getRowCount will return
     * 5,000, not 100.
     */
    getRowCount(): number {
        return this.rowCount;
    }

    /**
     * Returns the array of row objects.
     */
    getRows(): Row[] {
        return this.rows;
    }

    /**
     * Returns the schema name from the Response.
     * If asString is true it returns a string, otherwise it returns a {@link FieldKey} object.
     */
    getSchemaName(asString?: boolean): string {
        // TODO: Shouldn't this return this.schemaKey when !asString?
        return asString ? this.schemaKey.toString() : this.schemaName;
    }
}

/**
 * The class used to wrap each row object returned from the server during a GetData, executeSql,
 * or selectRows request. Most users will not instantiate these themselves. Instead they will interact with them during
 * the success handler of the API they are using.
 */
export class Row {
    links: any;
    [attr: string]: any;

    /**
     * @see {@link Response}
     * @param rawRow The raw row from a GetData or executeSQL, selectRows (version 13.2 and above) request.
     */
    constructor(rawRow: any) {
        this.links = null;

        if (rawRow.links) {
            this.links = rawRow.links;
        }

        for (const attr in rawRow.data) {
            if (rawRow.data.hasOwnProperty(attr)) {
                this[attr] = rawRow.data[attr];
            }
        }
    }

    /**
     * Gets the requested column from the row. Includes extended values such as display value, URL, etc.
     * When requested version is >16.2, multi-value columns will return an array of objects containing "value" and other properties.
     * In the "17.1" format, "formattedValue" may be included in the response as the column display value formatted with the display column's format or folder format settings.
     * @param columnName The column name requested. Used to do a case-insensitive match to find the column.
     * @returns For the given columnName, returns an object in the common case or an array of objects for multi-value columns.
     * The object will always contain a property named "value" that is the column's value, but it may also contain other properties about that column's value. For
     * example, if the column was setup to track missing value information, it will also contain a property named mvValue
     * (which is the raw value that is considered suspect), and a property named mvIndicator, which will be the string MV
     * indicator (e.g., "Q").
     */
    get(columnName: string): any {
        columnName = columnName.toLowerCase();

        for (const attr in this) {
            if (attr.toLowerCase() === columnName && this.hasOwnProperty(attr) && !isFunction(this[attr])) {
                return this[attr];
            }
        }

        return null;
    }

    /**
     * Gets a specific link type for a row (details, update, etc.).
     * @param linkType The name of the link type to be returned.
     * @returns Returns an object with the display text and link value.
     */
    getLink(linkType: string): any {
        if (this.links && this.links.hasOwnProperty(linkType)) {
            return this.links[linkType];
        }

        return null;
    }

    /**
     * Gets all of the links for a row (details, update, etc.).
     * @returns Returns an object with all of the links types (details, update, etc.) for a row.
     */
    getLinks(): any {
        return this.links;
    }

    /**
     * Gets the simple value for the requested column. Equivalent of doing Row.get(columnName).value.
     * For multi-value columns, the result is an array of values.
     * @param columnName The column name requested. Used to do a case-insensitive match to find the column.
     * @returns Returns the simple value for the given column.
     */
    getValue(columnName: string): any {
        columnName = columnName.toLowerCase();

        for (const attr in this) {
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
