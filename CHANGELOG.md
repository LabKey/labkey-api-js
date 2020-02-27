
## 0.0.TBD - TBD
- Item 6848: Add Domain.getDomainDetails and add support for domain kind options in Domain.save (#35) 

## 0.0.35 - 2020-02-27
- Package updates
- Remove docs custom theme

## 0.0.34 - 2020-02-25
- Fix type signature for selectRows success and failure callbacks (#34)

## 0.0.33 - 2020-02-21
- Add additional Domain and Run handling functions (Domain.listDomains, Domain.getProperties, Exp.loadRuns) (#26)

## 0.0.32 - 2020-01-24
- Item 6654: Changes to SaveDomain Api to include Warnings (#31)

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

