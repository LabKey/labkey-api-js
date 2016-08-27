interface FilterType {

}

export class Filter {

    // maintain static reference
    static create = create;

    constructor() {}
}

export function appendFilterParams(params: any, filterArray: Array<Filter>, dataRegionName: string) {
    // TODO: Implement this
    return params;
}

export function create(column: string, value: string | number, type?: FilterType): Filter {
    return new Filter();
}