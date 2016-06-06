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
LABKEY.Filter = API.Filter;
LABKEY.Query = API.Query;
LABKEY.Utils = API.Utils;