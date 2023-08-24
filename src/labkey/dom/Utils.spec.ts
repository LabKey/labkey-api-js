/*
 * Copyright (c) 2020-2022 LabKey Corporation
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
import { loadDOMContext } from './constants';
import { postToAction } from './Utils';

describe('dom/Utils', () => {
    describe('loadDOMContext', () => {
        it('Error without jQuery', () => {
            const { $ } = loadDOMContext();
            expect(() => {
                $();
            }).toThrowError('jQuery');
        });
    });

    describe('postToAction', () => {
        it('submits form', () => {
            // Arrange
            const formId = 'postToAction-form';
            const onSubmit = jest.fn().mockImplementation(e => e.preventDefault());
            const inject = '<script>alert("8(");</script>';
            const url = '#';
            const formData = {
                foo: 'bar',
                [inject]: inject,
                1: -1,
            };
            const formProps = {
                id: formId,
                onsubmit: onSubmit,
                target: '_blank',
            };

            // Act
            postToAction(url, formData, formProps);

            // Assert
            const form = document.getElementById(formId);
            expect(form).toBeDefined();
            expect(form.getAttribute('action')).toEqual(url);
            expect(form.getAttribute('method')).toEqual('POST');
            expect(form.getAttribute('target')).toEqual('_blank');

            const inputs = form.querySelectorAll('input');
            expect(inputs.length).toEqual(3);

            expect(onSubmit).toHaveBeenCalled();
        });
    });
});
