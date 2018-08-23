"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ActionURL_1 = require("../../ActionURL");
var Ajax_1 = require("../../Ajax");
var Utils_1 = require("../../Utils");
var CONTROL_CHARS = {
    nul: '\x00',
    bs: '\x08',
    rs: '\x1E',
    us: '\x1F'
};
var CONVERTERS = {
    BIGINT: parseInt,
    BOOLEAN: parseInt,
    DOUBLE: parseFloat,
    INTEGER: parseInt,
    NUMERIC: parseFloat,
    REAL: parseFloat,
    SMALLINT: parseInt,
    TIMESTAMP: convertDate,
    TINYINT: parseInt
};
function asObjects(fields, rows) {
    var p = {};
    for (var f = 0; f < fields.length; f++) {
        p[fields[f]] = null;
    }
    var result = [];
    for (var r = 0; r < rows.length; r++) {
        var arr = rows[r];
        var obj = Object.assign({}, p);
        var l = Math.min(fields.length, arr.length);
        for (var c = 0; c < l; c++) {
            obj[fields[c]] = arr[c];
        }
        result.push(obj);
    }
    return result;
}
exports.asObjects = asObjects;
function convertDate(s) {
    if (!s) {
        return null;
    }
    var number;
    if (0 < s.indexOf('-')) {
        number = Date.parse(s);
    }
    else {
        number = parseFloat(s);
    }
    return new Date(!isNaN(number) && isFinite(number) ? number : s);
}
function execute(options) {
    if (!options.schema) {
        throw 'You must specify a schema!';
    }
    if (!options.sql) {
        throw 'You must specify sql statement!';
    }
    var eol = options.eol || (CONTROL_CHARS.us + '\n');
    var sep = options.sep || (CONTROL_CHARS.us + '\t');
    var jsonData = {
        compact: 1,
        eol: eol,
        parameters: options.parameters,
        schema: options.schema,
        sep: sep,
        sql: options.sql
    };
    return Ajax_1.request({
        url: ActionURL_1.buildURL('sql', 'execute', options.containerPath),
        method: 'POST',
        jsonData: jsonData,
        success: function (response) {
            var result = parseRows(response.responseText, sep, eol);
            Utils_1.getOnSuccess(options)(result);
        },
        failure: Utils_1.getCallbackWrapper(Utils_1.getOnFailure(options), options.scope, true),
        timeout: options.timeout
    });
}
exports.execute = execute;
function identity(x) {
    return x;
}
function parseRows(text, sep, eol) {
    var rows = text.split(eol);
    if ('' === trimRight(rows[rows.length - 1])) {
        rows.pop();
    }
    var x = 0;
    var meta = rows[x++].split(sep);
    var names = rows[x++].split(sep);
    var colConverters = [];
    var types = rows[x++].split(sep);
    for (var i = 0; i < types.length; i++) {
        colConverters.push(CONVERTERS[types[i]] || identity);
    }
    rows = rows.slice(meta.length);
    for (var r = 0; r < rows.length; r++) {
        var row = rows[r].split(sep);
        for (var c = 0; c < row.length; c++) {
            var s = row[c];
            if ('' === s) {
                row[c] = null;
            }
            else if (CONTROL_CHARS.bs === s && r > 0) {
                row[c] = rows[r - 1][c];
            }
            else {
                row[c] = colConverters[c](s);
            }
        }
        rows[r] = row;
    }
    rows.pop();
    rows.pop();
    return {
        names: names,
        rows: rows,
        types: types
    };
}
function trimRight(s) {
    return s.replace(/[\s\uFEFF\xA0]+$/g, '');
}
