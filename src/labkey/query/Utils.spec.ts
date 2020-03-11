import { ContainerFilter, containerFilter } from './Utils'

describe('ContainerFilter', () => {
    it('should be a case-sensitive string-based enum', () => {
        // The "value" of the enumeration is expected to bind to Java classes which is case-sensitive
        expect(ContainerFilter.allFolders).toEqual('AllFolders');
        expect(ContainerFilter.current).toEqual('Current');
        expect(ContainerFilter.currentAndFirstChildren).toEqual('CurrentAndFirstChildren');
        expect(ContainerFilter.currentAndParents).toEqual('CurrentAndParents');
        expect(ContainerFilter.currentAndSubfolders).toEqual('CurrentAndSubfolders');
        expect(ContainerFilter.currentPlusProject).toEqual('CurrentPlusProject');
        expect(ContainerFilter.currentPlusProjectAndShared).toEqual('CurrentPlusProjectAndShared');

        // All "values" of the ContainerFilter enum should be covered here -- if it has changed
        // this test will fail and the test should be updated accordingly.
        expect(Object.keys(ContainerFilter).length).toEqual(7);
    });
    it('should be equivalent to "containerFilter"', () => {
        // Backwards compatibilty suppport
        expect(ContainerFilter).toStrictEqual(containerFilter);
    });
});