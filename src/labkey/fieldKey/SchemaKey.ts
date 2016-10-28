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
import { isString } from '../Utils'

import { QueryKey } from './QueryKey'

export class SchemaKey extends QueryKey {

    /**
     * Create new SchemaKey from an Array of unencoded SchemaKey string parts.
     * @returns {SchemaKey}
     */
    static fromParts(parts?: any): SchemaKey {
        var ret: SchemaKey = null;

        for (var i=0; i < arguments.length; i++) {
            let arg = arguments[i];
            if (isString(arg)) {
                ret = new SchemaKey(ret, arg);
            }
            else if (arg && arg.length) {
                for (var j=0; j < arg.length; j++) {
                    ret = new SchemaKey(ret, arg[j]);
                }
            }
            else {
                throw 'Illegal argument to fromParts: ' + arg;
            }
        }

        return ret;
    }

    /**
     * Create new SchemaKey from a SchemaKey encoded string with parts separated by '.' characters.
     * @param s
     * @returns {null}
     */
    static fromString(s: string): SchemaKey {
        let r  = s.split('.');
        let ret: SchemaKey = null;

        for (var i=0; i < r.length; i++) {
            ret = new SchemaKey(ret, QueryKey.decodePart(r[i]));
        }

        return ret;
    }

    /**
     * Returns an encoded SchemaKey string suitable for sending to the server.
     * @returns {string}
     */
    toString() {
        return super.toString('.');
    }
}