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
    containerFilter,
    deleteQueryView,
    getDataViews,
    getQueries,
    getQueryViews,
    getSchemas,
    getServerDate,
    saveQueryViews,
    sqlDateLiteral,
    sqlDateTimeLiteral,
    sqlStringLiteral,
    URL_COLUMN_PREFIX,
    validateQuery
} from './query/Utils'
import { executeSql } from './query/ExecuteSql'
import * as GetData from './query/GetData'
import { getQueryDetails } from './query/GetQueryDetails'
import {
    deleteRows,
    insertRows,
    saveRows,
    truncateTable,
    updateRows
} from './query/Rows'
import { SelectDistinctOptions, SelectDistinctResponse, selectDistinctRows } from './query/SelectDistinctRows'
import { SelectRowsOptions, selectRows } from './query/SelectRows'
import * as SQL from './query/experimental/SQL'
import * as Visualization from './query/Visualization'
import { Filter } from './filter/Filter'
import { Response, Row } from './query/Response'
import { QueryColumn } from './query/types'

const experimental = {
    SQL
};

export {
    // Interfaces
    QueryColumn,

    ContainerFilter, // Enumeration
    containerFilter, // backwards compatible reference
    buildQueryParams,
    deleteQueryView,
    deleteRows,
    executeSql,
    experimental,
    Filter,
    GetData,
    getDataViews,
    getQueries,
    getQueryDetails,
    getQueryViews,
    getSchemas,
    getServerDate,
    insertRows,
    Response,
    Row,
    saveQueryViews,
    saveRows,
    SelectDistinctOptions,
    SelectDistinctResponse,
    selectDistinctRows,
    SelectRowsOptions,
    selectRows,
    sqlDateLiteral,
    sqlDateTimeLiteral,
    sqlStringLiteral,
    truncateTable,
    updateRows,
    URL_COLUMN_PREFIX,
    validateQuery,
    Visualization
}