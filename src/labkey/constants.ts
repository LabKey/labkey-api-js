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
    activeModules: string[];
    /** The name of the container's folder type. */
    folderType: string;
    /** Date format settings for this container. */
    formats: {
        dateFormat: string;
        dateTimeFormat: string;
        numberFormat: string;
    };
    /** True if any active modules in this container require site permissions. */
    hasRestrictedActiveModule: boolean;
    /** Server relative icon URL for this container. */
    iconHref: string;
    /** GUID of this container. */
    id: string;
    /** Indicates if this container is a Container Tab. */
    isContainerTab: boolean;
    /** Indicates if this container is a workbook. */
    isWorkbook: boolean;
    /** Name of the container. This is used in the container's path. */
    name: string;
    /** GUID of this container's parent container. */
    parentId: string;
    /** Path of this container's parent container. */
    parentPath: string;
    /** Path of this container. */
    path: string;
    /** The relative sort order of the requested container */
    sortOrder: number;
    /** Server relative start URL for this container. */
    startUrl: string;
    /** An optional non-unique title for the container. */
    title: string;
    /** Type of this container. (e.g. "project", "folder"). */
    type: string;
}

export interface Project {
    /** GUID of this project. */
    id: string;
    /** Name of the project. This is used in the project's container path. */
    name: string;
    /** Path of this project. */
    path: string;
    /** GUID of the root container, which is the parent for the project. */
    rootId: string;
    /** Title of the project. If none set, this will be the same as the project name. */
    title: string;
}

export enum ExperimentalFeatures {
    containerRelativeURL = 'containerRelativeURL',
    disableGuestAccount = 'disableGuestAccount',
    javascriptErrorServerLogging = 'javascriptErrorServerLogging',
    javascriptMothership = 'javascriptMothership',
    useExperimentalCoreUI = 'useExperimentalCoreUI'
}

/** THe different types of audit behaviors for query requests. May be used to override behavior for a specific requests. */
export enum AuditBehaviorTypes {
    NONE = "NONE",
    DETAILED = "DETAILED",
    SUMMARY = "SUMMARY"
}

export type ExperimentalFlags = {
    [key in ExperimentalFeatures]: boolean
}

export const CSRF_HEADER = 'X-LABKEY-CSRF';

export type LabKey = {
    adminOnlyMode?: boolean;
    analyticProviders?: { [providerName: string]: string };
    container: Partial<Container>;
    contextPath: string;
    CSRF: string;
    defaultHeaders: { [key: string]: string };
    demoMode: boolean;
    devMode: boolean;
    dirty: boolean;
    experimental: ExperimentalFlags;
    extDateInputFormat: string;
    extDefaultDateFormat: string;
    extDefaultDateTimeFormat: string;
    extDefaultNumberFormat?: string;
    extJsRoot: string;
    extThemeName_42: string;
    getModuleContext: any;
    hash: string;
    helpLinkPrefix: string;
    homeContainer: string;
    imagePath: string;
    impersonatingUser?: Partial<UserWithPermissions>;
    isDocumentClosed: string;
    jdkJavaDocLinkPrefix: string;
    moduleContext?: { [key: string]: any };
    Mothership: any;
    pageAdminMode: boolean;
    postParameters?: any;
    project: Project;
    requiresCss?: Function;
    requiresScript: Function;
    Security: any;
    SecurityPolicy: any;
    serverName: string;
    sharedContainer?: string;
    submit: boolean;
    tours: any;
    unloadMessage: string;
    useMDYDateParsing?: boolean;
    user: Partial<UserWithPermissions>;
    uuids: string[];
    verbose: boolean;
    versionString: string;
    vis: any;
    WebSocket: any;
}

export interface User {
    avatar: string;
    email: string;
    displayName: string;
    id: number;
    phone: string;
    // Some LabKey Server API responses specify "userId" in addition to "id" when serializing a User response.
    // This will not always be available but is made available in the typings for ease of use of this interface.
    userId?: number;
}

export interface UserWithPermissions extends User {
    canDelete: boolean;
    canDeleteOwn: boolean;
    canInsert: boolean;
    canUpdate: boolean;
    canUpdateOwn: boolean;
    isAdmin: boolean;
    isAnalyst: boolean;
    isDeveloper: boolean;
    isGuest: boolean;
    isRootAdmin: boolean;
    isSignedIn: boolean;
    isSystemAdmin: boolean;
    isTrusted: boolean;
    maxAllowedPhi: string;
}

declare let LABKEY: LabKey;

export function getLocation(): Location {
    return window.location;
}

export function getServerContext(): LabKey {
    return LABKEY;
}

export function setGlobalUser(user: UserWithPermissions): LabKey {
    LABKEY.user = user;
    return LABKEY;
}

// The following will be removed in favor of a proper "global" initialization pattern. For now,
// just throw an error if the world hasn't been setup (aka labkey.js wasn't loaded prior)
/**
 * @hidden
 * @private
 */
class _Window extends Window {
    LABKEY: any
}

/**
 * @hidden
 * @private
 */
declare const window: _Window;

if (!window.LABKEY) {
    throw new Error('LABKEY object is required to be initialized prior to loading the API');
}