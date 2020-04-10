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
    conceptURI: string
    defaultScale: string
    defaultValue?: any
    dimension: boolean
    excludeFromShifting: boolean
    ext?: any
    facetingBehaviorType: string
    fieldKey: string
    fieldKeyArray: string[]
    fieldKeyPath: string
    friendlyType: string
    hidden: boolean
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
    measure: boolean
    mvEnabled: boolean
    name: string
    nullable: boolean
    phi: string
    rangeURI: string
    readOnly: boolean
    recommendedVariable: boolean
    required: boolean
    selectable: boolean
    shortCaption: string
    shownInDetailsView: boolean
    shownInInsertView: boolean
    shownInUpdateView: boolean
    sortable: boolean
    sqlType: string
    type: string
    userEditable: boolean
    versionField: boolean
}
