/*
 * Copyright (c) 2017-2018 LabKey Corporation
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
import * as DOM from './labkey/dom/index';
import * as __package__ from './package';

import * as API from './index';

declare let LABKEY: any;

// Core
LABKEY.ActionURL = API.ActionURL;
LABKEY.Ajax = API.Ajax;
LABKEY.Domain = API.Domain;
LABKEY.Exp = API.Exp;
LABKEY.Experiment = API.Experiment;
LABKEY.FieldKey = API.FieldKey;
LABKEY.Filter = API.Filter;
LABKEY.List = API.List;
LABKEY.Message = API.Message;
LABKEY.MultiRequest = API.MultiRequest;
LABKEY.ParticipantGroup = API.ParticipantGroup;
LABKEY.Pipeline = API.Pipeline;
LABKEY.QueryKey = API.QueryKey;
LABKEY.Report = API.Report;
LABKEY.SchemaKey = API.SchemaKey;
LABKEY.Specimen = API.Specimen;
LABKEY.Visualization = API.Visualization;
LABKEY.__package__ = __package__;

// DOM
LABKEY.Assay = Object.assign({}, API.Assay, DOM.Assay);
LABKEY.Form = DOM.Form;
LABKEY.Query = Object.assign({}, API.Query, DOM.Query);
LABKEY.Security = Object.assign({}, API.Security, DOM.Security);
LABKEY.Utils = Object.assign({}, API.Utils, DOM.Utils);
