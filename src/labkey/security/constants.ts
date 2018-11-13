/*
 * Copyright (c) 2017-2018 LabKey Corporation
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
// Container, User imported due to TS4023
// https://github.com/Microsoft/TypeScript/issues/5711#issuecomment-157793294
import { Container, getServerContext, User } from '../constants'

const LABKEY = getServerContext();

/**
 * Exposes limited information about the current container. This property returns a JavaScript object
 * with the following properties:
 * <ul>
 * <li>id: the container's unique id (entityid)</li>
 * <li>name: the name of the container</li>
 * <li>path: the path of the current container</li>
 * <li>type: the type of container, either project, folder or workbook</li>
 * </ul>
 */
export const currentContainer = LABKEY.container;

/**
 * Exposes limited information about the current user. This property returns a JavaScript object
 * with the following properties:
 * <ul>
 * <li>id: the user's unique id number</li>
 * <li>displayName: the user's display name</li>
 * <li>email: the user's email address</li>
 * <li>canInsert: set to true if this user can insert data in the current folder</li>
 * <li>canUpdate: set to true if this user can update data in the current folder</li>
 * <li>canUpdateOwn: set to true if this user can update data this user created in the current folder</li>
 * <li>canDelete: set to true if this user can delete data in the current folder</li>
 * <li>canDeleteOwn: set to true if this user can delete data this user created in the current folder</li>
 * <li>isAdmin: set to true if this user has admin permissions in the current folder</li>
 * <li>isGuest: set to true if this user is the guest (anonymous) user</li>
 * <li>isSystemAdmin: set to true if this user is a system administrator</li>
 * <li>isDeveloper: set to true if this user is a developer</li>
 * <li>isSignedIn: set to true if this user is signed in</li>
 * </ul>
 */
export const currentUser = LABKEY.user;

/**
 * A map of commonly used effective permissions supported in the LabKey Server.
 * You can use these values with the hasEffectivePermission() method to test if
 * a user or group has a particular permission. The values in this map
 * are as follows:
 * <ul>
 * <li>read</li>
 * <li>insert</li>
 * <li>update</li>
 * <li>del</li>
 * <li>readOwn</li>
 * </ul>
 * For example, to refer to the update permission, the syntax would be:<br/>
 * <pre><code>LABKEY.Security.effectivePermissions.update</code></pre>
 */
export const effectivePermissions = {
    insert: 'org.labkey.api.security.permissions.InsertPermission',
    read: 'org.labkey.api.security.permissions.ReadPermission',
    admin: 'org.labkey.api.security.permissions.AdminPermission',
    del: 'org.labkey.api.security.permissions.DeletePermission',
    readOwn: 'org.labkey.api.security.permissions.ReadSomePermission',
    update: 'org.labkey.api.security.permissions.UpdatePermission'
};

/**
 * A map of the various permission bits supported in the LabKey Server.
 * You can use these values with the hasPermission() method to test if
 * a user or group has a particular permission. The values in this map
 * are as follows:
 * <ul>
 * <li>read</li>
 * <li>insert</li>
 * <li>update</li>
 * <li>del</li>
 * <li>readOwn</li>
 * <li>updateOwn</li>
 * <li>deleteOwn</li>
 * <li>all</li>
 * </ul>
 * For example, to refer to the update permission, the syntax would be:<br/>
 * <pre><code>LABKEY.Security.permissions.update</code></pre>
 */
export const permissions = {
    read: 1,
    insert: 2,
    update: 4,
    del: 8,
    readOwn: 16,
    updateOwn: 64,
    deleteOwn: 128,
    admin: 32768,
    all: 65535
};

/**
 * A map of the various permission roles exposed in the user interface.
 * The members are as follows:
 * <ul>
 * <li>admin</li>
 * <li>editor</li>
 * <li>author</li>
 * <li>reader</li>
 * <li>restrictedReader</li>
 * <li>noPerms</li>
 * </ul>
 * For example, to refer to the author role, the syntax would be:<br/>
 * <pre><code>LABKEY.Security.roles.author</code></pre>
 */
export const roles: {
    [key:string]: number
} = {
    admin: 65535,
    editor: 15,
    author: 195,
    reader: 1,
    restrictedReader: 16,
    submitter: 2,
    noPerms: 0
};

/**
 * A map of the special system group ids. These ids are assigned by the system
 * at initial startup and are constant across installations. The values in
 * this map are as follows:
 * <ul>
 * <li>administrators</li>
 * <li>users</li>
 * <li>guests</li>
 * <li>developers</li>
 * </ul>
 * For example, to refer to the administrators group, the syntax would be:<br/>
 * <pre><code>LABKEY.Security.systemGroups.administrators</code></pre>
 */
export const systemGroups = {
    administrators: -1,
    users: -2,
    guests: -3,
    developers: -4
};