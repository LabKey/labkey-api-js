/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
"use strict";

const Utils = require('../src/labkey/Utils');

// no need for test of Utils.alert() at this time.

describe('caseInsensitiveEquals', () => {
    it('should be null safe', () => {
        expect(Utils.caseInsensitiveEquals(null, null)).toBe(true);
    });
    it('should be undefined safe', () => {
        expect(Utils.caseInsensitiveEquals(undefined, undefined)).toBe(true);
    });
    it('should be case insensitive equal', () => {
        expect(Utils.caseInsensitiveEquals('aB', 'Ab')).toBe(true);
    });
});

describe('ensureRegionName', () => {
    it('should return default', () => {
        expect(Utils.ensureRegionName()).toEqual('query');
    });
    it('should accept and return alternative', () => {
        expect(Utils.ensureRegionName('alternateName')).toEqual('alternateName');
    });
});

// describe('getCallbackWrapper', () => {
//     it('should return an AjaxHandler', () => {
//     });
// });

describe('getOnFailure', () => {
    const failure = () => {};

    it('should handle empty configuration', () => {
        expect(Utils.getOnFailure({})).toBe(undefined);
    });
    it('should return "failure" function', () => {
        expect(Utils.getOnFailure({failure})).toBe(failure);
    });
    it('should return "errorCallback" function', () => {
        expect(Utils.getOnFailure({errorCallback: failure})).toBe(failure);
    });
    it('should return "failureCallback" function', () => {
        expect(Utils.getOnFailure({failureCallback: failure})).toBe(failure);
    });
    // Consider testing priority
});

describe('getOnSuccess', () => {
    const success = () => { return 'success'; };
    const successCallback = () => { return 'successCallback'; };

    it('should handle empty configuration', () => {
        expect(Utils.getOnSuccess({})).toBe(undefined);
    });
    it('should return "success" function', () => {
        expect(Utils.getOnSuccess({success})).toBe(success);
    });
    it('should return "successCallback" function', () => {
        expect(Utils.getOnSuccess({successCallback})).toBe(successCallback);
    });
    it('should return "success" over "successCallback" function', () => {
        expect(Utils.getOnSuccess({success, successCallback})).toBe(success);
    });
});

describe('id', () => {
    const defaultPrefix = 'lk-gen'; // should match ID_PREFIX
    let defaultSeed = 100; // should match initial idSeed value

    it('should handle no prefix', () => {
        expect(Utils.id(undefined)).toEqual(defaultPrefix + (++defaultSeed));
    });
    it('should handle a custom prefix', () => {
        expect(Utils.id('custom_PreFix')).toEqual('custom_PreFix' + (++defaultSeed));
    });
    it('should return a string', () => {
        expect(Utils.id(123)).toEqual('123' + (++defaultSeed));
    });
});

describe('isArray', () => {
    it('should return true only for arrays', () => {
        expect(Utils.isArray(undefined)).toBe(false);
        expect(Utils.isArray(null)).toBe(false);
        expect(Utils.isArray('string')).toBe(false);
        expect(Utils.isArray(123)).toBe(false);
        expect(Utils.isArray({})).toBe(false);
        expect(Utils.isArray('[]')).toBe(false);
        expect(Utils.isArray([])).toBe(true);
    });
});

describe('isBoolean', () => {
    it('should accept y/n', () => {
        expect(Utils.isBoolean('y')).toBe(true);
        expect(Utils.isBoolean('n')).toBe(true);
    });
    it('should accept yes/no', () => {
        expect(Utils.isBoolean('yes')).toBe(true);
        expect(Utils.isBoolean('no')).toBe(true);
    });
    it('should accept on/off', () => {
        expect(Utils.isBoolean('on')).toBe(true);
        expect(Utils.isBoolean('off')).toBe(true);
    });
    it('should accept t/f', () => {
        expect(Utils.isBoolean('t')).toBe(true);
        expect(Utils.isBoolean('f')).toBe(true);
    });
    it('should accept boolean', () => {
        expect(Utils.isBoolean(true)).toBe(true);
        expect(Utils.isBoolean(false)).toBe(true);
    });
});

describe('isDate', () => {
    it('should return true only for Date', () => {
        expect(Utils.isDate(undefined)).toBe(false);
        expect(Utils.isDate(null)).toBe(false);
        expect(Utils.isDate('Date')).toBe(false);
        expect(Utils.isDate(123)).toBe(false);
        expect(Utils.isDate({})).toBe(false);
        expect(Utils.isDate(new Date())).toBe(true);
        expect(Utils.isDate(new Date(123))).toBe(true);
        expect(Utils.isDate(Date.now())).toBe(false);
    });
});

describe('isDefined', () => {
    it('should return true only for undefined', () => {
        const x = undefined;
        expect(Utils.isDefined(x)).toBe(false);
        expect(Utils.isDefined(undefined)).toBe(false);
        expect(Utils.isDefined(null)).toBe(true);
        expect(Utils.isDefined('string')).toBe(true);
        expect(Utils.isDefined(123)).toBe(true);
        expect(Utils.isDefined({})).toBe(true);
        expect(Utils.isDefined(new Date())).toBe(true);
    });
});

describe('isEmptyObj', () => {
    it('should return true for undefined/null', () => {
        expect(Utils.isEmptyObj(undefined)).toBe(true);
        expect(Utils.isEmptyObj(null)).toBe(true);
    });
    it('should return true for {}', () => {
        const x = {};
        const y = {key: 'value'};
        expect(Utils.isEmptyObj(x)).toBe(true);
        expect(Utils.isEmptyObj(y)).toBe(false);
    });
    it('should return true for []', () => {
        expect(Utils.isEmptyObj([])).toBe(true);
        expect(Utils.isEmptyObj([1,2,3])).toBe(false);
    });
});

describe('isFunction', () => {
    it('should return false for undefined/null', () => {
        expect(Utils.isFunction(undefined)).toBe(false);
        expect(Utils.isFunction(null)).toBe(false);
    });
    it('should return true for functions', () => {
        const x = function() { return 'x'; };
        function y() { return 'y'; }
        expect(Utils.isFunction(x)).toBe(true);
        expect(Utils.isFunction(y)).toBe(true);
        expect(Utils.isFunction(() => {})).toBe(true);
        expect(Utils.isFunction(Utils)).toBe(false);
        expect(Utils.isFunction({})).toBe(false);
        expect(Utils.isFunction([])).toBe(false);
        expect(Utils.isFunction(123)).toBe(false);
        expect(Utils.isFunction('[object Function]')).toBe(false);
    });
});

describe('isObject', () => {
    it('should return false for undefined/null', () => {
        expect(Utils.isObject(undefined)).toBe(false);
        expect(Utils.isObject(null)).toBe(false);
    });
    it('should return true for objects', () => {
        const x = {};
        const y = {key: 'value'};
        function z() { return 'z'; }
        expect(Utils.isObject(x)).toBe(true);
        expect(Utils.isObject(y)).toBe(true);
        expect(Utils.isObject(z)).toBe(false);
        expect(Utils.isObject(() => {})).toBe(false);
        expect(Utils.isObject({})).toBe(true);
        expect(Utils.isObject([])).toBe(false);
        expect(Utils.isObject(123)).toBe(false);
        expect(Utils.isObject('[object Object]')).toBe(false);
    });
});

describe('isString', () => {
    it('should return false for undefined/null', () => {
        expect(Utils.isString(undefined)).toBe(false);
        expect(Utils.isString(null)).toBe(false);
    });
    it('should return true for string', () => {
        const x = {};
        const y = {key: 'value'};
        function z() { return 'z'; }
        expect(Utils.isString(x)).toBe(false);
        expect(Utils.isString(y)).toBe(false);
        expect(Utils.isString(z)).toBe(false);
        expect(Utils.isString(z())).toBe(true);
        expect(Utils.isString(() => {})).toBe(false);
        expect(Utils.isString({})).toBe(false);
        expect(Utils.isString([])).toBe(false);
        expect(Utils.isString(123)).toBe(false);
        expect(Utils.isString('123')).toBe(true);
        expect(Utils.isString('abc')).toBe(true);
    });
});

// no need for test of Utils.onError() at this time.

// no need for test of Utils.onReady() at this time.

describe('padString', () => {
    it('should be null, undefined unsafe', () => {
        expect(() => { Utils.padString(null); }).toThrow(/* cannot call toString() of null */);
        expect(() => { Utils.padString(undefined); }).toThrow(/* cannot call toString() of undefined */);
        // expect(Utils.padString(null, null)).toBe(true);
        // expect(Utils.padString(null, null, null)).toBe(true);
    });
    // it('should be undefined safe', () => {
    //     expect(Utils.caseInsensitiveEquals(undefined, undefined)).toBe(true);
    // });
});