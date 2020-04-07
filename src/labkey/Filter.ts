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
    appendAggregateParams,
    appendFilterParams,
    create,
    getFilterDescription,
    getFiltersFromParameters,
    getFiltersFromUrl,
    getQueryParamsFromUrl,
    getSortFromUrl,
    IFilter,
    merge
} from './filter/Filter'
import {
    _define,
    getDefaultFilterForType,
    getFilterTypeForURLSuffix,
    getFilterTypesForType,
    registerFilterType,
    IFilterType,
    Types
} from './filter/Types'

export {
    _define,
    appendAggregateParams,
    appendFilterParams,
    create,
    getDefaultFilterForType,
    getFilterDescription,
    getFiltersFromParameters,
    getFiltersFromUrl,
    getFilterTypeForURLSuffix,
    getFilterTypesForType,
    getQueryParamsFromUrl,
    getSortFromUrl,
    merge,
    registerFilterType,
    Types,

    /* TypeScript interfaces */
    IFilter,
    IFilterType
}