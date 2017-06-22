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
import { SchemaKey } from '../fieldKey/SchemaKey'

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

        // TODO: Finish this

        this.schemaKey = SchemaKey.fromParts(rawResponse.schemaName);
    }
}

class Row {

}