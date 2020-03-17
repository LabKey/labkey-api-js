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
    activeModules: Array<string>
    folderType: string
    formats: {
        dateFormat: string
        dateTimeFormat: string
        numberFormat: string
    }
    hasRestrictedActiveModule: boolean
    iconHref: string
    id: string
    isContainerTab: boolean
    isWorkbook: boolean
    name: string
    parentId: string
    parentPath: string
    path: string
    sortOrder: number
    startUrl: string
    title: string
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
    container: Container
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
    Security: any
    SecurityPolicy: any
    sharedContainer: string
    submit: boolean
    unloadMessage: string
    user: User
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