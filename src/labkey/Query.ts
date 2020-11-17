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
import {
    buildQueryParams,
    ContainerFilter,
    deleteQueryView,
    DeleteQueryViewOptions,
    getDataViews,
    GetDataViewsOptions,
    getQueries,
    GetQueriesOptions,
    GetQueriesResponse,
    GetQueryResponse,
    getQueryViews,
    GetQueryViewsOptions,
    getSchemas,
    GetSchemasOptions,
    getServerDate,
    IDataTypes,
    saveQueryViews,
    saveSessionView,
    SaveQueryViewsOptions,
    SaveSessionViewOptions,
    sqlDateLiteral,
    sqlDateTimeLiteral,
    sqlStringLiteral,
    URL_COLUMN_PREFIX,
    validateQuery,
    ValidateQueryOptions,
} from './query/Utils';
import { ExecuteSqlOptions, executeSql } from './query/ExecuteSql';
import * as GetData from './query/GetData';
import {
    GetQueryDetailsOptions,
    QueryDetailsResponse,
    getQueryDetails,
    QueryImportTemplate,
    QueryIndex,
    QueryView,
    QueryViewColumn,
    QueryViewFilter,
    QueryViewSort,
} from './query/GetQueryDetails';
import {
    Command,
    CommandType,
    deleteRows,
    insertRows,
    ModifyRowsResults,
    MoveRowsOptions,
    MoveRowsResponse,
    moveRows,
    QueryRequestOptions,
    saveRows,
    SaveRowsOptions,
    SaveRowsResponse,
    truncateTable,
    updateRows,
} from './query/Rows';
import { SelectDistinctOptions, SelectDistinctResponse, selectDistinctRows } from './query/SelectDistinctRows';
import { SelectRowsOptions, selectRows, ShowRows } from './query/SelectRows';
import * as SQL from './query/experimental/SQL';
import * as Visualization from './query/Visualization';
import { Filter } from './filter/Filter';
import { GetDisplayField, MetadataField, Response, ResponseColumn, ResponseMetadata, Row } from './query/Response';
import { QueryColumn, QueryLookup } from './query/types';

/** @hidden */
const experimental = {
    SQL,
};

export {
    /* classes */
    Response,
    Row,
    /* constants */
    ContainerFilter, // Enumeration
    experimental,
    URL_COLUMN_PREFIX,
    /* interfaces */
    Command,
    CommandType,
    DeleteQueryViewOptions,
    ExecuteSqlOptions,
    GetDataViewsOptions,
    GetDisplayField,
    GetQueriesOptions,
    GetQueriesResponse,
    GetQueryDetailsOptions,
    GetQueryResponse,
    GetQueryViewsOptions,
    GetSchemasOptions,
    IDataTypes,
    MetadataField,
    ModifyRowsResults,
    MoveRowsOptions,
    MoveRowsResponse,
    QueryColumn,
    QueryDetailsResponse,
    QueryImportTemplate,
    QueryIndex,
    QueryLookup,
    QueryRequestOptions,
    QueryView,
    QueryViewColumn,
    QueryViewFilter,
    QueryViewSort,
    ResponseColumn,
    ResponseMetadata,
    SaveQueryViewsOptions,
    SaveRowsOptions,
    SaveRowsResponse,
    SaveSessionViewOptions,
    SelectDistinctOptions,
    SelectDistinctResponse,
    SelectRowsOptions,
    ShowRows,
    ValidateQueryOptions,
    /* methods */
    buildQueryParams,
    deleteQueryView,
    deleteRows,
    executeSql,
    getDataViews,
    getQueries,
    getQueryDetails,
    getQueryViews,
    getSchemas,
    getServerDate,
    insertRows,
    moveRows,
    saveQueryViews,
    saveSessionView,
    saveRows,
    selectDistinctRows,
    selectRows,
    sqlDateLiteral,
    sqlDateTimeLiteral,
    sqlStringLiteral,
    truncateTable,
    updateRows,
    validateQuery,
    /* namespaces */
    Filter,
    GetData,
    Visualization,
};
