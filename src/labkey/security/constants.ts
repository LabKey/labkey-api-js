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
import { getServerContext } from '../constants';
import { hasEffectivePermission } from './Permission';

/**
 * Exposes limited information about the current container.
 */
export const currentContainer = getServerContext().container;

/**
 * Exposes limited information about the current user.
 */
export const currentUser = getServerContext().user;

/** An enumeration of commonly used permission roles supported in LabKey Server. */
export enum PermissionRoles {
    ApplicationAdmin = 'org.labkey.api.security.roles.ApplicationAdminRole',
    Author = 'org.labkey.api.security.roles.AuthorRole',
    Editor = 'org.labkey.api.security.roles.EditorRole',
    EditorWithoutDelete = 'org.labkey.api.security.roles.EditorWithoutDeleteRole',
    FolderAdmin = 'org.labkey.api.security.roles.FolderAdminRole',
    ProjectAdmin = 'org.labkey.api.security.roles.ProjectAdminRole',
    Reader = 'org.labkey.api.security.roles.ReaderRole',
}

/**
 * An enumeration of commonly used permission types supported in LabKey Server.
 * This can be used in conjunction with the hasEffectivePermission() method to test if
 * a user or group has a particular permission.
 */
export enum PermissionTypes {
    AddUser = 'org.labkey.api.security.permissions.AddUserPermission',
    Admin = 'org.labkey.api.security.permissions.AdminPermission',
    AdminOperationsPermission = 'org.labkey.api.security.permissions.AdminOperationsPermission',
    ApplicationAdmin = 'org.labkey.api.security.permissions.ApplicationAdminPermission',
    CanSeeAuditLog = 'org.labkey.api.audit.permissions.CanSeeAuditLogPermission',
    CanSeeGroupDetails = 'org.labkey.api.security.permissions.SeeGroupDetailsPermission',
    CanSeeUserDetails = 'org.labkey.api.security.permissions.SeeUserDetailsPermission',
    Delete = 'org.labkey.api.security.permissions.DeletePermission',
    DesignAssay = 'org.labkey.api.assay.security.DesignAssayPermission',
    DesignDataClass = 'org.labkey.api.security.permissions.DesignDataClassPermission',
    DesignList = 'org.labkey.api.lists.permissions.DesignListPermission',
    DesignSampleSet = 'org.labkey.api.security.permissions.DesignSampleTypePermission',
    DesignStorage = 'org.labkey.api.inventory.security.StorageDesignPermission',
    EditSharedView = 'org.labkey.api.security.permissions.EditSharedViewPermission',
    EditStorageData = 'org.labkey.api.inventory.security.StorageDataUpdatePermission',
    Insert = 'org.labkey.api.security.permissions.InsertPermission',
    ManagePicklists = 'org.labkey.api.lists.permissions.ManagePicklistsPermission',
    ManageSampleWorkflows = 'org.labkey.api.security.permissions.SampleWorkflowJobPermission',
    MoveEntities = 'org.labkey.api.security.permissions.MoveEntitiesPermission',
    QCAnalyst = 'org.labkey.api.security.permissions.QCAnalystPermission',
    Read = 'org.labkey.api.security.permissions.ReadPermission',
    ReadAssay = 'org.labkey.api.security.permissions.AssayReadPermission',
    ReadDataClass = 'org.labkey.api.security.permissions.DataClassReadPermission',
    ReadMedia = 'org.labkey.api.security.permissions.MediaReadPermission',
    ReadNotebooks = 'org.labkey.api.security.permissions.NotebookReadPermission',
    ReadSome = 'org.labkey.api.security.permissions.ReadSomePermission',
    SampleWorkflowDelete = 'org.labkey.api.security.permissions.SampleWorkflowDeletePermission',
    ShareReportPermission = 'org.labkey.api.reports.permissions.ShareReportPermission',
    Update = 'org.labkey.api.security.permissions.UpdatePermission',
    UserManagement = 'org.labkey.api.security.permissions.UserManagementPermission',
}

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
 * @deprecated Use {@link PermissionTypes} instead.
 * For example, to refer to the update permission, the syntax would be:<br/>
 * <pre><code>LABKEY.Security.effectivePermissions.update</code></pre>
 */
export const effectivePermissions = {
    insert: PermissionTypes.Insert,
    read: PermissionTypes.Read,
    admin: PermissionTypes.Admin,
    del: PermissionTypes.Delete,
    readOwn: PermissionTypes.ReadSome,
    update: PermissionTypes.Update,
};

/**
 * @deprecated Do not use this. Use {@link PermissionTypes} and {@link hasEffectivePermission} instead.
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
    all: 65535,
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
    developers: -4,
};
