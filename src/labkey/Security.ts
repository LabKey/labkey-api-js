/*
 * Copyright (c) 2017 LabKey Corporation
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
import {
    currentContainer,
    currentUser,
    effectivePermissions,
    PermissionRoles,
    PermissionTypes,
    permissions,
    roles,
    systemGroups
} from './security/constants'
import {
    ContainerHierarchy,
    createContainer,
    CreateContainerOptions,
    deleteContainer,
    DeleteContainerOptions,
    getContainers,
    GetContainersOptions,
    getFolderTypes,
    GetFolderTypesOptions,
    getHomeContainer,
    getModules,
    GetModulesOptions,
    getReadableContainers,
    GetReadableContainersOptions,
    getSharedContainer,
    moveContainer,
    MoveContainerOptions,
} from './security/Container'
import {
    getGroupPermissions,
    getRole,
    getRoles,
    getSchemaPermissions,
    getSecurableResources,
    getUserPermissions,
    hasEffectivePermission,
    hasPermission
} from './security/Permission'
import {
    createNewUser,
    ensureLogin,
    getUsers,
    getUsersWithPermissions
} from './security/User'
import {
    addGroupMembers,
    createGroup,
    deleteGroup,
    getGroupsForCurrentUser,
    removeGroupMembers,
    renameGroup
} from './security/Group'
import {
    deletePolicy,
    getPolicy,
    savePolicy
} from './security/Policy'

export {
    /* constants */
    currentContainer,
    currentUser,
    effectivePermissions,
    PermissionRoles,
    PermissionTypes,
    permissions,
    roles,
    systemGroups,

    /* interfaces */
    ContainerHierarchy,
    CreateContainerOptions,
    DeleteContainerOptions,
    GetContainersOptions,
    GetFolderTypesOptions,
    GetModulesOptions,
    GetReadableContainersOptions,
    MoveContainerOptions,

    /* methods */
    addGroupMembers,
    createContainer,
    createGroup,
    createNewUser,
    deleteContainer,
    deleteGroup,
    deletePolicy,
    ensureLogin,
    getContainers,
    getFolderTypes,
    getGroupPermissions,
    getGroupsForCurrentUser,
    getHomeContainer,
    getModules,
    getReadableContainers,
    getPolicy,
    getRole,
    getRoles,
    getSchemaPermissions,
    getSecurableResources,
    getSharedContainer,
    getUserPermissions,
    getUsers,
    getUsersWithPermissions,
    hasEffectivePermission,
    hasPermission,
    moveContainer,
    removeGroupMembers,
    renameGroup,
    savePolicy
}