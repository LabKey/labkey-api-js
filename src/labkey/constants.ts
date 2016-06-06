interface Container {
    path: string
}

interface ExperimentalFeatures {
    containerRelativeURL: boolean
}

export interface LabKey {
    container: Container
    contextPath: string
    CSRF: string
    experimental: ExperimentalFeatures
}

declare var LABKEY: LabKey;

export function loadContext(): LabKey {
    return LABKEY;
}

// The following will be removed in favor of a proper "global" initialization pattern. For now,
// just throw an error if the world hasn't been setup (aka labkey.js wasn't loaded prior)
class _Window extends Window {
    LABKEY: any
}
declare var window: _Window;

if (!window.LABKEY) {
    throw new Error('LABKEY object is required to be initialized prior to loading the API');
}