"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function create(options) {
    if (!options.schemaName) {
        throw new Error('You must supply a value for schemaName in your configuration object!');
    }
    var params = [
        options.schemaName,
        options.queryName ? options.queryName : '~'
    ];
    if (options.queryType) {
        params.push(options.queryType);
    }
    return params.join('|');
}
exports.create = create;
exports.QueryType = {
    BUILT_IN: 'builtIn',
    CUSTOM: 'custom',
    DATASETS: 'datasets',
    ALL: 'all'
};
