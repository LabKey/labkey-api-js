import { request } from '../Ajax'
import { Filter } from '../filter/Filter'
import { buildURL } from '../ActionURL'
import { getCallbackWrapper, getOnFailure, getOnSuccess, isArray } from '../Utils'
import { buildQueryParams, getMethod, getSuccessCallbackWrapper } from './Utils'

type ShowRows = 'all' | 'none' | 'paginated' | 'selected' | 'unselected';

interface SelectRowsOptions {
    // Required
    queryName: string
    schemaName: string

    // Optional
    columns?: string | Array<string>
    containerFilter?: string
    containerPath?: string
    dataRegionName?: string
    failure?: () => any
    filterArray?: Array<Filter>
    ignoreFilter?: boolean
    includeDetailsColumn?: boolean
    includeStyle?: boolean
    includeTotalCount?: boolean
    includeUpdateColumn?: boolean
    maxRows?: number
    method?: string
    offset?: number
    parameters?: any
    requiredVersion?: number | string
    scope?: any
    selectionKey?: string
    showRows?: ShowRows
    sort?: string
    stripHiddenColumns?: boolean
    success?: (result: SelectRowsResults) => any
    timeout?: number
    viewName?: string
}

interface SelectRowsResults {
}

function buildParams(options: SelectRowsOptions): any {

    var params = buildQueryParams(
        options.schemaName,
        options.queryName,
        options.filterArray,
        options.sort,
        options.dataRegionName
    );

    const dataRegionName = params.dataRegionName;

    if (!options.showRows || options.showRows === 'paginated') {

    }
    else if (['all', 'selected', 'unselected', 'none'].indexOf(options.showRows) !== -1) {
        params[dataRegionName + '.showRows'] = options.showRows;
    }

    if (options.viewName)
        params[options.dataRegionName + '.viewName'] = options.viewName;

    if (options.columns)
        params[options.dataRegionName + '.columns'] = isArray(options.columns) ? (options.columns as Array<string>).join(',') : options.columns;

    if (options.selectionKey)
        params[options.dataRegionName + '.selectionKey'] = options.selectionKey;

    if (options.ignoreFilter)
        params[options.dataRegionName + '.ignoreFilter'] = 1;

    if (options.parameters) {
        for (var propName in options.parameters) {
            if (options.parameters.hasOwnProperty(propName)) {
                params[options.dataRegionName + '.param.' + propName] = options.parameters[propName];
            }
        }
    }

    if (options.requiredVersion)
        params.apiVersion = options.requiredVersion;

    if (options.containerFilter)
        params.containerFilter = options.containerFilter;

    if (options.includeTotalCount)
        params.includeTotalCount = options.includeTotalCount;

    if (options.includeDetailsColumn)
        params.includeDetailsColumn = options.includeDetailsColumn;

    if (options.includeUpdateColumn)
        params.includeUpdateColumn = options.includeUpdateColumn;

    if (options.includeStyle)
        params.includeStyle = options.includeStyle;

    return params;
}

/**
 * Provides backwards compatibility with pre-1.0 selectRows() argument configuration.
 * @param args
 * @returns {SelectRowsOptions} options
 */
function mapArguments(args: any): SelectRowsOptions {
    return {
        schemaName: args[0],
        queryName: args[1],
        success: args[2],
        failure: args[3],
        filterArray: args[4],
        sort: args[5],
        viewName: args[6]
    }
}

export function selectRows(options: SelectRowsOptions): XMLHttpRequest {

    if (arguments.length > 1) {
        options = mapArguments(arguments);
    }

    if (!options.schemaName) {
        throw 'You must specify a schemaName!';
    }
    if (!options.queryName) {
        throw 'You must specify a queryName!';
    }

    return request({
        url: buildURL('query', 'getQuery.api', options.containerPath),
        method: getMethod(options.method),
        success: getSuccessCallbackWrapper(getOnSuccess(options), options.stripHiddenColumns, options.scope, options.requiredVersion),
        failure: getCallbackWrapper(getOnFailure(options), options.scope, true),
        params: buildParams(options),
        timeout: options.timeout
    });
}