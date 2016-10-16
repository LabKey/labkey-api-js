import { isString } from '../Utils'

import { QueryKey } from './QueryKey'

export class FieldKey extends QueryKey {

    /**
     * Create new FieldKey from an Array of unencoded FieldKey string parts.
     * @param parts
     * @returns {FieldKey}
     */
    static fromParts(parts?: any) {
        var ret: FieldKey = null;

        for (var i=0; i < arguments.length; i++) {
            let arg = arguments[i];
            if (isString(arg)) {
                ret = new FieldKey(ret, arg);
            }
            else if (arg && arg.length) {
                for (var j=0; j < arg.length; j++) {
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

        for (var i=0; i < r.length; i++) {
            ret = new FieldKey(ret, QueryKey.decodePart(r[i]));
        }

        return ret;
    }

    toString() {
        return super.toString('/');
    }
}