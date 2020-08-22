"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
describe('mapNullable', function () {
    var sq = function (x) { return Math.pow(x, 2); };
    test('case 1', function () {
        expect(utils_1.mapNullable(sq)(2)).toBe(4);
    });
    test('case 2', function () {
        expect(utils_1.mapNullable(sq)(0)).toBe(0);
    });
    test('case 3', function () {
        expect(utils_1.mapNullable(sq)(undefined)).toBe(undefined);
    });
});
describe('halfInt', function () {
    test('case: even number', function () {
        expect(utils_1.halfInt(2)).toBe(1);
    });
    test('case: odd positive number', function () {
        expect(utils_1.halfInt(3)).toBe(1);
    });
    test('case: odd negative number', function () {
        expect(utils_1.halfInt(-3)).toBe(-1);
    });
    test('case: float positive number', function () {
        expect(utils_1.halfInt(3.3)).toBe(1);
    });
    test('case: float negative number', function () {
        expect(utils_1.halfInt(-3.3)).toBe(-1);
    });
});
describe('binarySearch', function () {
    test('empty array', function () {
        expect(utils_1.binarySearch([], 0)).toBe(0);
    });
    test('1 element array (1)', function () {
        expect(utils_1.binarySearch([1], 0)).toBe(0);
    });
    test('1 element array (2)', function () {
        expect(utils_1.binarySearch([-1], 0)).toBe(1);
    });
    test('2 element array (1)', function () {
        expect(utils_1.binarySearch([-1, 1], 0)).toBe(1);
    });
    test('2 element array (2)', function () {
        expect(utils_1.binarySearch([1, 2], 0)).toBe(0);
    });
    test('2 element array (3)', function () {
        expect(utils_1.binarySearch([-2, -1], 0)).toBe(2);
    });
    test('array with same value (1)', function () {
        expect([0, 1].includes(utils_1.binarySearch([0], 0))).toBeTruthy();
    });
    test('array with same value (2)', function () {
        expect([0, 1, 2].includes(utils_1.binarySearch([0, 0], 0))).toBeTruthy();
    });
    test('array with same value (3)', function () {
        expect([0, 1, 2, 3].includes(utils_1.binarySearch([0, 0, 0], 0))).toBeTruthy();
    });
    test('complicated example', function () {
        expect([2, 3].includes(utils_1.binarySearch([1, 3, 4, 6, 7, 8], 4))).toBeTruthy();
    });
    test('complicated example', function () {
        expect([2, 3, 4].includes(utils_1.binarySearch([1, 3, 4, 4, 6, 7, 8], 4))).toBeTruthy();
    });
    test('complicated example', function () {
        expect(utils_1.binarySearch([1, 3, 4, 4, 6, 7, 8], 0)).toBe(0);
    });
    test('complicated example', function () {
        expect([0, 1].includes(utils_1.binarySearch([1, 3, 4, 4, 6, 7, 8], 1))).toBeTruthy();
    });
    test('complicated example', function () {
        expect([0, 1, 2, 3].includes(utils_1.binarySearch([1, 1, 1, 3, 4, 4, 6, 7, 8], 1))).toBeTruthy();
    });
    test('complicated example', function () {
        expect([5, 6].includes(utils_1.binarySearch([1, 3, 4, 4, 6, 7, 8], 7))).toBeTruthy();
    });
    test('complicated example', function () {
        expect([6, 7].includes(utils_1.binarySearch([1, 3, 4, 4, 6, 7, 8], 8))).toBeTruthy();
    });
    test('complicated example', function () {
        expect(utils_1.binarySearch([1, 3, 4, 4, 6, 7, 8], 9)).toBe(7);
    });
});
