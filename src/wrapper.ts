/*
 * Copyright (c) 2016-2017 LabKey Corporation
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
import * as __package__ from './package';

import * as API from './index';

declare let LABKEY: any;

LABKEY.ActionURL = API.ActionURL;
LABKEY.Ajax = API.Ajax;
LABKEY.App = API.App;
LABKEY.Assay = API.Assay;
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
LABKEY.Query = API.Query;
LABKEY.QueryKey = API.QueryKey;
LABKEY.Report = API.Report;
LABKEY.SchemaKey = API.SchemaKey;
LABKEY.Security = API.Security;
LABKEY.Specimen = API.Specimen;
LABKEY.Utils = API.Utils;
LABKEY.Visualization = API.Visualization;
LABKEY.__package__ = __package__;

// The app registry needs to be initialized after the namespace has been established.
API.App.init(LABKEY);
