"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNotNone = exports.isNone = exports.some = exports.none = exports.noop = exports.binarySearch = exports.halfInt = exports.toNumber = exports.mapNullable = void 0;
exports.mapNullable = function (fn) { return function (value) { return (value === undefined ? undefined : fn(value)); }; };
exports.toNumber = function (value) {
    var result = parseInt(value);
    return Number.isNaN(result) ? undefined : result;
};
exports.halfInt = function (x) {
    return x % 2 === 0
        ? x / 2
        : x % 2 === 1
            ? x > 0
                ? (x - 1) / 2
                : (x + 1) / 2
            : x > 0
                ? Math.floor(x / 2)
                : Math.ceil(x / 2);
};
exports.binarySearch = function (sortedArray, x) {
    if (sortedArray.length === 0)
        return 0;
    var left = 0;
    var right = sortedArray.length - 1;
    var mid = left + exports.halfInt(right - left);
    // loop while x is in the range of [left, right)
    while (left <= right) {
        var curr = sortedArray[mid];
        if (x === curr)
            break;
        if (curr > x) {
            right = mid - 1;
        }
        else {
            left = mid + 1;
        }
        mid = left + exports.halfInt(right - left);
    }
    return mid;
};
exports.noop = function () { return undefined; };
exports.none = { _type: 'None' };
exports.some = function (a) { return ({ _type: 'Some', value: a }); };
exports.isNone = function (value) {
    return value._type === 'None';
};
exports.isNotNone = function (value) {
    return value._type !== 'None';
};
