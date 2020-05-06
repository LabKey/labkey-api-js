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
import { FilterValue, multiValueToSingleMap, oppositeMap, singleValueToMultiMap } from './constants';
import { isArray, isString } from '../Utils';

let urlMap: {
    [suffix:string]: IFilterType
} = {};

export interface IFilterType {
    getDisplaySymbol: () => string
    getDisplayText: () => string
    getLongDisplayText: () => string
    getURLSuffix: () => string
    isDataValueRequired: () => boolean
    isMultiValued: () => boolean
    isTableWise: () => boolean
    getMultiValueFilter: () => IFilterType
    getMultiValueMaxOccurs: () => number
    getMultiValueMinOccurs: () => number
    getMultiValueSeparator: () => string
    getOpposite: () => IFilterType
    getSingleValueFilter:() => IFilterType
    /**
     * Split a filter String or Array value appropriately for this filter type.
     * @return {String|Array} For multi-valued filter types, an Array of values, otherwise the original filter value.
     */
    parseValue: (value: string | Array<FilterValue>) => FilterValue | Array<FilterValue>
    /**
     * Get the (unencoded) value that will be put on the URL.
     */
    getURLParameterValue: (value: FilterValue) => FilterValue
    validate: (value: FilterValue, jsonType: string, columnName: string) => any
}

/** Finds rows where the column value matches the given filter value. Case-sensitivity depends upon how your underlying relational database was configured.*/
const EQUAL = registerFilterType('Equals', '=', 'eq', true);
/** Finds rows where the column value is greater than the filter value.*/
const GREATER_THAN = registerFilterType('Is Greater Than', '>', 'gt', true);
/** Finds rows where the column value is greater than or equal to the filter value.*/
const GREATER_THAN_OR_EQUAL = registerFilterType('Is Greater Than or Equal To', '>=', 'gte', true);
/** Finds rows where the column value equals one of the supplied filter values. The values should be supplied as a semi-colon-delimited list (example usage: a;b;c).*/
const IN = registerFilterType('Equals One Of', null, 'in', true, ';', 'Equals One Of (example usage: a;b;c)');
/** Finds rows where the column value is less than the filter value.*/
const LESS_THAN = registerFilterType('Is Less Than', '<', 'lt', true);
/** Finds rows where the column value is less than or equal to the filter value.*/
const LESS_THAN_OR_EQUAL = registerFilterType('Is Less Than or Equal To', '=<', 'lte', true);
/** Finds rows where the column value does not equal the filter value.*/
const NOT_EQUAL = registerFilterType('Does Not Equal', '<>', 'neq', true);
/** Finds rows where the column value is not in any of the supplied filter values. The values should be supplied as a semi-colon-delimited list (example usage: a;b;c).*/
const NOT_IN = registerFilterType('Does Not Equal Any Of', null, 'notin', true, ';', 'Does Not Equal Any Of (example usage: a;b;c)');
const NEQ_OR_NULL = registerFilterType(NOT_EQUAL.getDisplayText(), NOT_EQUAL.getDisplaySymbol(), 'neqornull', true);

// Mutable due to "_define"
export let Types: {[key:string]: IFilterType} = {

    //
    // These operators require a data value
    //

    EQUAL,
    DATE_EQUAL: registerFilterType(EQUAL.getDisplayText(), EQUAL.getDisplaySymbol(), 'dateeq', true),

    NOT_EQUAL,
    NEQ: NOT_EQUAL,
    DATE_NOT_EQUAL: registerFilterType(NOT_EQUAL.getDisplayText(), NOT_EQUAL.getDisplaySymbol(), 'dateneq', true),

    NEQ_OR_NULL,
    NOT_EQUAL_OR_MISSING: NEQ_OR_NULL,

    GREATER_THAN,
    GT: GREATER_THAN,
    DATE_GREATER_THAN: registerFilterType(GREATER_THAN.getDisplayText(), GREATER_THAN.getDisplaySymbol(), 'dategt', true),

    LESS_THAN,
    LT: LESS_THAN,
    DATE_LESS_THAN: registerFilterType(LESS_THAN.getDisplayText(), LESS_THAN.getDisplaySymbol(), 'datelt', true),

    GREATER_THAN_OR_EQUAL,
    GTE : GREATER_THAN_OR_EQUAL,
    DATE_GREATER_THAN_OR_EQUAL: registerFilterType(GREATER_THAN_OR_EQUAL.getDisplayText(), GREATER_THAN_OR_EQUAL.getDisplaySymbol(), 'dategte', true),

    LESS_THAN_OR_EQUAL,
    LTE: LESS_THAN_OR_EQUAL,
    DATE_LESS_THAN_OR_EQUAL: registerFilterType(LESS_THAN_OR_EQUAL.getDisplayText(), LESS_THAN_OR_EQUAL.getDisplaySymbol(), 'datelte', true),

    STARTS_WITH: registerFilterType('Starts With', null, 'startswith', true),
    DOES_NOT_START_WITH: registerFilterType('Does Not Start With', null, 'doesnotstartwith', true),

    CONTAINS: registerFilterType('Contains', null, 'contains', true),
    DOES_NOT_CONTAIN: registerFilterType('Does Not Contain', null, 'doesnotcontain', true),

    CONTAINS_ONE_OF: registerFilterType('Contains One Of', null, 'containsoneof', true, ';', 'Contains One Of (example usage: a;b;c)'),
    CONTAINS_NONE_OF: registerFilterType('Does Not Contain Any Of', null, 'containsnoneof', true, ';', 'Does Not Contain Any Of (example usage: a;b;c)'),

    // NOTE: for some reason IN is aliased as EQUALS_ONE_OF. Not sure if this is for legacy purposes or it was
    // determined EQUALS_ONE_OF was a better phrase to follow this pattern I did the same for IN_OR_MISSING
    IN,
    EQUALS_ONE_OF: IN,

    NOT_IN,
    EQUALS_NONE_OF: NOT_IN,

    BETWEEN: registerFilterType('Between', null, 'between', true, ',', 'Between, Inclusive (example usage: -4,4)', 2, 2),
    NOT_BETWEEN: registerFilterType('Not Between', null, 'notbetween', true, ',', 'Not Between, Exclusive (example usage: -4,4)', 2, 2),

    MEMBER_OF: registerFilterType('Member Of', null, 'memberof', true, undefined, 'Member Of'),

    EXP_CHILD_OF: registerFilterType('Is Child Of', null, 'exp:childof', true, undefined, ' is child of'),
    EXP_PARENT_OF: registerFilterType('Is Parent Of', null, 'exp:parentof', true, undefined, ' is parent of'),
    EXP_LINEAGE_OF: registerFilterType('In The Lineage Of', null, 'exp:lineageof', true, ',', ' in the lineage of'),

    //
    // These are the 'no data value' operators
    //

    // NOTE: This type, for better or worse, uses empty string as it's urlSuffix.
    // The result is a filter that is encoded as "<dataRegionName>.<columnName>~=".
    HAS_ANY_VALUE: registerFilterType('Has Any Value', null, ''),

    ISBLANK: registerFilterType('Is Blank', null, 'isblank'),
    MISSING: registerFilterType('Is Blank', null, 'isblank'),
    NONBLANK: registerFilterType('Is Not Blank', null, 'isnonblank'),
    NOT_MISSING: registerFilterType('Is Not Blank', null, 'isnonblank'),

    HAS_MISSING_VALUE: registerFilterType('Has a missing value indicator', null, 'hasmvvalue'),
    DOES_NOT_HAVE_MISSING_VALUE: registerFilterType('Does not have a missing value indicator', null, 'nomvvalue'),

    //
    // Table/Query-wise operators
    //
    Q: registerFilterType('Search', null, 'q', true, undefined, 'Search across all columns', undefined, undefined, true)
};

export type JsonType = 'boolean' | 'date' | 'float' | 'int' | 'string';

export const TYPES_BY_JSON_TYPE: {
    [jsonType: string]: Array<IFilterType>
} = {
    'boolean': [Types.HAS_ANY_VALUE, Types.EQUAL, Types.NEQ_OR_NULL, Types.ISBLANK, Types.NONBLANK],
    'date': [Types.HAS_ANY_VALUE, Types.DATE_EQUAL, Types.DATE_NOT_EQUAL, Types.ISBLANK, Types.NONBLANK, Types.DATE_GREATER_THAN, Types.DATE_LESS_THAN, Types.DATE_GREATER_THAN_OR_EQUAL, Types.DATE_LESS_THAN_OR_EQUAL],
    'float': [Types.HAS_ANY_VALUE, Types.EQUAL, Types.NEQ_OR_NULL, Types.ISBLANK, Types.NONBLANK, Types.GT, Types.LT, Types.GTE, Types.LTE, Types.IN, Types.NOT_IN, Types.BETWEEN, Types.NOT_BETWEEN],
    'int': [Types.HAS_ANY_VALUE, Types.EQUAL, Types.NEQ_OR_NULL, Types.ISBLANK, Types.NONBLANK, Types.GT, Types.LT, Types.GTE, Types.LTE, Types.IN, Types.NOT_IN, Types.BETWEEN, Types.NOT_BETWEEN],
    'string': [Types.HAS_ANY_VALUE, Types.EQUAL, Types.NEQ_OR_NULL, Types.ISBLANK, Types.NONBLANK, Types.GT, Types.LT, Types.GTE, Types.LTE, Types.CONTAINS, Types.DOES_NOT_CONTAIN, Types.DOES_NOT_START_WITH, Types.STARTS_WITH, Types.IN, Types.NOT_IN, Types.CONTAINS_ONE_OF, Types.CONTAINS_NONE_OF, Types.BETWEEN, Types.NOT_BETWEEN]
};

export const TYPES_BY_JSON_TYPE_DEFAULT: {
    [jsonType: string]: IFilterType
} = {
    'boolean': Types.EQUAL,
    'date': Types.DATE_EQUAL,
    'float': Types.EQUAL,
    'int': Types.EQUAL,
    'string': Types.CONTAINS
};

/**
 * Creates a FilterType object and stores it in the global URL Map used by Filter.getFilterTypeForURLSuffix
 * @param displayText The text to display in a filter menu
 * @param displaySymbol The symbol to display in a filter menu
 * @param urlSuffix The suffix used when adding the filter to a URL
 * @param dataValueRequired Boolean used to indicate if a data value is required for the filter type
 * @param multiValueSeparator The separator to use if multiple values are allowed for the filter type
 * @param longDisplayText The text to display in a filter help menu
 * @param minOccurs The minimum number of times the filter can be applied
 * @param maxOccurs The maximum number of times the filter can be applied
 * @param tableWise true if the filter applies to all columns on the table
 */
export function registerFilterType(
    displayText: string, displaySymbol?: string, urlSuffix?: string,
    dataValueRequired?: boolean, multiValueSeparator?: string, longDisplayText?: string,
    minOccurs?: number, maxOccurs?: number, tableWise?: boolean
): IFilterType {
    const isDataValueRequired = () => dataValueRequired === true;
    const isMultiValued = () => multiValueSeparator != null;
    const isTableWise = () => tableWise === true;

    const type: IFilterType = {
        getDisplaySymbol: () => displaySymbol ?? null,
        getDisplayText: () => displayText,
        getLongDisplayText: () => longDisplayText || displayText,
        getURLSuffix: () => urlSuffix ?? null,
        isDataValueRequired,
        isMultiValued,
        isTableWise,
        getMultiValueFilter: () => isMultiValued() ? null : urlMap[singleValueToMultiMap[urlSuffix]],
        getMultiValueMaxOccurs: () => maxOccurs,
        getMultiValueMinOccurs: () => minOccurs,
        getMultiValueSeparator: () => multiValueSeparator ?? null,
        getOpposite: () => oppositeMap[urlSuffix] ? urlMap[oppositeMap[urlSuffix]] : null,
        getSingleValueFilter: () => isMultiValued() ? urlMap[multiValueToSingleMap[urlSuffix]] : urlMap[urlSuffix],

        parseValue: (value) => {
            if (type.isMultiValued()) {
                if (isString(value)) {
                    if (value.indexOf("{json:") === 0 && value.indexOf("}") === value.length-1) {
                        value = JSON.parse(value.substring("{json:".length, value.length - 1));
                    }
                    else {
                        value = value.split(type.getMultiValueSeparator());
                    }
                }

                if (!isArray(value))
                    throw new Error("Filter '" + type.getDisplayText() + "' must be created with Array of values or a '" + type.getMultiValueSeparator() + "' separated string of values: " + value);
            }

            if (!type.isMultiValued() && isArray(value))
                throw new Error("Array of values not supported for '" + type.getDisplayText() + "' filter: " + value);

            return value;
        },

        getURLParameterValue: (value: any): any => {
            if (!type.isDataValueRequired()) {
                return '';
            }

            if (type.isMultiValued() && isArray(value)) {

                // 35265: Create alternate syntax to handle semicolons
                let sep = type.getMultiValueSeparator();
                let found = value.some((v: string) => {
                    return isString(v) && v.indexOf(sep) !== -1;
                });

                if (found) {
                    return '{json:' + JSON.stringify(value) + '}';
                }
                else {
                    return value.join(sep);
                }
            }

            return value;
        },

        validate: (value: FilterValue, jsonType: JsonType, columnName: string): string | boolean | undefined => {
            if (!isDataValueRequired()) {
                return true; // TODO: This method is all over the place with it's return type. WTB sanity...
            }

            let f = TYPES_BY_JSON_TYPE[jsonType.toLowerCase()];
            let found = false;

            for (let i=0; !found && i < f.length; i++) {
                if (f[i].getURLSuffix() == urlSuffix) {
                    found = true;
                }
            }

            if (!found) {
                // TODO: Use Utils.alert
                alert("Filter type '" + displayText + "' can't be applied to " + type + " types.");
                return undefined;
            }

            if (isMultiValued()) {
                return validateMultiple(type, jsonType, value, columnName, multiValueSeparator, minOccurs, maxOccurs);
            } else {
                return validate(jsonType, value, columnName);
            }
        }
    };

    urlMap[urlSuffix] = type;

    return type;
}

/**
 * Not for public use. Can be changed or dropped at any time.
 * @private
 */
export function _define(typeName: string, displayText: string, urlSuffix: string, isMultiType?: boolean): void {
    if (!Types[typeName]) {
        if (isMultiType) {
            Types[typeName] = registerFilterType(displayText, null, urlSuffix, true, ',');
        } else {
            Types[typeName] = registerFilterType(displayText, null, urlSuffix, true);
        }
    }
}

/**
 * Return the default LABKEY.Filter.Type for a json type ("int", "double", "string", "boolean", "date").
 * @private
 */
export function getDefaultFilterForType(jsonType: JsonType): IFilterType {
    if (jsonType && TYPES_BY_JSON_TYPE_DEFAULT[jsonType.toLowerCase()]) {
        return TYPES_BY_JSON_TYPE_DEFAULT[jsonType.toLowerCase()];
    }

    return Types.EQUAL;
}

export function getFilterTypeForURLSuffix(urlSuffix: string): IFilterType {
    return urlMap[urlSuffix];
}

/**
 * Returns an Array of filter types that can be used with the given
 * json type ("int", "double", "string", "boolean", "date")
 * @private
 */
export function getFilterTypesForType(jsonType: JsonType, mvEnabled?: boolean): Array<IFilterType> {
    let types: Array<IFilterType> = [];

    if (jsonType && TYPES_BY_JSON_TYPE[jsonType.toLowerCase()]) {
        types = types.concat(TYPES_BY_JSON_TYPE[jsonType.toLowerCase()]);
    }

    if (mvEnabled) {
        types.push(Types.HAS_MISSING_VALUE);
        types.push(Types.DOES_NOT_HAVE_MISSING_VALUE);
    }

    return types;
}

function twoDigit(num: number): string {
    if (num < 10) {
        return '0' + num;
    }
    return '' + num;
}

/**
 * Note: this is an experimental API that may change unexpectedly in future releases.
 * Validate a form value against the json type.  Error alerts will be displayed.
 * @param jsonType The json type ("int", "float", "date", or "boolean")
 * @param value The value to test.
 * @param columnName The column name to use in error messages.
 * @return undefined if not valid otherwise a normalized string value for the type.
 */
function validate(jsonType: JsonType, value: FilterValue, columnName: string): string | undefined {
    const strValue = value.toString();

    // TODO: Use Utils.alert throughout this method
    if (jsonType === 'boolean') {
        let upperVal = strValue.toUpperCase();
        if (upperVal == 'TRUE' || upperVal == '1' || upperVal == 'YES' || upperVal == 'Y' || upperVal == 'ON' || upperVal == 'T') {
            return '1';
        }
        if (upperVal == 'FALSE' || upperVal == '0' || upperVal == 'NO' || upperVal == 'N' || upperVal == 'OFF' || upperVal == 'F') {
            return '0';
        }
        else {
            alert(strValue + " is not a valid boolean for field '" + columnName + "'. Try true,false; yes,no; y,n; on,off; or 1,0.");
            return undefined;
        }
    }
    else if (jsonType === 'date') {
        let year: number, month: number, day: number, hour: number, minute: number;
        hour = 0;
        minute = 0;

        // Javascript does not parse ISO dates, but if date matches we're done
        if (strValue.match(/^\s*(\d\d\d\d)-(\d\d)-(\d\d)\s*$/) ||
            strValue.match(/^\s*(\d\d\d\d)-(\d\d)-(\d\d)\s*(\d\d):(\d\d)\s*$/)) {
            return strValue;
        }
        else {
            let dateVal = new Date(strValue);
            if (isNaN(dateVal as any)) {
                // filters can use relative dates, in the format +1d, -5H, etc. we try to identify those here
                // this is fairly permissive and does not attempt to parse this value into a date.
                // See CompareType.asDate() for server-side parsing
                if (strValue.match(/^(-|\+)/i)) {
                    return strValue;
                }

                alert(strValue + " is not a valid date for field '" + columnName + "'.");
                return undefined;
            }

            // Try to do something decent with 2 digit years!
            // if we have mm/dd/yy (but not mm/dd/yyyy) in the date
            // fix the broken date parsing
            if (strValue.match(/\d+\/\d+\/\d{2}(\D|$)/)) {
                if (dateVal.getFullYear() < new Date().getFullYear() - 80)
                    dateVal.setFullYear(dateVal.getFullYear() + 100);
            }

            year = dateVal.getFullYear();
            month = dateVal.getMonth() + 1;
            day = dateVal.getDate();
            hour = dateVal.getHours();
            minute = dateVal.getMinutes();
        }
        let str = '' + year + '-' + twoDigit(month) + '-' + twoDigit(day);
        if (hour != 0 || minute != 0)
            str += ' ' + twoDigit(hour) + ':' + twoDigit(minute);

        return str;
    }
    else if (jsonType === 'float') {
        let decVal = parseFloat(strValue);
        if (isNaN(decVal)) {
            alert(strValue + " is not a valid decimal number for field '" + columnName + "'.");
            return undefined;
        }
        else {
            return '' + decVal;
        }
    }
    else if (jsonType === 'int') {
        let intVal = parseInt(strValue);
        if (isNaN(intVal)) {
            alert(strValue + " is not a valid integer for field '" + columnName + "'.");
            return undefined;
        }
        else {
            return '' + intVal;
        }
    }
    else {
        // jsonType === 'string'
        return strValue;
    }
}

// validate the component items of the value
// returns undefined or the string representation of the filter value (see .getURLParameterValue)
function validateMultiple(
    filterType: IFilterType, jsonType: JsonType, value: FilterValue, columnName: string,
    sep: string, minOccurs: number, maxOccurs: number
): string | undefined {
    let values;
    try
    {
        values = filterType.parseValue(value);
    }
    catch (x)
    {
        alert("Failed to validate filter: " + x.toString());
        return undefined;
    }

    let result = [];
    for (let i = 0; i < values.length; i++) {
        let valid = validate(jsonType, values[i].trim(), columnName);
        if (valid == undefined) {
            return undefined;
        }

        result.push(valid);
    }

    if (minOccurs !== undefined && minOccurs > 0) {
        if (values.length < minOccurs) {
            alert("At least " + minOccurs + " '" + sep + "' separated values are required");
            return undefined;
        }
    }

    if (maxOccurs !== undefined && maxOccurs > 0) {
        if (values.length > maxOccurs) {
            alert("At most " + maxOccurs + " '" + sep + "' separated values are allowed");
            return undefined;
        }
    }

    return filterType.getURLParameterValue(values);
}