import typesSnapshot from '../../test/data/filter_types_snapshot.json';

import { Types } from './Types';

// Use this function (minus the typings) in the browser to generate the snapshot for the test data
// console.log(JSON.stringify(generateFilterTypesSnapshot(LABKEY.Filter.Types), null, 2));
function generateFilterTypesSnapshot(types: any) {
    const json: any = {};

    Object.keys(types)
        .sort()
        .forEach(type => {
            json[type] = {};
            Object.keys(types[type])

                .filter(fn => typeof types[type][fn] === 'function')

                // validate() takes arguments and doesn't return a pre-determined value
                .filter(fn => fn !== 'validate')

                // parseValue() throws an error with undefined argument
                .filter(fn => fn !== 'parseValue')

                .sort()

                .forEach(fn => {
                    let value = types[type][fn]();

                    // These methods are expected to return other filter types -- encode by getURLSuffix()
                    if (
                        value &&
                        (fn === 'getOpposite' || fn === 'getMultiValueFilter' || fn === 'getSingleValueFilter')
                    ) {
                        value = value.getURLSuffix();
                    }

                    // JSON does not encode undefined values
                    if (value === undefined) {
                        value = 'undefined';
                    }

                    json[type][fn] = value;
                });
        });

    return json;
}

describe('Types', () => {
    it('should match types snapshot', () => {
        expect(generateFilterTypesSnapshot(Types)).toStrictEqual(typesSnapshot);
    });
});

describe('parseValue', () => {
    describe('multi value types', () => {
        it('should parse JSON formatted values', () => {
            const type = Types.IN;
            const value = '{json:["value1","value2","value;3"]}';
            expect(type.parseValue(value)).toEqual(['value1', 'value2', 'value;3']);
        });

        it('should split values by the type multi-value separator', () => {
            const semicolonType = Types.IN; // Uses ';' as separator
            const semicolonValue = 'value1;value2;value3';
            expect(semicolonType.parseValue(semicolonValue)).toEqual(['value1', 'value2', 'value3']);

            const commaType = Types.BETWEEN; // Uses ',' as separator
            const commaValue = 'value1,value2';
            expect(commaType.parseValue(commaValue)).toEqual(['value1', 'value2']);
        });

        it('should split values by newline separator', () => {
            const type = Types.IN;
            const value = 'value1\nvalue2\nvalue3';
            expect(type.parseValue(value)).toEqual(['value1', 'value2', 'value3']);
        });

        it('should split values by both type separator and newline', () => {
            const type = Types.IN;
            const value = 'value1;value2\nvalue3';
            expect(type.parseValue(value)).toEqual(['value1', 'value2', 'value3']);
        });

        it('should fall back to regex parsing if JSON is invalid', () => {
            const type = Types.IN;
            // Invalid JSON: missing closing quote for value2
            const singleValue = '{json:["value1","value2]}';
            expect(type.parseValue(singleValue)).toEqual([singleValue]);

            const multiValue = '{json:aaa;bb}';
            expect(type.parseValue(multiValue)).toEqual(['{json:aaa', 'bb}']);
        });
    })
});