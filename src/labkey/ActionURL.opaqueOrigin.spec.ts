/**
 * Copyright (c) 2026 LabKey Corporation
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
 *
 * @jest-environment-options {"url": "file:///tmp/page.html"}
 */
import { isSameOrigin } from './ActionURL';

// A file:// page has an opaque origin, which serializes as "null" like every data: and javascript: URL
describe('isSameOrigin on an opaque-origin page', () => {
    test('nothing is same origin', () => {
        expect(window.location.origin).toEqual('null');
        expect(isSameOrigin('data:text/html,<script>alert(1)</script>')).toBe(false);
        expect(isSameOrigin('javascript:alert(1)')).toBe(false);
        expect(isSameOrigin('file:///tmp/other.html')).toBe(false);
        expect(isSameOrigin('/labkey/query-selectRows.api')).toBe(false);
    });
});
