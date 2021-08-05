/*
 * Copyright (c) 2020 LabKey Corporation
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
export interface QueryColumn {
    autoIncrement: boolean
    align: string
    calculated: boolean
    caption: string
    cols?: number
    conceptURI: string
    crosstabColumnDimension?: any
    crosstabColumnMember?: any
    defaultScale: string
    defaultValue?: any
    description?: string
    dimension: boolean
    displayField?: string
    displayFieldSqlType?: string
    displayFieldJsonType?: string
    excelFormat?: string
    excludeFromShifting: boolean
    ext?: any
    extFormat?: string
    extFormatFn?: string
    facetingBehaviorType: string
    fieldKey: string
    fieldKeyArray: string[]
    fieldKeyPath: string
    friendlyType: string
    hidden: boolean
    importAliases?: string[]
    inputType: string
    isAutoIncrement: boolean
    isHidden: boolean
    isKeyField: boolean
    isMvEnabled: boolean
    isNullable: boolean
    isReadOnly: boolean
    isSelectable: boolean
    isUserEditable: boolean
    isVersionField: boolean
    jsonType: string
    keyField: string
    label?: string
    lookup?: QueryLookup
    measure: boolean
    multiValue?: boolean
    mvEnabled: boolean
    name: string
    nameExpression: string
    nullable: boolean
    phi: string
    rangeURI: string
    readOnly: boolean
    recommendedVariable: boolean
    required: boolean
    rows?: number
    selectable: boolean
    shortCaption: string
    shownInDetailsView: boolean
    shownInInsertView: boolean
    shownInUpdateView: boolean
    sortable: boolean
    sqlType: string
    tsvFormat?: string
    type: string
    typeName?: string
    typeURI?: string
    userEditable: boolean
    versionField: boolean
    xtype?: string
}

export interface QueryLookup {
    container?: string
    containerPath?: string
    displayColumn?: string
    filterGroups?: any
    isPublic: boolean
    junctionLookup?: string
    keyColumn: string
    multiValued?: string
    'public': boolean
    queryName: string
    schema: string
    schemaName: string
    table: string
}