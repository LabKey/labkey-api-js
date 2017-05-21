/*
 * Copyright (c) 2016 LabKey Corporation
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
export abstract class QueryKey {
    name: string;
    parent: QueryKey;

    /**
     * Use QueryKey encoding to decode a single part.
     * This matches org.labkey.api.query.QueryKey.decodePart() in the Java API.
     * @param s
     * @returns {string}
     */
    static decodePart(s: string): string {
        return s.replace(/\$P/g, '.').replace(/\$C/g, ',').replace(/\$T/g, '~').replace(/\$B/g, '}').replace(/\$A/g, '&').replace(/\$S/g, '/').replace(/\$D/g, '$');
    }

    /**
     * Use QueryKey encoding to encode a single part.
     * This matches org.labkey.api.query.QueryKey.encodePart() in the Java API.
     * @param s
     * @returns {string}
     */
    static encodePart(s: string): string {
        return s.replace(/\$/g, '$D').replace(/\//g, '$S').replace(/\&/g, '$A').replace(/\}/g, '$B').replace(/\~/g, '$T').replace(/\,/g, '$C').replace(/\./g, '$P');
    }

    /**
     * Returns true if the part needs to be SQL quoted.
     * @param s
     * @returns {boolean}
     */
    static needsQuotes(s: string): boolean {
        if (!s.match(/^[a-zA-Z][_\$a-zA-Z0-9]*$/))
            return true;
        if (s.match(/^(all|any|and|as|asc|avg|between|class|count|delete|desc|distinct|elements|escape|exists|false|fetch|from|full|group|having|in|indices|inner|insert|into|is|join|left|like|limit|max|min|new|not|null|or|order|outer|right|select|set|some|sum|true|union|update|user|versioned|where|case|end|else|then|when|on|both|empty|leading|member|of|trailing)$/i))
            return true;
        return false;
    }

    /**
     * SQL quotes a bare string.
     * @param s String to be quoted.
     * @returns {string} Quoted string.
     */
    static quote(s: string): string {
        return '"' + s.replace(/\"/g, '""') + '"';
    }

    constructor(parent: QueryKey, name: string) {
        this.name = name;
        this.parent = parent;
    }

    equals(other: any): boolean {
        return (
            other != null &&
            this.constructor == other.constructor &&
            this.toString().toLowerCase() == other.toString().toLowerCase()
        );
    }

    getName(): string {
        return this.name;
    }

    /**
     * Returns an Array of unencoded QueryKey parts
     */
    getParts(): Array<string> {
        let ret: Array<string> = [];

        if (this.parent) {
            ret = this.parent.getParts();
        }
        
        ret.push(this.name);

        return ret;
    }

    toDisplayString(): string {
        return this.getParts().join('.');
    }

    toJSON(): string {
        return this.toString();
    }

    toSQLString(): string {
        let encoded: Array<string> = [];
        let parts = this.getParts();

        for (let i=0; i < parts.length; i++) {
            if (QueryKey.needsQuotes(parts[i])) {
                encoded.push(QueryKey.quote(parts[i]));
            }
            else {
                encoded.push(parts[i]);
            }
        }

        return encoded.join('.');
    }

    toString(divider?: string): string {
        let encoded: Array<string> = [];
        let parts = this.getParts();

        for (let i=0; i < parts.length; i++) {
            encoded.push(QueryKey.encodePart(parts[i]));
        }

        return encoded.join(divider);
    }
}

