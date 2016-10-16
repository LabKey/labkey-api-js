//NOTE: these maps contains the unambiguous pairings of single- and multi-valued filters
//due to NULLs, one cannot easily convert neq to notin
export const multiValueToSingleMap: {
    [key:string]: string
} = {
    'in': 'eq',
    containsoneof: 'contains',
    containsnoneof: 'doesnotcontain',
    between: 'gte',
    notbetween: 'lt'
};

export const oppositeMap: {
    [key:string]: string
} = {
    //HAS_ANY_VALUE: null,
    eq: 'neqornull',
    dateeq: 'dateneq',
    dateneq: 'dateeq',
    neqornull: 'eq',
    neq: 'eq',
    isblank: 'isnonblank',
    isnonblank: 'isblank',
    gt: 'lte',
    dategt: 'datelte',
    lt: 'gte',
    datelt: 'dategte',
    gte: 'lt',
    dategte: 'datelt',
    lte: 'gt',
    datelte: 'dategt',
    contains: 'doesnotcontain',
    doesnotcontain: 'contains',
    doesnotstartwith: 'startswith',
    startswith: 'doesnotstartwith',
    'in': 'notin',
    notin: 'in',
    memberof: 'memberof',
    containsoneof: 'containsnoneof',
    containsnoneof: 'containsoneof',
    hasmvvalue: 'nomvvalue',
    nomvvalue: 'hasmvvalue',
    between: 'notbetween',
    notbetween: 'between'
};

export const singleValueToMultiMap: {
    [key:string]: string
} = {
    eq: 'in',
    neq: 'notin',
    neqornull: 'notin',
    doesnotcontain: 'containsnoneof',
    contains: 'containsoneof'
};

export type FilterValue = string | number | boolean;