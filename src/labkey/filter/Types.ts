import { FilterValue, multiValueToSingleMap, oppositeMap, singleValueToMultiMap } from './constants'

let urlMap: {
    [suffix:string]: FilterType
} = {};

export interface FilterType {
    getDisplaySymbol: () => string
    getDisplayText: () => string
    getLongDisplayText: () => string
    getURLSuffix: () => string
    isDataValueRequired: () => boolean
    isMultiValued: () => boolean
    getMultiValueFilter: () => FilterType
    getMultiValueMaxOccurs: () => number
    getMultiValueMinOccurs: () => number
    getMultiValueSeparator: () => string
    getOpposite: () => FilterType
    getSingleValueFilter:() => FilterType
    validate: (value: FilterValue, jsonType: string, columnName: string) => any
}

const EQUAL = generateFilterType('Equals', '=', 'eq', true);
const GREATER_THAN = generateFilterType('Is Greater Than', '>', 'gt', true);
const GREATER_THAN_OR_EQUAL = generateFilterType('Is Greater Than or Equal To', '>=', 'gte', true);
const IN = generateFilterType('Equals One Of', null, 'in', true, ';', 'Equals One Of (example usage: a;b;c)');
const LESS_THAN = generateFilterType('Is Less Than', '<', 'lt', true);
const LESS_THAN_OR_EQUAL = generateFilterType('Is Less Than or Equal To', '=<', 'lte', true);
const NOT_EQUAL = generateFilterType('Does Not Equal', '<>', 'neq', true);
const NOT_IN = generateFilterType('Does Not Equal Any Of', null, 'notin', true, ';', 'Does Not Equal Any Of (example usage: a;b;c)');
const NEQ_OR_NULL = generateFilterType(NOT_EQUAL.getDisplayText(), NOT_EQUAL.getDisplaySymbol(), 'neqornull', true);

export const Types = {

    //
    // These operators require a data value
    //

    EQUAL,
    DATE_EQUAL: generateFilterType(EQUAL.getDisplayText(), EQUAL.getDisplaySymbol(), 'dateeq', true),

    NOT_EQUAL,
    NEQ: NOT_EQUAL,
    DATE_NOT_EQUAL: generateFilterType(NOT_EQUAL.getDisplayText(), NOT_EQUAL.getDisplaySymbol(), 'dateneq', true),

    NEQ_OR_NULL,
    NOT_EQUAL_OR_MISSING: NEQ_OR_NULL,

    GREATER_THAN,
    GT: GREATER_THAN,
    DATE_GREATER_THAN: generateFilterType(GREATER_THAN.getDisplayText(), GREATER_THAN.getDisplaySymbol(), 'dategt', true),

    LESS_THAN,
    LT: LESS_THAN,
    DATE_LESS_THAN: generateFilterType(LESS_THAN.getDisplayText(), LESS_THAN.getDisplaySymbol(), 'datelt', true),

    GREATER_THAN_OR_EQUAL,
    GTE : GREATER_THAN_OR_EQUAL,
    DATE_GREATER_THAN_OR_EQUAL: generateFilterType(GREATER_THAN_OR_EQUAL.getDisplayText(), GREATER_THAN_OR_EQUAL.getDisplaySymbol(), 'dategte', true),

    LESS_THAN_OR_EQUAL,
    LTE: LESS_THAN_OR_EQUAL,
    DATE_LESS_THAN_OR_EQUAL: generateFilterType(LESS_THAN_OR_EQUAL.getDisplayText(), LESS_THAN_OR_EQUAL.getDisplaySymbol(), 'datelte', true),

    STARTS_WITH: generateFilterType('Starts With', null, 'startswith', true),
    DOES_NOT_START_WITH: generateFilterType('Does Not Start With', null, 'doesnotstartwith', true),

    CONTAINS: generateFilterType('Contains', null, 'contains', true),
    DOES_NOT_CONTAIN: generateFilterType('Does Not Contain', null, 'doesnotcontain', true),

    CONTAINS_ONE_OF: generateFilterType('Contains One Of', null, 'containsoneof', true, ';', 'Contains One Of (example usage: a;b;c)'),
    CONTAINS_NONE_OF: generateFilterType('Does Not Contain Any Of', null, 'containsnoneof', true, ';', 'Does Not Contain Any Of (example usage: a;b;c)'),

    // NOTE: for some reason IN is aliased as EQUALS_ONE_OF. Not sure if this is for legacy purposes or it was
    // determined EQUALS_ONE_OF was a better phrase to follow this pattern I did the same for IN_OR_MISSING
    IN,
    EQUALS_ONE_OF: IN,

    NOT_IN,
    EQUALS_NONE_OF: NOT_IN,

    BETWEEN: generateFilterType('Between', null, 'between', true, ',', 'Between, Inclusive (example usage: -4,4)', 2, 2),
    NOT_BETWEEN: generateFilterType('Not Between', null, 'notbetween', true, ',', 'Not Between, Exclusive (example usage: -4,4)', 2, 2),

    MEMBER_OF: generateFilterType('Member Of', null, 'memberof', true, undefined, 'Member Of'),

    //
    // These are the 'no data value' operators
    //

    HAS_ANY_VALUE: generateFilterType('Has Any Value'),

    ISBLANK: generateFilterType('Is Blank', null, 'isblank'),
    MISSING: generateFilterType('Is Blank', null, 'isblank'),
    NONBLANK: generateFilterType('Is Not Blank', null, 'isnonblank'),
    NOT_MISSING: generateFilterType('Is Not Blank', null, 'isnonblank'),

    HAS_MISSING_VALUE: generateFilterType('Has a missing value indicator', null, 'hasmvvalue'),
    DOES_NOT_HAVE_MISSING_VALUE: generateFilterType('Does not have a missing value indicator', null, 'nomvvalue'),

    EXP_CHILD_OF: generateFilterType('Is Child Of', null, 'exp:childof', true, undefined, ' is child of')
};

export const TYPES_BY_JSON_TYPE: {
    [jsonType: string]: Array<FilterType>
} = {
    'boolean': [Types.HAS_ANY_VALUE, Types.EQUAL, Types.NEQ_OR_NULL, Types.ISBLANK, Types.NONBLANK],
    'date': [Types.HAS_ANY_VALUE, Types.DATE_EQUAL, Types.DATE_NOT_EQUAL, Types.ISBLANK, Types.NONBLANK, Types.DATE_GREATER_THAN, Types.DATE_LESS_THAN, Types.DATE_GREATER_THAN_OR_EQUAL, Types.DATE_LESS_THAN_OR_EQUAL],
    'float': [Types.HAS_ANY_VALUE, Types.EQUAL, Types.NEQ_OR_NULL, Types.ISBLANK, Types.NONBLANK, Types.GT, Types.LT, Types.GTE, Types.LTE, Types.IN, Types.NOT_IN, Types.BETWEEN, Types.NOT_BETWEEN],
    'int': [Types.HAS_ANY_VALUE, Types.EQUAL, Types.NEQ_OR_NULL, Types.ISBLANK, Types.NONBLANK, Types.GT, Types.LT, Types.GTE, Types.LTE, Types.IN, Types.NOT_IN, Types.BETWEEN, Types.NOT_BETWEEN],
    'string': [Types.HAS_ANY_VALUE, Types.EQUAL, Types.NEQ_OR_NULL, Types.ISBLANK, Types.NONBLANK, Types.GT, Types.LT, Types.GTE, Types.LTE, Types.CONTAINS, Types.DOES_NOT_CONTAIN, Types.DOES_NOT_START_WITH, Types.STARTS_WITH, Types.IN, Types.NOT_IN, Types.CONTAINS_ONE_OF, Types.CONTAINS_NONE_OF, Types.BETWEEN, Types.NOT_BETWEEN]
};

function generateFilterType(
    displayText: string, displaySymbol?: string, urlSuffix?: string,
    dataValueRequired?: boolean, multiValueSeparator?: string, longDisplayText?: string,
    minOccurs?: number, maxOccurs?: number
): FilterType {

    const isDataValueRequired = () => dataValueRequired === true;
    const isMultiValued = () => multiValueSeparator != null;

    const validate = (value: FilterValue, jsonType: string, columnName: string) => {
        if (!isDataValueRequired()) {
            return true;
        }

        let f = TYPES_BY_JSON_TYPE[jsonType.toLowerCase()];
        let found = false;

        for (var i=0; !found && i < f.length; i++) {
            if (f[i].getURLSuffix() == urlSuffix) {
                found = true;
            }
        }

        if (!found) {
            // TODO: Remove this alert asap
            alert("Filter type '" + displayText + "' can't be applied to " + type + " types.");
            return undefined;
        }

        return true; // TODO: Not Yet Finished
        // if (this.isMultiValued())
        //     return validateMultiple(jsonType, value, columnName, multiValueSeparator, minOccurs, maxOccurs);
        // return validate(jsonType, value, columnName);
    };

    var type: FilterType = {
        getDisplaySymbol: () => displaySymbol || null,
        getDisplayText: () => displayText,
        getLongDisplayText: () => longDisplayText || displayText,
        getURLSuffix: () => urlSuffix || null,
        isDataValueRequired,
        isMultiValued,
        getMultiValueFilter: () => {
            return isMultiValued() ? null : urlMap[singleValueToMultiMap[urlSuffix]];
        },
        getMultiValueMaxOccurs: () => maxOccurs,
        getMultiValueMinOccurs: () => minOccurs,
        getMultiValueSeparator: () => multiValueSeparator || null,
        getOpposite: () => {
            return oppositeMap[urlSuffix] ? urlMap[oppositeMap[urlSuffix]] : null;
        },
        getSingleValueFilter: () => {
            return isMultiValued ? urlMap[multiValueToSingleMap[urlSuffix]] : null;
        },
        validate
    };

    urlMap[urlSuffix] = type;

    return type;
}