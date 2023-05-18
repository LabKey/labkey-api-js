/*
 * Copyright (c) 2023 LabKey Corporation
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
import * as Domain from './Domain';

import { create } from './List';

describe('List', () => {
    describe('create', () => {
        it('should require list name', () => {
            expect(() => {
                create({})
            }).toThrowError('List name required');
            expect(() => {
                create({ name: undefined })
            }).toThrowError('List name required');
        });

        it('should require kind or valid keyType', () => {
            expect(() => {
                create({ name: 'myList' });
            }).toThrowError('List kind or keyType required');
            expect(() => {
                create({ name: 'myList', keyType: 'invalidKeyType' });
            }).toThrowError('List kind or keyType required');
        });

        it('should require keyName or options.keyName', () => {
            expect(() => {
                create({ name: 'myList', kind: 'IntList' });
            }).toThrowError('List keyName or options.keyName required');
            expect(() => {
                create({ name: 'myList', keyName: undefined, kind: 'IntList' });
            }).toThrowError('List keyName or options.keyName required');
        });

        it('should support deprecated keyName', () => {
            const createSpy = jest.spyOn(Domain, 'create').mockImplementation();

            create({ name: 'myList', keyName: 'keyField', kind: 'IntList' });
            expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({ options: { keyName: 'keyField' } }));
        });

        it('should support deprecated keyType', () => {
            const createSpy = jest.spyOn(Domain, 'create').mockImplementation();

            // keyType == 'int'
            create({ name: 'myList', keyName: 'keyField', keyType: 'int' });
            expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({ kind: 'IntList' }));

            // keyType == 'IntList'
            create({ name: 'myList', keyName: 'keyField', keyType: 'IntList' });
            expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({ kind: 'IntList' }));

            // keyType == 'string'
            create({ name: 'myList', keyName: 'keyField', keyType: 'string' });
            expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({ kind: 'VarList', options: { keyName: 'keyField', keyType: 'Varchar' } }));

            // keyType == 'VarList'
            create({ name: 'myList', keyName: 'keyField', keyType: 'VarList' });
            expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({ kind: 'VarList', options: { keyName: 'keyField', keyType: 'Varchar' } }));
        });

        it('should give domainDesign precedence', () => {
            const createSpy = jest.spyOn(Domain, 'create').mockImplementation();

            const name = 'myList';
            const domainDesign = { name: 'myListDomain' };
            const kind = 'IntList';
            const options = { keyName: 'rowId' };

            create({ domainDesign, kind, name, options });
            expect(createSpy).toHaveBeenCalledWith({
                domainDesign,
                kind,
                options,
            });
        });

        it('should support old docs example', () => {
            const createSpy = jest.spyOn(Domain, 'create').mockImplementation();

            const description = 'my first list';
            const fields = [{
                name: 'one', rangeURI: 'int',
            },{
                name: 'two', rangeURI: 'multiLine', required: true,
            },{
                name: 'three', rangeURI: 'Attachment',
            }];
            const keyName = 'one';
            const name = 'mylist';

            create({ description, fields, keyName, keyType: 'int', name });
            expect(createSpy).toHaveBeenCalledWith({
                domainDesign: {
                    description,
                    fields,
                    name,
                },
                kind: 'IntList',
                options: {
                    keyName,
                }
            });
        });

        it('should support auto-increment docs example', () => {
            const createSpy = jest.spyOn(Domain, 'create').mockImplementation();

            const description = 'teams in the league';
            const fields = [{
                name: 'rowId', rangeURI: 'int',
            },{
                name: 'name', rangeURI: 'string', required: true,
            },{
                name: 'slogan', rangeURI: 'multiLine',
            },{
                name: 'logo', rangeURI: 'Attachment',
            }];
            const kind = 'IntList';
            const name = 'Teams';
            const options = { keyName: 'rowId', keyType: 'AutoIncrementInteger' };

            create({ description, fields, kind, name, options });
            expect(createSpy).toHaveBeenCalledWith({
                domainDesign: {
                    description,
                    fields,
                    name,
                },
                kind,
                options,
            });
        });
    });
});