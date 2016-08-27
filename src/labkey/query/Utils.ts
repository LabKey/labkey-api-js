import { appendFilterParams, Filter } from '../Filter'

// Would have liked to use an enum but TypeScript's enums are number-based (as of 1.8)
// https://basarat.gitbooks.io/typescript/content/docs/tips/stringEnums.html
//
// Additionally, cannot use 'type' here as we want to actually return a resolvable object
// e.g. LABKEY.Query.containerFilter.current; // "current"
export const containerFilter = {
    current: 'current',
    currentAndFirstChildren: 'currentAndFirstChildren',
    currentAndSubfolders: 'currentAndSubfolders',
    currentPlusProject: 'currentPlusProject',
    currentAndParents: 'currentAndParents',
    currentPlusProjectAndShared: 'currentPlusProjectAndShared',
    allFolders: 'allFolders'
};

export function buildQueryParams(schemaName: string, queryName: string, filterArray: Array<Filter>, sort: string, dataRegionName?: string): any {

    dataRegionName = dataRegionName || 'query';

    var params: any = {
        dataRegionName,
        [dataRegionName + '.queryName']: queryName,
        schemaName
    };

    if (sort) {
        params[dataRegionName + '.sort'] = sort;
    }

    return appendFilterParams(params, filterArray, dataRegionName);
}

export function getMethod(value: string): string {
    if (value && (value.toUpperCase() === 'GET' || value.toUpperCase() === 'POST'))
        return value.toUpperCase();
    return 'GET';
}