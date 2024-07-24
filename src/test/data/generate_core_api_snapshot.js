/**
 * Produces a JSON snapshot of the "clientapi_core" library API. This snapshot can be used to compare against
 * the API produced by @labkey/api to help ensure compatibility.
 *
 * Run from the browser console on a page with only "labkey.js" loaded. This can be achieved by setting up
 * file-based module view with an "app" template and "none" frame. Something like:
 *
 * <view xmlns="http://labkey.org/data/xml/view" template="app" frame="none">
 *   <requiresNoPermission/>
 *   <dependencies>
 *   </dependencies>
 * </view>
 */
(function () {
    if (!LABKEY) {
        throw new Error('Unable to process "LABKEY" namespace. It is not available.');
    } else if (LABKEY.Query) {
        throw new Error('Unable to process "LABKEY" namespace. "clientapi_core" is already present on the page.');
    }

    var excluded = Object.keys(LABKEY).sort();
    var data = {};

    LABKEY.requiresScript('clientapi_core', function () {
        var namespaces = Object.keys(LABKEY)
            .filter(function (ns) {
                return excluded.indexOf(ns) === -1;
            })
            .sort();

        namespaces.forEach(function (ns) {
            data[ns] = Object.keys(LABKEY[ns]).sort();
        });

        console.log('copy the following snapshot:');
        console.log(JSON.stringify(data, null, 2));
    });
})();
