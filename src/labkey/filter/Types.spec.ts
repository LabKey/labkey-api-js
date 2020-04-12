import { Types } from './Types'

import typesSnapshot from '../../test/data/filter_types_snapshot.json'

// Use this function (minus the typings) in the browser to generate the snapshot for the test data
// console.log(JSON.stringify(generateFilterTypesSnapshot(LABKEY.Filter.Types), null, 2));
function generateFilterTypesSnapshot(types: any) {
    let json: any = {};

    Object.keys(types).sort().forEach((type) => {
        json[type] = {};
        Object.keys(types[type])

            .filter(fn => typeof types[type][fn] === 'function')

            // validate() takes arguments and doesn't return a pre-determined value
            .filter(fn => fn !== 'validate')

            // parseValue() throws an error with undefined argument
            .filter(fn => fn !== 'parseValue')

            .sort()

            .forEach((fn) => {
                let value = types[type][fn]();

                // These methods are expected to return other filter types -- encode by getURLSuffix()
                if (value && (fn === 'getOpposite' ||
                    fn === 'getMultiValueFilter' ||
                    fn === 'getSingleValueFilter')) {
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