"use strict";

const Utils = require('../src/labkey/Utils');

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
    const success = () => {};

    it('should handle empty configuration', () => {
        expect(Utils.getOnSuccess({})).toBe(undefined);
    });
    it('should return "success" function', () => {
        expect(Utils.getOnSuccess({success})).toBe(success);
    });
    it('should return "successCallback" function', () => {
        expect(Utils.getOnSuccess({successCallback: success})).toBe(success);
    });
    // Consider testing priority
});

describe('id', () => {
    const defaultPrefix = 'lk-gen';
    let defaultSeed = 100;

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