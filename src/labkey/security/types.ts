/*
 * Copyright (c) 2020 LabKey Corporation
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
export interface Group {
    /** An array of effective permission unique names the group has. */
    effectivePermissions: string[];
    /** Subgroups of this group. */
    groups: Group[];
    /** The unique id of the group. */
    id: number;
    /** True if this group is defined at the project level. */
    isProjectGroup: boolean;
    /** True if this group is defined at the system level. */
    isSystemGroup: boolean;
    /** The name of the group. */
    name: string;
    /**
     * @deprecated
     * The group's effective permissions as a bit mask.
     */
    permissions: number;
    /**
     * @deprecated
     * The group's role value (e.g., 'ADMIN'). Use this property for programmatic checks.
     */
    role: string;
    /**
     * @deprecated
     * A description of the group's permission role. This will correspond
     * to the visible labels shown on the permissions page (e.g., 'Admin (all permissions)'.
     */
    roleLabel: string;
    /**
     * An array of role unique names that this group is playing in the container. This replaces the
     * existing roleLabel, role and permissions properties. Groups may now play multiple roles in a container
     * and each role grants the user a set of permissions. Use the getRoles() method to retrieve information
     * about the roles, including which permissions are granted by each role.
     */
    roles: string[];
    /** The group's type ('g' for group, 'r' for role, 'm' for module-specific). */
    type: string;
}

export interface SecurableResource {
    /** An array of child resource objects. */
    children: SecurableResource[];
    /** The description of the resource. */
    description: string;
    /**
     * An array of permission unique names the current user has on the resource.
     * This will be present only if the includeEffectivePermissions property
     * was set to true on the config object.
     */
    effectivePermissions?: string[];
    /** The unique id of the resource (String, typically a GUID). */
    id: string;
    /** The name of the resource suitable for showing to a user. */
    name: string;
    /** The parent resource's container path (may be omitted if no parent). */
    parentContainerPath?: string;
    /** The parent resource's id (may be omitted if no parent). */
    parentId?: string;
    /** The fully-qualified Java class name of the resource. */
    resourceClass: string;
}
