/*
 * Copyright (c) 2016 LabKey Corporation
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
//NOTE: these maps contains the unambiguous pairings of single- and multi-valued filters
//due to NULLs, one cannot easily convert neq to notin
export const multiValueToSingleMap: {
    [key:string]: string
} = {
    'in': 'eq',
    containsoneof: 'contains',
    containsnoneof: 'doesnotcontain',
    between: 'gte',
    notbetween: 'lt'
};

export const oppositeMap: {
    [key:string]: string
} = {
    //HAS_ANY_VALUE: null,
    eq: 'neqornull',
    dateeq: 'dateneq',
    dateneq: 'dateeq',
    neqornull: 'eq',
    neq: 'eq',
    isblank: 'isnonblank',
    isnonblank: 'isblank',
    gt: 'lte',
    dategt: 'datelte',
    lt: 'gte',
    datelt: 'dategte',
    gte: 'lt',
    dategte: 'datelt',
    lte: 'gt',
    datelte: 'dategt',
    contains: 'doesnotcontain',
    doesnotcontain: 'contains',
    doesnotstartwith: 'startswith',
    startswith: 'doesnotstartwith',
    'in': 'notin',
    notin: 'in',
    memberof: 'memberof',
    containsoneof: 'containsnoneof',
    containsnoneof: 'containsoneof',
    hasmvvalue: 'nomvvalue',
    nomvvalue: 'hasmvvalue',
    between: 'notbetween',
    notbetween: 'between'
};

export const singleValueToMultiMap: {
    [key:string]: string
} = {
    eq: 'in',
    neq: 'notin',
    neqornull: 'notin',
    doesnotcontain: 'containsnoneof',
    contains: 'containsoneof'
};

// TODO: Can this be typed to just primitives?
export type FilterValue = any;