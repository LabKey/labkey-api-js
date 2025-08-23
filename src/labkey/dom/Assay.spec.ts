import * as Ajax from '../Ajax';

import { importRun } from './Assay';

describe('dom/Assay', () => {
    const requestSpy = jest.spyOn(Ajax, 'request').mockImplementation();

    describe('importRun', () => {
        const TEST_FILE = new File(['foo'], 'foo.txt', { type: 'text/plain' });
        const TEST_PROPS = {
            array_primitive: [1, 2, 3],
            array_mixed: ['a', 2, true, null, undefined, { z: 9 }],
            bigNumber: 9007199254740991,
            bigNumberTooBig: 9007199254740991456,
            date_object: new Date('2025-08-23T12:34:56.789Z'),
            'emoji_🙂': 'smile',
            empty_array: [] as any[],
            empty_object: {},
            nullValue: null as any,
            'qu"ot\'ed"key': 'quotes" are \'ok"',
            someFile: TEST_FILE,
            someInt: 42,
            undefinedValue: undefined as any,
            'unicode_µg/μL': 'micro units',
            'with[brackets]': 'square brackets',
            'with[one_bracket': 'one [bracket',
        };

        function verifyProperties(formData: FormData, propertyFn: (name: string) => string): void {
            expect(formData.get(propertyFn('array_primitive'))).toBe('[1,2,3]');
            expect(formData.get(propertyFn('array_mixed'))).toBe('[\"a\",2,true,null,null,{\"z\":9}]');
            expect(formData.get(propertyFn('bigNumber'))).toBe('9007199254740991');
            expect(formData.get(propertyFn('bigNumberTooBig'))).toBe('9007199254740991000');
            expect(formData.get(propertyFn('emoji_🙂'))).toBe('smile');
            expect(formData.get(propertyFn('empty_array'))).toBe('[]');
            expect(formData.get(propertyFn('empty_object'))).toBe('{}');
            expect(formData.get(propertyFn('date_object'))).toBe('Sat Aug 23 2025 12:34:56 GMT+0000 (Coordinated Universal Time)');
            expect(formData.get(propertyFn('nullValue'))).toBe('null');
            expect(formData.get(propertyFn('qu"ot\'ed"key'))).toBe('quotes" are \'ok"');
            expect(formData.get(propertyFn('someFile'))).toBe(TEST_FILE);
            expect(formData.get(propertyFn('someInt'))).toBe('42');
            expect(formData.has(propertyFn('undefinedValue'))).toBe(false);
            expect(formData.get(propertyFn('unicode_µg/μL'))).toBe('micro units');
            expect(formData.get(propertyFn('with[brackets]'))).toBe('square brackets');
            expect(formData.get(propertyFn('with[one_bracket'))).toBe('one [bracket');
        }

        function getFormData(lastArgs: Ajax.RequestOptions[]): FormData {
            expect(lastArgs).toHaveLength(1);
            expect(lastArgs).toHaveLength(1);
            const request = lastArgs[0];
            expect(request.form instanceof FormData).toBe(true);
            return request.form as FormData;
        }

        it('does not serialize empty properties', () => {
            // Act
            importRun({
                assayId: 123,
                batchProperties: {},
                dataRows: [],
                properties: {},
            });

            // Assert
            const formData = getFormData(requestSpy.mock.lastCall);
            const formKeys = formData.keys();
            expect(formKeys).not.toContain('batchProperties');
            expect(formKeys).not.toContain('properties');
        });
        it('serializes batch properties', () => {
            // Act
            importRun({ assayId: 123, batchProperties: TEST_PROPS, dataRows: [] });

            // Assert
            const formData = getFormData(requestSpy.mock.lastCall);
            verifyProperties(formData, (name: string) => `batchProperties[\'${name}\']`);
        });
        it('serializes run properties', () => {
            // Act
            importRun({ assayId: 123, dataRows: [], properties: TEST_PROPS });

            // Assert
            const formData = getFormData(requestSpy.mock.lastCall);
            verifyProperties(formData, (name: string) => `properties[\'${name}\']`);
        });
    });
});