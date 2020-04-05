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
export interface Container {
    /** Names of active modules in the container. */
    activeModules: string[]
    /** The name of the container's folder type. */
    folderType: string
    /** Date format settings for this container. */
    formats: {
        dateFormat: string
        dateTimeFormat: string
        numberFormat: string
    }
    /** True if any active modules in this container require site permissions. */
    hasRestrictedActiveModule: boolean
    /** Server relative icon URL for this container. */
    iconHref: string
    /** GUID of this container. */
    id: string
    /** Indicates if this container is a Container Tab. */
    isContainerTab: boolean
    /** Indicates if this container is a workbook. */
    isWorkbook: boolean
    /** Name of the container. This is used in the container's path. */
    name: string
    /** GUID of this container's parent container. */
    parentId: string
    /** Path of this container's parent container. */
    parentPath: string
    /** Path of this container. */
    path: string
    /** The relative sort order of the requested container */
    sortOrder: number
    /** Server relative start URL for this container. */
    startUrl: string
    /** An optional non-unique title for the container. */
    title: string
    /** Type of this container. (e.g. "project", "folder"). */
    type: string
}

export enum ExperimentalFeatures {
    containerRelativeURL = 'containerRelativeURL',
    disableGuestAccount = 'disableGuestAccount',
    javascriptErrorServerLogging = 'javascriptErrorServerLogging',
    javascriptMothership = 'javascriptMothership',
    useExperimentalCoreUI = 'useExperimentalCoreUI',
    strictReturnUrl = 'strictReturnUrl',
}

export type ExperimentalFlags = {
    [key in ExperimentalFeatures]: boolean
}

export const CSRF_HEADER = 'X-LABKEY-CSRF';

export type LabKey = {
    container: Partial<Container>
    contextPath: string
    CSRF: string
    defaultHeaders: {[key: string]: string}
    demoMode: boolean
    devMode: boolean
    dirty: boolean
    experimental: ExperimentalFlags
    getModuleContext: any
    helpLinkPrefix: string
    homeContainer: string
    imagePath: string
    isDocumentClosed: string
    moduleContext: any
    Mothership: any
    postParameters?: any
    requiresCss?: Function
    requiresScript: Function
    Security: any
    SecurityPolicy: any
    sharedContainer: string
    submit: boolean
    unloadMessage: string
    useMDYDateParsing?: boolean
    user: Partial<User>
    uuids: Array<string>
    verbose: boolean
    vis: any
}

export interface User {
    avatar: string
    email: string
    canDelete: boolean
    canDeleteOwn: boolean
    canInsert: boolean
    canUpdate: boolean
    canUpdateOwn: boolean
    displayName: string
    id: number
    isAdmin: boolean
    isAnalyst: boolean
    isDeveloper: boolean
    isGuest: boolean
    isRootAdmin: boolean
    isSignedIn: boolean
    isSystemAdmin: boolean
    isTrusted: boolean
    phone: string
}

declare let LABKEY: LabKey;

export function getLocation(): Location {
    return window.location;
}

export function getServerContext(): LabKey {
    return LABKEY;
}

export function setGlobalUser(user: User): LabKey {
    LABKEY.user = user;
    return LABKEY;
}

// The following will be removed in favor of a proper "global" initialization pattern. For now,
// just throw an error if the world hasn't been setup (aka labkey.js wasn't loaded prior)
class _Window extends Window {
    LABKEY: any
}
declare const window: _Window;

if (!window.LABKEY) {
    throw new Error('LABKEY object is required to be initialized prior to loading the API');
}