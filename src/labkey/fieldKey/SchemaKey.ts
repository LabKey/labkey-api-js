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