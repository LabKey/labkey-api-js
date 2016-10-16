import { appendFilterParams, Filter } from '../filter/Filter'
import { ensureRegionName } from '../Utils'

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

    const regionName = ensureRegionName(dataRegionName);

    var params: any = {
        regionName,
        [regionName + '.queryName']: queryName,
        schemaName
    };

    if (sort) {
        params[regionName + '.sort'] = sort;
    }

    return appendFilterParams(params, filterArray, regionName);
}

export function getMethod(value: string): string {
    if (value && (value.toUpperCase() === 'GET' || value.toUpperCase() === 'POST'))
        return value.toUpperCase();
    return 'GET';
}