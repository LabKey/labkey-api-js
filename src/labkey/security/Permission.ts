import { request } from '../Ajax'
import { buildURL } from '../ActionURL'
import { getOnSuccess, getCallbackWrapper, getOnFailure } from '../Utils'

import { roles } from './constants'

interface GetGroupPermissionsOptions {
    containerPath?: string
    failure?: () => any
    includeSubfolders?: boolean
    scope?: any
    success?: () => any
}

/**
 * Get the effective permissions for all groups within the container, optionally
 * recursing down the container hierarchy.
 * @param config A configuration object with the following properties:
 * @param {function} config.success A reference to a function to call with the API results. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>groupPermsInfo:</b> an object containing properties about the container and group permissions.
 * This object will have the following shape:
 *  <ul>
 *  <li>container
 *      <ul>
 *          <li>id: the container id</li>
 *          <li>name: the container name</li>
 *          <li>path: the container path</li>
 *          <li>isInheritingPerms: true if the container is inheriting permissions from its parent</li>
 *          <li>groups: an array of group objects, each of which will have the following properties:
 *              <ul>
 *                  <li>id: the group id</li>
 *                  <li>name: the group's name</li>
 *                  <li>type: the group's type ('g' for group, 'r' for role, 'm' for module-specific)</li>
 *                  <li>roleLabel: (DEPRECATED) a description of the group's permission role. This will correspond
 *                      to the visible labels shown on the permissions page (e.g., 'Admin (all permissions)'.</li>
 *                  <li>role: (DEPRECATED) the group's role value (e.g., 'ADMIN'). Use this property for programmatic checks.</li>
 *                  <li>permissions: (DEPRECATED) The group's effective permissions as a bit mask.
 *                          Use this with the hasPermission() method to test for specific permissions.</li>
 *                  <li>roles: An array of role unique names that this group is playing in the container. This replaces the
 *                              existing roleLabel, role and permissions properties. Groups may now play multiple roles in a container
 *                              and each role grants the user a set of permissions. Use the getRoles() method to retrieve information
 *                              about the roles, including which permissions are granted by each role.
 *                  </li>
 *                  <li>effectivePermissions: An array of effective permission unique names the group has.</li>
 *              </ul>
 *          </li>
 *          <li>children: if includeSubfolders was true, this will contain an array of objects, each of
 *              which will have the same shape as the parent container object.</li>
 *      </ul>
 *  </li>
 * </ul>
 * </li>
 * <li><b>response:</b> The XMLHttpResponse object</li>
 * </ul>
 * @param {function} [config.failure] A reference to a function to call when an error occurs. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>errorInfo:</b> an object containing detailed error information (may be null)</li>
 * <li><b>response:</b> The XMLHttpResponse object</li>
 * </ul>
 * @param {boolean} [config.includeSubfolders] Set to true to recurse down the subfolders (defaults to false)
 * @param {string} [config.containerPath] An alternate container path to get permissions from. If not specified,
 * the current container path will be used.
 * @param {object} [config.scope] A scoping object for the success and error callback functions (default to this).
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request
 * (see <a href="http://dev.sencha.com/deploy/dev/docs/?class=Ext.data.Connection&member=abort" target="_blank">Ext.data.Connection.abort</a>).
 * In server-side scripts, this method will return the JSON response object (first parameter of the success or failure callbacks.)
 */
export function getGroupPermissions(config: GetGroupPermissionsOptions): XMLHttpRequest {
    let params: any = {};

    if (config.includeSubfolders !== undefined) {
        params.includeSubfolders = config.includeSubfolders === true;
    }

    return request({
        url: buildURL('security', 'getGroupPerms.api', config.containerPath),
        params,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true /* isErrorCallback */)
    });
}

/**
 * Returns the name of the security role represented by the permissions passed as 'perms'.
 * The return value will be the name of a property in the LABKEY.Security.roles map.
 * This is a local function, and does not make a call to the server.
 * @param {int} perms The permissions set
 * @deprecated Do not use this anymore. Use the roles array in the various responses and the
 * getRoles() method to obtain extra information about each role.
 */
export function getRole(perms: number): string {
    for (var role in roles) {
        if (roles.hasOwnProperty(role)) {
            if (perms === roles[role]) {
                return role;
            }
        }
    }
}

interface GetRolesOptions {
    containerPath?: string
    failure?: () => any
    scope?: any
    success?: () => any
}

interface GetRolesResponse {
    permissions: Array<{uniqueName: string}>
    roles: Array<{permissions: Array<string>}>
}

/**
 * Returns the complete set of roles defined on the server, along with the permissions each role grants.
 * @param config A configuration object with the following properties:
 * @param {Function} config.success A reference to a function to call with the API results. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>roles:</b> An array of role objects, each of which has the following properties:
 *  <ul>
 *      <li>uniqueName: The unique name of the resource (String, typically a fully-qualified class name).</li>
 *      <li>name: The name of the role suitable for showing to a user.</li>
 *      <li>description: The description of the role.</li>
 *      <li>sourceModule: The name of the module in which the role is defined.</li>
 *      <li>permissions: An array of permissions the role grants. Each permission has the following properties:
 *          <ul>
 *              <li>uniqueName: The unique name of the permission (String, typically a fully-qualified class name).</li>
 *              <li>name: The name of the permission.</li>
 *              <li>description: A description of the permission.</li>
 *              <li>sourceModule: The module in which the permission is defined.</li>
 *          </ul>
 *      </li>
 *  </ul>
 * </li>
 * <li><b>response:</b> The XMLHttpResponse object</li>
 * </ul>
 * @param {Function} [config.failure] A reference to a function to call when an error occurs. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>errorInfo:</b> an object containing detailed error information (may be null)</li>
 * <li><b>response:</b> The XMLHttpResponse object</li>
 * </ul>
 * @param {object} [config.scope] A scoping object for the success and error callback functions (default to this).
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request
 * (see <a href="http://dev.sencha.com/deploy/dev/docs/?class=Ext.data.Connection&member=abort" target="_blank">Ext.data.Connection.abort</a>).
 * In server-side scripts, this method will return the JSON response object (first parameter of the success or failure callbacks.)
 */
export function getRoles(config: GetRolesOptions): XMLHttpRequest {
    return request({
        url: buildURL('security', 'getRoles.api', config.containerPath),
        success: getCallbackWrapper(function(data: GetRolesResponse, req: any) {
            // roles and perms are returned in two separate blocks for efficiency
            var i: number,
                j: number,
                permMap: any = {},
                perm: any,
                role: any;

            for (i = 0; i < data.permissions.length; i++) {
                perm = data.permissions[i];
                permMap[perm.uniqueName] = perm;
            }

            for (i = 0; i < data.roles.length; i++) {
                role = data.roles[i];
                for (j = 0; j < role.permissions.length; ++j) {
                    role.permissions[j] = permMap[role.permissions[j]];
                }
            }

            getOnSuccess(config).call(config.scope || this, data.roles, req);
        }, this),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true /* isErrorCallback */)
    });
}

interface GetSchemaPermissionsOptions {
    containerPath?: string
    failure?: Function
    schemaName: string
    scope?: any
    success?: Function
}

/**
 * EXPERIMENTAL! gets permissions for a set of tables within the study schema.
 * Currently only study tables have individual permissions so only works on the study schema
 * @param config A configuration object with the following properties:
 * @param {object} [config.scope] A scoping object for the success and error callback functions (default to this).
 * @param {object} [config.schemaName] Name of the schema to retrieve information on.
 * @param {string} [config.containerPath] An alternate container path to get permissions from. If not specified,
 * the current container path will be used.
 * @param {Function} config.success A reference to a function to call with the API results. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>data:</b> an object with a property named "schemas" which contains a queries object.
 * The queries object property with the name of each table/queries. So
 * schemas.study.queries.Demographics would yield the following results
 *  <ul>
 *      <li>id: The unique id of the resource (String, typically a GUID).</li>
 *      <li>name: The name of the resource suitable for showing to a user.</li>
 *      <li>description: The description of the reosurce.</li>
 *      <li>resourceClass: The fully-qualified Java class name of the resource.</li>
 *      <li>sourceModule: The name of the module in which the resource is defined and managed</li>
 *      <li>parentId: The parent resource's id (may be omitted if no parent)</li>
 *      <li>parentContainerPath: The parent resource's container path (may be omitted if no parent)</li>
 *      <li>children: An array of child resource objects.</li>
 *      <li>effectivePermissions: An array of permission unique names the current user has on the resource. This will be
 *          present only if the includeEffectivePermissions property was set to true on the config object.</li>
 *      <li>permissionMap: An object with one property per effectivePermission allowed the user. This restates
 *          effectivePermissions in a slightly more convenient way
 *  </ul>
 * </li>
 * <li><b>response:</b> The XMLHttpResponse object</li>
 * </ul>
 * @param {Function} [config.failure] A reference to a function to call when an error occurs. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>errorInfo:</b> an object containing detailed error information (may be null)</li>
 * <li><b>response:</b> The XMLHttpResponse object</li>
 * </ul>
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request
 * (see <a href="http://dev.sencha.com/deploy/dev/docs/?class=Ext.data.Connection&member=abort" target="_blank">Ext.data.Connection.abort</a>).
 * In server-side scripts, this method will return the JSON response object (first parameter of the success or failure callbacks.)
 */
export function getSchemaPermissions(config: GetSchemaPermissionsOptions): XMLHttpRequest {
    if (!config.schemaName || (config.schemaName && config.schemaName !== 'study')) {
        throw 'Method only works for the study schema';
    }

    var getResourcesConfig: any = config;

    getResourcesConfig.includeEffectivePermissions = true;
    getResourcesConfig.success = function(json: any, response: any) {
        // First lets make sure there is a study in here.
        var studyResource: any = null;
        for (var i = 0; i < json.resources.children.length; i++) {
            var resource: any = json.resources.children[i];
            if (resource.resourceClass == 'org.labkey.study.model.StudyImpl') {
                studyResource = resource;
                break;
            }
        }

        if (null == studyResource) {
            config.failure.apply(config.scope || this, [{description: 'No study found in container.'}, response]);
            return;
        }

        var result: any = {
            queries: {}
        }, dataset: any;

        for (i=0; i < studyResource.children.length; i++) {
            dataset = studyResource.children[i];
            result.queries[dataset.name] = dataset;
            dataset.permissionMap = {};
            for (var j=0; j < dataset.effectivePermissions.length; j++) {
                dataset.permissionMap[dataset.effectivePermissions[j]] = true;
            }
        }

        config.success.apply(config.scope || this, [{schemas: {study: result}}, response]);
    };

    return getSecurableResources(getResourcesConfig);
}

interface GetSecurableResourcesOptions {
    containerPath?: string
    failure?: Function
    includeEffectivePermissions?: boolean
    includeSubfolders?: boolean
    scope?: any
    success?: Function
}

/**
 * Returns the tree of securable resources from the current container downward
 * @param config A configuration object with the following properties:
 * @param {Boolean} config.includeSubfolders If set to true, the response will include subfolders
 * and their contained securable resources (defaults to false).
 * @param {Boolean} config.includeEffectivePermissions If set to true, the response will include the
 * list of effective permissions (unique names) the current user has to each resource (defaults to false).
 * These permissions are calculated based on the current user's group memberships and role assignments, and
 * represent the actual permissions the user has to these resources at the time of the API call.
 * @param {Function} config.success A reference to a function to call with the API results. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>data:</b> an object with a property named "resources" which contains the root resource.
 * Each resource has the following properties:
 *  <ul>
 *      <li>id: The unique id of the resource (String, typically a GUID).</li>
 *      <li>name: The name of the resource suitable for showing to a user.</li>
 *      <li>description: The description of the reosurce.</li>
 *      <li>resourceClass: The fully-qualified Java class name of the resource.</li>
 *      <li>sourceModule: The name of the module in which the resource is defined and managed</li>
 *      <li>parentId: The parent resource's id (may be omitted if no parent)</li>
 *      <li>parentContainerPath: The parent resource's container path (may be omitted if no parent)</li>
 *      <li>children: An array of child resource objects.</li>
 *      <li>effectivePermissions: An array of permission unique names the current user has on the resource. This will be
 *          present only if the includeEffectivePermissions property was set to true on the config object.</li>
 *  </ul>
 * </li>
 * <li><b>response:</b> The XMLHttpResponse object</li>
 * </ul>
 * @param {Function} [config.failure] A reference to a function to call when an error occurs. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>errorInfo:</b> an object containing detailed error information (may be null)</li>
 * <li><b>response:</b> The XMLHttpResponse object</li>
 * </ul>
 * @param {object} [config.scope] A scoping object for the success and error callback functions (default to this).
 * @param {string} [config.containerPath] An alternate container path to get permissions from. If not specified,
 * the current container path will be used.
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request
 * (see <a href="http://dev.sencha.com/deploy/dev/docs/?class=Ext.data.Connection&member=abort" target="_blank">Ext.data.Connection.abort</a>).
 * In server-side scripts, this method will return the JSON response object (first parameter of the success or failure callbacks.)
 */
export function getSecurableResources(config: GetSecurableResourcesOptions): XMLHttpRequest {
    var params: any = {};

    if (config.includeSubfolders != undefined) {
        params.includeSubfolders = config.includeSubfolders === true;
    }
    if (config.includeEffectivePermissions != undefined) {
        params.includeEffectivePermissions = config.includeEffectivePermissions === true;
    }

    return request({
        url: buildURL('security', 'getSecurableResources.api', config.containerPath),
        params,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true /* isErrorCallback */)
    })
}

interface GetUserPermissionsOptions {
    containerPath?: string
    failure?: () => any
    includeSubfolders?: boolean
    scope?: any
    success?: () => any
    userEmail?: string
    userId?: number
}

/**
 * Returns information about a user's permissions within a container. If you don't specify a user id, this
 * will return information about the current user.
 * @param config A configuration object containing the following properties
 * @param {int} config.userId The id of the user. Omit to get the current user's information
 * @param {string} config.userEmail The email address (user name) of the user (specify only userId or userEmail, not both)
 * @param {Function} config.success A reference to a function to call with the API results. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>userPermsInfo:</b> an object containing properties about the user's permissions.
 * This object will have the following shape:
 *  <ul>
 *  <li>container: information about the container and the groups the user belongs to in that container
 *      <ul>
 *          <li>id: the container id</li>
 *          <li>name: the container name</li>
 *          <li>path: the container path</li>
 *          <li>roleLabel: (DEPRECATED) a description of the user's permission role in this container. This will correspond
 *               to the visible labels shown on the permissions page (e.g., 'Admin (all permissions)'.</li>
 *          <li>role: (DEPRECATED) the user's role value (e.g., 'ADMIN'). Use this property for programmatic checks.</li>
 *          <li>permissions: (DEPRECATED) The user's effective permissions in this container as a bit mask.
 *               Use this with the hasPermission() method to test for specific permissions.</li>
 *          <li>roles: An array of role unique names that this user is playing in the container. This replaces the
 *               existing roleLabel, role and permissions properties. Users may now play multiple roles in a container
 *               and each role grants the user a set of permissions. Use the getRoles() method to retrieve information
 *               about the roles, including which permissions are granted by each role.
 *          </li>
 *          <li>effectivePermissions: An array of effective permission unique names the user has.</li>
 *          <li>groups: an array of group objects to which the user belongs, each of which will have the following properties:
 *              <ul>
 *                  <li>id: the group id</li>
 *                  <li>name: the group's name</li>
 *                  <li>roleLabel: (DEPRECATED) a description of the group's permission role. This will correspond
 *                      to the visible labels shown on the permissions page (e.g., 'Admin (all permissions)'.</li>
 *                  <li>role: (DEPRECATED) the group's role value (e.g., 'ADMIN'). Use this property for programmatic checks.</li>
 *                  <li>permissions: (DEPRECATED) The group's effective permissions as a bit mask.
 *                          Use this with the hasPermission() method to test for specific permissions.</li>
 *                  <li>roles: An array of role unique names that this group is playing in the container. This replaces the
 *                              existing roleLabel, role and permissions properties. Groups may now play multiple roles in a container
 *                              and each role grants the user a set of permissions. Use the getRoles() method to retrieve information
 *                              about the roles, including which permissions are granted by each role.
 *                  </li>
 *                  <li>effectivePermissions: An array of effective permission unique names the group has.</li>
 *              </ul>
 *          </li>
 *          <li>children: if includeSubfolders was true, this will contain an array of objects, each of
 *              which will have the same shape as the parent container object.</li>
 *      </ul>
 *  </li>
 *  <li>user: information about the requested user
 *      <ul>
 *          <li>userId: the user's id</li>
 *          <li>displayName: the user's display name</li>
 *      </ul>
 *  </li>
 * </ul>
 * </li>
 * <li><b>response:</b> The XMLHttpResponse object</li>
 * </ul>
 * @param {function} [config.failure] A reference to a function to call when an error occurs. This
 * function will be passed the following parameters:
 * <ul>
 * <li><b>errorInfo:</b> an object containing detailed error information (may be null)</li>
 * <li><b>response:</b> The XMLHttpResponse object</li>
 * </ul>
 * @param {boolean} [config.includeSubfolders] Set to true to recurse down the subfolders (defaults to false)
 * @param {string} [config.containerPath] An alternate container path to get permissions from. If not specified,
 * the current container path will be used.
 * @param {Object} [config.scope] A scoping object for the success and error callback functions (default to this).
 * @returns {Mixed} In client-side scripts, this method will return a transaction id
 * for the async request that can be used to cancel the request
 * (see <a href="http://dev.sencha.com/deploy/dev/docs/?class=Ext.data.Connection&member=abort" target="_blank">Ext.data.Connection.abort</a>).
 * In server-side scripts, this method will return the JSON response object (first parameter of the success or failure callbacks.)
 */
export function getUserPermissions(config: GetUserPermissionsOptions): XMLHttpRequest {
    let params: any = {};

    // TODO: These undefined checked should be !==
    if (config.userId != undefined) {
        params.userId = config.userId;
    }
    else if (config.userEmail != undefined) {
        params.userEmail = config.userEmail;
    }

    if (config.includeSubfolders != undefined) {
        params.includeSubfolders = config.includeSubfolders === true;
    }

    return request({
        url: buildURL('security', 'getUserPerms.api', config.containerPath),
        params,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true /* isErrorCallback */)
    })
}

/**
 * Returns true if the permission passed in 'desiredPermission' is in the permissions
 * array passed as 'effectivePermissions'. This is a local function and does not make a call to the server.
 * @param {Array} effectivePermissions The permission set, typically retrieved for a given user or group.
 * @param {String} desiredPermission A specific permission bit to check for.
 * @returns {boolean}
 */
export function hasEffectivePermission(effectivePermissions: Array<string>, desiredPermission: string): boolean {
    for (var i = 0; i < effectivePermissions.length; i++) {
        if (effectivePermissions[i] === desiredPermission) {
            return true;
        }
    }

    return false;
}

/**
 * Returns true if the permission passed in 'perm' is on in the permissions
 * set passed as 'perms'. This is a local function and does not make a call to the server.
 * @param {int} perms The permission set, typically retrieved for a given user or group.
 * @param {int} perm A specific permission bit to check for.
 */
export function hasPermission(perms: number, perm: number): number {
    // TODO: This says it returns true (or implied false), but it really returns 0 or 1.
    // Could change to (perms & perm) === 1, however, that would change the return type.
    return perms & perm;
}