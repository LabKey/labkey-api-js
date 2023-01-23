## TBD - TBD
- Add `PermissionTypes.CanSeeUserDetails`

## 1.18.2 - 2023-01-20
- Add `PermissionTypes.CanSeeGroupDetails`

## 1.18.1 - 2023-01-09
- [Issue 47044](https://www.labkey.org/home/Developer/issues/issues-details.view?issueId=47044): Decode the plus sign that may be part of a folder path

## 1.18.0 - 2023-01-03
- [Issue 47010](https://www.labkey.org/home/Developer/issues/issues-details.view?issueId=47010): Add `includeViewDataUrl` and `includeTitle` parameters to `Query.getQueries()`. Setting these to `false` (along with existing parameter `includeColumns`) can improve performance of getQueries() calls.

## 1.17.1 - 2022-12-19
- Fix URI decoding for paths with encoded characters in container names

## 1.17.0 - 2022-12-15
- Add PrimaryStorage as a new STORAGE_TYPE equivalent to Freezer for room-temp storage

## 1.16.1 - 2022-09-22
- Add `PermissionRoles.EditorWithoutDelete`

## 1.16.0 - 2022-09-20
- Add support for creating Freezer Manager freezer hierarchies via StorageController APIs
  - earliest compatible LabKey Server version: 22.10.0
  - via Storage namespace: createStorageItem, updateStorageItem, deleteStorageItem

## 1.15.0 - 2022-06-16
- Migrate the convertToTable and convertToExcel utilities from LABKEY.js.

## 1.14.2 - 2022-06-06
- Add package dev dependency on `@labkey/eslint-config-base`.
- Add `.eslintignore` and `.eslintrc.json` linting configuration files.
- Ran `npx eslint --fix /src` to perform lint of all current source files.

## 1.14.1 - 2022-06-06
- Add excludeSessionView param for getQueryViews
- Add saveSessionView util

## 1.14.0 - 2022-06-02
* Package updates.
* [Issue 45592](https://www.labkey.org/home/Developer/issues/issues-details.view?issueId=45592): Remove html encoding of name/value for form submission

## 1.13.0 - 2022-05-31
- Issue 45270: Add AdminOperationsPermission

## 1.12.1 - 2022-05-13
- Issue 45091: savePolicy update to support unwrapped policy object

## 1.12.0 - 2022-05-03
- Adjust request to enable reading error messages on failed downloads

## 1.11.0 - 2022-04-28
- Export `ActionURL.getPathFromLocation()` and update to accept input parameters for `pathname` and `contextPath`.
- Add `contextPath` as a part of the return value from `ActionURL.getPathFromLocation()`.
- Export `Project` interface.

## 1.10.0 - 2022-02-28
- Add getLabKeySqlOperator to IFilterType

## 1.9.0 - 2022-02-16
- Add new reader permission classes

## 1.8.0 - 2022-01-31
- Add new storage permission classes

## 1.7.3 - 2022-01-21
- Update interface of `Query.saveQueryViews`, fixing types and adding supported options

## 1.7.2 - 2022-01-04
- Add setGenId, getGenId methods to Experiment

## 1.7.1 - 2021-12-23
- Add validateNameExpressions, getDomainNamePreviews methods to Domain

## 1.7.0 - 2021-12-02
- Package updates.
- Rehydrate `package-lock.json`.
- Update configuration of TypeDoc to align with latest version. Breaking changes had been introduced with `v0.22.x`.
- [Issue 41034](https://www.labkey.org/home/Developer/issues/issues-details.view?issueId=41034): Export most types defined by the package to improve documentation and support external usage of the types.

## 1.6.10 - 2021-11-30
- Add `currentAndSubfoldersPlusShared` container filter type to enumeration.
- Allow for `effectivePermissions` to be declared on a `Container`. Only relevant when supplied by certain endpoints, so it is marked as optional.
- Export `Security` interfaces so they are published to public typings.

## 1.6.9 - 2021-11-10
- Add SAMPLE_ALIQUOT_PROTOCOL const to Experiment

## 1.6.8 - 2021-10-27
- importRun: Add support for workflowTask param.

## 1.6.7 - 2021-08-25
- InsertRows/UpdateRows: Add capability to parse and transform row data into FormData when File data is present. 
  This is accessible via a configuration flag `autoFormFileData`. 

## 1.6.6 - 2021-08-13
- SaveRows: Update interface with schemaName/queryName (thanks @bbimber).

## 1.6.5 - 2021-08-04
- QueryColumn: add `nameExpression` to interface

## 1.6.4 - 2021-07-26
- Add the `allowCrossRunFileInputs` flag to the `Assay.importRun()` API

## 1.6.3 - 2021-07-12
- Add `includeTriggers` option to `Query.getQueryDetails`

## 1.6.2 - 2021-07-07
- Update PermissionTypes.DesignSampleSet

## 1.6.1 - 2021-06-25
- Item 9807: Domain properties APIs: `Domain.getProperties()`, `Domain.getPropertyUsages()`, `Domain.updateDomain()`

## 1.6.0 - 2021-06-10
- Item 8958: Add permission classes for AddUserPermission and CanSeeAuditLogPermission

## 1.5.0 - 2021-05-13
- Item 8709: Add permission class for managing sample picklists

## 1.4.0 - 2021-05-01
- Item 8670: Add ontology based filters for data region filtering

## 1.3.0 - 2021-04-15
- Item 8735: Allow for FormData to be passed via SendRequestOptions

## 1.2.2 - 2021-04-05
- Add runProtocolLsid for Experiment.LineageOptions

## 1.2.1 - 2021-03-30
- maxAllowedPHI renamed to maxAllowedPhi

## 1.2.0 - 2021-03-30
- Add maxAllowedPHI to UserWithPermissions

## 1.1.9 - 2021-02-23
- Add enumeration for Security.PermissionRoles
- Correct controller name "specimens-api" -> "specimen-api" 

## 1.1.8 - 2021-02-19
- Issue 41508: LABKEY.App change to use document.readyState and readystatechange to update isDOMContentLoaded prop. 
- Support specimen feature migration rename of `study-samples-api` to `specimen-api`.
- Fix for Query `Response` to support response when `includeMetadata` flag is set to false.
- Add "title" property to the Project interface

## 1.1.7 - 2021-01-11
- Add optional fields to assay IImportRunOptions

## 1.1.6 - 2021-01-07
- Add `ActionURL.getReturnUrl`

## 1.1.4 - 2020-12-15
- Add optional useAsync parameter to IImportDataOptions

## 1.1.3 - 2020-12-10
- Update TypeDoc to `0.20.0-beta.26` and update our `typedoc.js` to improve documentation layout.
- Move "fieldKey" modules to top-level so they better align with how they're actually exported.
- Improve documentation for filters and their types. Done as part of an exercise to see how TypeDoc handled inline docs.
- Fix issues [42014](https://www.labkey.org/home/Developer/issues/issues-details.view?issueId=42014) and [40724](https://www.labkey.org/home/Developer/issues/issues-details.view?issueId=40724) with improvements to `Domain` documentation.
- Package updates.

## 1.1.2 - 2020-12-09
- [41969](https://www.labkey.org/home/Developer/issues/issues-details.view?issueId=41969): Fix MultiRequest to return instance. Add unit tests.

## 1.1.1 - 2020-09-18
- Add additional properties exposed via `getServerContext()` to typings

## 1.1.0 - 2020-08-27
- Add optional auditUserComment parameter to request objects for inclusion in some audit log records

## 1.0.2 - 2020-08-07
- Clean-up distribution

## 1.0.1 - 2020-07-20
- Package updates.

## 1.0.0 - 2020-07-07
- Replaces the original JavaScript API served under `LABKEY` global namespace on LabKey Server pages.
- Universal module definition (UMD) published package targeting ES6.
- Full fidelity TypeScript definitions.

## 0.3.4 - 2020-07-07
- getFiltersFromParameters: Use Object.keys instead of "for(paramName in params)".

## 0.3.3 - 2020-06-16
- Package updates.

## 0.3.2 - 2020-06-08
- Add `Security.getUsersWithPermissions()` which shares parameter parsing with `Security.getUsers()`
as they share payload processing on the server.
- Split `User` interface into `User` and `UserWithPermissions` to better model server response shapes.
- Publicly export `Container`, `User`, and `UserWithPermissions` interfaces.
- Migrated `PermissionTypes` from `@labkey/components` and switched it to an enum. Deprecated `effectivePermissions`
that was previously declared.

## 0.3.1 - 2020-06-05
- Item 7373: Add "project" and "WebSocket" to LabKey typing, which will allow for main.d.ts file overrides to be removed in a few modules

## 0.3.0 - 2020-06-04
- Introduce "App" module `registerApp` / `loadApp`

## 0.2.9 - 2020-05-22
- Domain.getDomainDetails API support for domainKind parameter

## 0.2.8 - 2020-05-07
- Module updates for `ParticipantGroup` and `Specimen`.
- Utilize `RequestCallBackOptions` for option interfaces.
- Rename interfaces away from `I<Name>` pattern to `<Name>`.
- Use common `getCallbackWrapper()` pattern allowing for `scope` and additional arguments.
Backwards compatibility wrapper for original scoping behavior (see `onSpecimenSuccess`).
- Utilize `responseTransformer` argument on `getCallbackWrapper()` in lieu of custom "keyed" handling
formerly done by `getSuccessCallbackWrapper()` which has been removed.
- Package updates.

## 0.2.7 - 2020-05-06
- Export SelectDistinctOptions, SelectDistinctResponse, SelectRowsOptions

## 0.2.6 - 2020-05-05
- Add EXP_LINEAGE_OF filter type

## 0.2.5 - 2020-04-28
- Adds `containerPath` property to all `Experiment` module actions.
- Improve typings for `Experiment.lineage()` and `Experiment.resolve()` return types.
- Rename `Experiment` interfaces away from `I<Name>` pattern to `<Name>`.

## 0.2.4 - 2020-04-28
- Module updates for 'Assay'.
- Fix for `ActionURL.queryString()` to no longer parse functions as URL parameters.

## 0.2.3 - 2020-04-24
- Report.ts fix for populateParams() handling of inputParams as key value pairs on the execParams object
    instead of as a nested object within it

## 0.2.2 - 2020-04-20
- Explicitly only support `[13.2, '13.2', 16.2, 17.1]` values for `requiredVersion` to process as a `Query.Response`.

## 0.2.1 - 2020-04-17
- Module updates for `Exp`, `Message`, `Pipeline`, and `Report`.
- Fix for `Security.getSchemaPermissions()` to defensively copy configuration for `getSecurableResources` call.

## 0.2.0 - 2020-04-15
**ActionURL**
- Fix container path encoding (match core behavior).

**Domain**
- Separate `get` from `getDomainDetails` as they have different response shapes. @labkey-ians
- Fix check for parameters to look at "options" and not "config" as originally supplied.
This fixes support for multiple argument variants.

**Experiment**
- `saveMaterials` typings improved after updates to Query's `insertRows` typings.

**Query**
- Add payload response typings for `getQueries` and `getQueryDetails`.
- Update request-based interfaces to use `RequestCallbackOptions`.
- Separate `selectRows` and `selectDistinctRows` into own modules. `Rows` now contains insert, update, delete,
and save operations.
- Remove duplicate `saveRows` implementation (oops!).
- Add regression unit tests for old-style method signatures.

**Query/Filters**
- Add `EXP_PARENT_OF` filter type.
- Fix `getSingleValueFilter` to match core behavior.
- Rename `splitValue` to `parseValue` to match core interface. @labkey-kevink
- Add regression snapshot coverage for all provided filter types.

**Utils**
- Ensure scoping of callback is consistent with core behavior. Added regression tests.
- Remove `collapseExpand`, `notifyExpandCollapse`, and `toggleLink` as these have been migrated to DOM-based
implementation only.
- Add private `DOMWrapper` utility to declare "stubbed" methods that are expected to have a concrete implementation
provided by our DOM-based libraries. Allows for type signatures and fall through to a console warning.

**General**
- Match logical behavior when configuring parameter/data values. Some cases had been made more strict in `@labkey/api`
than what core is doing (e.g. using `=== true` when assigning to a `boolean` type).

## 0.1.2 - 2020-04-15
- Add optional auditBehavior parameter to IQueryRequestOptions

## 0.1.1 - 2020-04-07
- Fix for typings of Security.getUserPermissions response.

## 0.1.0 - 2020-04-06
- Feature parity with clientapi_core.

**Experiment**
- Adds and exports `exportRuns` method.
- Replaces usages of local payload processor with `Utils.getCallbackWrapper`'s `responseTransformer`.

**Filter**
- Adds and exports `_define` method.

**Utils**
- Adds and exports `getMeasureAlias` method.

**Visualization**
- Adds and exports `save` method.
- Exports `get`, `getData`, `getDataFilterFromURL`, `getFromUrl`, `getMeasures`, and `getTypes`.
All of these were previously declared but needed to be exported in the top-level module.
- Replaces usages of local payload processor with `Utils.getCallbackWrapper`'s `responseTransformer`.
- Removes visualization's private `Utils` module which defined no longer used `getSuccessCallbackWrapper` helper method.

**Test**
- Adds test to verify exported interface against a snapshot of "clientapi_core" as defined in LKS.
- Provides script used to generate API snapshot.
- Snapshot checked in as `core_api_snapshot.json`.

## 0.0.47 - 2020-04-06
- Domain module updates.

## 0.0.46 - 2020-04-06
- Security module updates.

## 0.0.45 - 2020-04-02
- Utils module updates.
- Improve typings for success/failure/scope options.
- Document experimental flag.

## 0.0.44 - 2020-04-02
- Query exports getDataViews, Response, Row.

## 0.0.43 - 2020-03-30
- Package distribution as UMD.
- Remove rollup build configuration.
- Simplify jest configuration.
- Compile source maps from TypeScript.
- Removed console warning about jQuery.
- Package updates.
- See https://github.com/LabKey/labkey-api-js/pull/43.

## 0.0.42 - 2020-03-29
- Experiment module updates.

## 0.0.41 - 2020-03-18
- Expose ExperimentalFeatures, getServerContext, and LabKey type.

## 0.0.40 - 2020-03-11
- Declare Query.ContainerFilter as an enum. Deprecate Query.containerFilter.

## 0.0.39 - 2020-03-06
- Fix value casing of Query.containerFilter

## 0.0.38 - 2020-02-27
- Doc updates (migrated from legacy API)

## 0.0.37 - 2020-02-27
- Item 6848: Add Domain.getDomainDetails and add support for domain kind options in Domain.save (#35)

## 0.0.36 - 2020-02-27
- Add jest-teamcity-reporter for improved CI test reporting

## 0.0.35 - 2020-02-27
- Package updates
- Remove docs custom theme

## 0.0.34 - 2020-02-25
- Fix type signature for selectRows success and failure callbacks

## 0.0.33 - 2020-02-21
- Add additional Domain and Run handling functions (Domain.listDomains, Domain.getProperties, Exp.loadRuns) (#26)

## 0.0.32 - 2020-01-24
- Item 6654: Changes to SaveDomain Api to include Warnings

## 0.0.31 - 2020-01-21
- Item 6759: Query.getServerDate() fix to include response object in success and failure functions (#32)

## 0.0.30 - 2020-01-13
- Item 6571: Add optionalMessage property to the Security.createNewUser() API call (#29)

## 0.0.29 - 2020-01-03
- Item 6506: Security.createNewUser() fix to include response object in success and failure function property definition (#28)

## 0.0.28 - 2019-11-12
- Add registerFilterType (#27)

## 0.0.26 - 2019-12-06
- Item 6508: Security api fixes for getPolicy and getRoles (#25)
    - getPolicy was trying to create a SecurityPolicy object which is not a constructor
    - savePolicy was returning incorrect typescript info for the success and failure functions

## 0.0.25 - 2019-11-12
- Added `includeMetadata` flag to selectRows (#24)

## 0.0.24 - 2019-10-28
- Export `getFiltersFromParameters` (#22)
- Add `Query.truncateTable`

## 0.0.23 - 2019-10-23
- Migrate core/Experiment.js (#21)

## 0.0.22 - 2019-10-12
- Update deployment docs (#20)

## 0.0.20 - 2019-08-15
- Item 6033: add `saveDataAsFile` option to AssayDOM importRun (#19)

## 0.0.19 - 2019-08-15
- Story 6033: Fixes for assay reimport and includeTotalCount (#18)

## 0.0.18 - 2019-08-15
- Item 5718: add `queryDetailColumns` property to Utils.getQueries (#16)

## 0.0.17 - 2019-06-12
- Item 5761: add missing `insertOption` prop to IImportDataOptions (#15)

## 0.0.16 - 2019-04-10
- Add parameters to Domain success and failure callbacks (#14)

## 0.0.15 - 2019-04-08
- Edit standard settings name/label/type (#12)

## 0.0.14 - 2019-04-08
- Core updates through r63014 (#13)
- 37116: Multi-value foreign key filter broken in customize view

## 0.0.12 - 2019-03-13
- assay-importRun.api: name and comment are optional (#10)

## 0.0.10 - 2019-03-13
- Core updates through r61908
- Core updates through r61088
- Add AssayDesign
- Core updates through r60653
- 35265: Create alternate syntax for handling delimiters
- rename interfaces `Filter` to `IFilter`
- Core updates through r60120
- Package updates
- Initial documentation (#4)

## 0.0.9 - 2018-04-29
- Add importUrl option to Query.importData() (#3)
- Initial documentation for experimental build

## 0.0.7 - 2018-07-06
- 34761: Add saveToPipeline parameter to Query.js
- Add DOM.Utils package
- Core updates through 18.1

## 0.0.6 - 2018-06-06
- Expose DOM packages via own namespace

## 0.0.5 - 2018-06-05
- ActionURL.getController()

## 0.0.4 - 2018-06-05
- package updates
- Security: update GetUsersOptions interface

## 0.0.3 - 2018-05-22
- Add support for `Q` filter

## 0.0.2 - 2018-05-21
- Update Domain interfaces
- Package updates
- Update tests for latest jest
- Introduce rollup for ES, CJS distributions
- Rename package to @labkey/api
- Remove babel
- Updates through 17.3
- Add Query importData, insert, update, delete APIs
- Add Utils.getDataViews
- Add Assay APIs
- Add DOM APIs and build as separate distribution
- Add Query APIs
- Add Visualization APIs
- Add Specimen APIs
- Add Report APIs
- Add List, MultiRequest APIs
- Add Query.getQueryDetails, getSchemas
- Add ActionURL, Utils
- Add GetData, ParticipantGroup
- Add Pipeline
- Add Messages
- Introduce Jest tests
- Add Security
- Add Domain, Query.executeSql, Query.selectDistinctRows
- Add Query Filter and FilterTypes
- Add Query FieldKey, SchemaKey
- Add Query selectRows

