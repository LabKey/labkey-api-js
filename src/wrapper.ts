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
/**
 * The intent of this file is just to wrap the API and append it to the global
 * LABKEY variable. This is preferred over using the webpack "libraryTarget" of "var"
 * where "library" is set to "LABKEY" since that will stomp over any prior configuration
 * (such as is done by internal/labkey.js).
 *
 * This is not a part of the API definition and SHOULD NOT define any APIs. Additionally,
 * this file SHOULD NOT export anything.
 */
import * as API from './labkey'

declare var LABKEY: any;

LABKEY.ActionURL = API.ActionURL;
LABKEY.Ajax = API.Ajax;
LABKEY.FieldKey = API.FieldKey;
LABKEY.Filter = API.Filter;
LABKEY.Query = API.Query;
LABKEY.QueryKey = API.QueryKey;
LABKEY.SchemaKey = API.SchemaKey;
LABKEY.Utils = API.Utils;