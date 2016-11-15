/*
 * Copyright (c) 2016 LabKey Corporation
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
    homeContainer: string
    Security: any
    SecurityPolicy: any
    sharedContainer: string
    user: User
}

interface User {
    isGuest: boolean
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