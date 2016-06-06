import { request } from '../Ajax'
import { Filter } from '../Filter'
import { buildURL } from '../ActionURL'

type ShowRows = 'all' | 'none' | 'paginated' | 'selected' | 'unselected';

interface SelectRowsOptions {
    // Required
    queryName: string
    schemaName: string

    // Optional
    columns?: string | Array<string>
    failure?: () => void
    filterArray?: Array<Filter>
    ignoreFilter?: boolean
    includeDetailsColumn?: boolean
    includeTotalCount?: boolean
    includeUpdateColumn?: boolean
    maxRows?: number
    method?: string
    offset?: number
    showRows?: ShowRows
    sort?: string
    success?: (result: SelectRowsResults) => void
    viewName?: string
}

interface SelectRowsResults {
}

export function selectRows(options: SelectRowsOptions): void {

    if (arguments.length > 1) {
    }

    request({
        url: buildURL('query', 'getQuery.api')
    });
}