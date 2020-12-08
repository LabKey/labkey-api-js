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
import { isString } from './Utils'
import { QueryKey } from './QueryKey'

export class FieldKey extends QueryKey {

    /**
     * Create new FieldKey from an Array of unencoded FieldKey string parts.
     * @param parts
     * @returns {FieldKey}
     */
    static fromParts(parts?: any) {
        let ret: FieldKey = null;

        for (let i=0; i < arguments.length; i++) {
            let arg = arguments[i];
            if (isString(arg)) {
                ret = new FieldKey(ret, arg);
            }
            else if (arg && arg.length) {
                for (let j=0; j < arg.length; j++) {
                    ret = new FieldKey(ret, arg[j]);
                }
            }
            else {
                throw 'Illegal argument to fromParts: ' + arg;
            }
        }

        return ret;
    }

    /**
     * Create new FieldKey from a FieldKey encoded string with parts separated by '/' characters.
     * @param s
     * @returns {FieldKey}
     */
    static fromString(s: string): FieldKey {
        let ret: FieldKey = null;
        let r = s.split('/');

        for (let i=0; i < r.length; i++) {
            ret = new FieldKey(ret, QueryKey.decodePart(r[i]));
        }

        return ret;
    }

    toString() {
        return super.toString('/');
    }
}