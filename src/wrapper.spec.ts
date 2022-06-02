import * as wrapper from './wrapper';
import apiSnapshot from './test/data/core_api_snapshot.json';

declare let LABKEY: any;

describe('LABKEY wrapper', () => {
    const snapshot: Record<string, string[]> = apiSnapshot;

    it('should not export anything', () => {
        expect(wrapper).toEqual({});
    });

    it('matches API snapshot', () => {
        const expectedNamespaces = Object.keys(snapshot).sort();

        // Support all top level namespaces
        // If this test fails it means there is a missing namespace in @labkey/api
        expectedNamespaces.forEach(expectedProperty => {
            expect(LABKEY).toHaveProperty(expectedProperty);
        });

        const errors: string[] = [];

        // For each namespace assert LABKEY is a superset of the API snapshot
        // If this test fails it means there is an export missing from @labkey/api
        expectedNamespaces.forEach(expectedProperty => {
            const actualExports = Object.keys(LABKEY[expectedProperty]).sort();
            const expectedExports = snapshot[expectedProperty];

            expectedExports.forEach(expectedExport => {
                if (actualExports.indexOf(expectedExport) === -1) {
                    errors.push(`Expected '${expectedProperty}' to export '${expectedExport}'`);
                }
            });
        });

        expect(errors).toEqual([]);
    });
});
