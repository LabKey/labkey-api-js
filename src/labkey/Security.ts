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
    FolderType,
    FolderTypeWebParts,
    getContainers,
    GetContainersOptions,
    getFolderTypes,
    GetFolderTypesOptions,
    GetFolderTypesResponse,
    getHomeContainer,
    getModules,
    GetModulesModules,
    GetModulesOptions,
    GetModulesResponse,
    getReadableContainers,
    GetReadableContainersOptions,
    getSharedContainer,
    ModuleProperty,
    moveContainer,
    MoveContainerOptions,
} from './security/Container'
import {
    getGroupPermissions,
    GetGroupPermissionsOptions,
    getRole,
    getRoles,
    GetRolesOptions,
    getSchemaPermissions,
    GetSchemaPermissionsOptions,
    getSecurableResources,
    GetSecurableResourcesOptions,
    getUserPermissions,
    GetUserPermissionsOptions,
    GetUserPermissionsResponse,
    hasEffectivePermission,
    hasPermission,
    PermissionsContainer,
    PermissionsResponse,
    Role,
    RolePermission,
    SchemaPermissionsResponse,
    SecurableResourceWithPermissions,
    UserPermissionsContainer,
} from './security/Permission'
import {
    createNewUser,
    CreateNewUserOptions,
    CreateNewUserResponse,
    ensureLogin,
    EnsureLoginOptions,
    getUsers,
    GetUsersOptions,
    GetUsersResponse,
    getUsersWithPermissions,
    GetUsersWithPermissionsOptions,
    NewUser
} from './security/User'
import {
    addGroupMembers,
    AddGroupMembersOptions,
    createGroup,
    CreateGroupOptions,
    CreateGroupResponse,
    deleteGroup,
    DeleteGroupOptions,
    getGroupsForCurrentUser,
    GetGroupsForCurrentUserOptions,
    GetGroupsForCurrentUserResponse,
    removeGroupMembers,
    RemoveGroupMembersOptions,
    renameGroup,
    RenameGroupOptions,
    RenameGroupResponse
} from './security/Group'
import {
    deletePolicy,
    DeletePolicyOptions,
    getPolicy,
    GetPolicyOptions,
    Policy,
    savePolicy,
    SavePolicyOptions
} from './security/Policy'
import {
    Group,
    SecurableResource
} from './security/types'

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
    AddGroupMembersOptions,
    ContainerHierarchy,
    CreateContainerOptions,
    CreateGroupOptions,
    CreateGroupResponse,
    CreateNewUserOptions,
    CreateNewUserResponse,
    DeleteContainerOptions,
    DeleteGroupOptions,
    DeletePolicyOptions,
    EnsureLoginOptions,
    FolderType,
    FolderTypeWebParts,
    GetContainersOptions,
    GetFolderTypesOptions,
    GetFolderTypesResponse,
    GetGroupPermissionsOptions,
    GetGroupsForCurrentUserOptions,
    GetGroupsForCurrentUserResponse,
    GetModulesModules,
    GetModulesOptions,
    GetModulesResponse,
    GetPolicyOptions,
    GetReadableContainersOptions,
    GetRolesOptions,
    GetSchemaPermissionsOptions,
    GetSecurableResourcesOptions,
    GetUserPermissionsOptions,
    GetUserPermissionsResponse,
    GetUsersOptions,
    GetUsersResponse,
    GetUsersWithPermissionsOptions,
    Group,
    ModuleProperty,
    MoveContainerOptions,
    NewUser,
    PermissionsContainer,
    PermissionsResponse,
    Policy,
    RemoveGroupMembersOptions,
    RenameGroupOptions,
    RenameGroupResponse,
    Role,
    RolePermission,
    SavePolicyOptions,
    SchemaPermissionsResponse,
    SecurableResource,
    SecurableResourceWithPermissions,
    UserPermissionsContainer,

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