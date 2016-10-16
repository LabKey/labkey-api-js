export function ensureRegionName(regionName?: string) {
    return regionName || 'query';
}

export function isArray(value: any): boolean {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
    return Object.prototype.toString.call(value) === '[object Array]';
}

export function isDefined(value: any): boolean {
    return typeof value !== 'undefined';
}