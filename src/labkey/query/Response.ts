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
        for (var attr in rawResponse) {
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