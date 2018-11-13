/*
 * Copyright (c) 2018 LabKey Corporation
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
import * as Filter from './Filter'

describe('create', () => {

    const basicFilter = Filter.create('BaseBall', 'awesome');

    it('should reflect column name', () => {
        expect(basicFilter.getColumnName()).toEqual('BaseBall');
    });
    it('should reflect value', () => {
        expect(basicFilter.getValue()).toEqual('awesome');
    });
    it('should set default filterType to EQUAL', () => {
        expect(basicFilter.getFilterType().getURLSuffix()).toEqual(Filter.Types.EQUAL.getURLSuffix());
    });
    it('should reflect URL parameter name', () => {
        expect(basicFilter.getURLParameterName()).toEqual('query.BaseBall~eq');
    });
    it('should reflect region-specific URL parameter name', () => {
        expect(basicFilter.getURLParameterName('aqwp123')).toEqual('aqwp123.BaseBall~eq');
    });
    it('should reflect URL parameter value', () => {
        expect(basicFilter.getURLParameterValue()).toEqual('awesome');
    });

    const typedFilter = Filter.create('measure', 24, Filter.Types.GREATER_THAN_OR_EQUAL);

    it('should have specified filterType', () => {
        expect(typedFilter.getFilterType().getURLSuffix()).toEqual(Filter.Types.GREATER_THAN_OR_EQUAL.getURLSuffix());
    });

    const columnName = 'En<cod ed';
    const filterValue = 'Va|ue?';
    const encodedFilter = Filter.create(columnName, filterValue);

    it('should not encode URL parameter name', () => {
        expect(encodedFilter.getURLParameterName()).toEqual('query.' + columnName + '~eq');
    });
    it('should not encode URL parameter value', () => {
        expect(encodedFilter.getURLParameterValue()).toEqual(filterValue);
    });
});

describe('merge', () => {

    const baseFilters = [
        Filter.create('A', 'a'),
        Filter.create('B', 'b'),
        Filter.create('C', 'c'),
        Filter.create('A', 'aa'),
        Filter.create('BB', 'bb'),
        Filter.create('CC', 'cc')
    ];

    const columnFilters = [
        Filter.create('A', 'A1'),
        Filter.create('B', 'B1'),
        Filter.create('C', 'C1')
    ];

    it('should accept empty arguments', () => {
        expect(Filter.merge.apply(this, [])).toEqual([]);
    });
    it('should remove baseFilters with columnName', () => {
        const result = Filter.merge.apply(this, [baseFilters, 'A']);
        expect(baseFilters.length).toEqual(6); // should not modify original baseFilters
        expect(result.length).toEqual(4);
    });
    it('should append columnFilters', () => {
        const result = Filter.merge(baseFilters, 'A', columnFilters);
        expect(baseFilters.length).toEqual(6); // should not modify original baseFilters
        expect(result.length).toEqual(7); // 6 - 2 + 3
    });
});