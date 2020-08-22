"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInRange = exports.testStream = exports.getStreamOutputAsPromise = void 0;
var constants_1 = require("./constants");
exports.getStreamOutputAsPromise = function (stream$, take, startSource, stopSource) {
    return new Promise(function (resolve) {
        var output = [];
        stream$.subscribe(function (a) {
            output.push(a);
            if (output.length >= take) {
                if (stopSource != null)
                    stopSource();
                resolve(output);
            }
        });
        startSource();
    });
};
exports.testStream = function (testCase, expected) {
    test(testCase.name, function () {
        return testCase
            .run(expected.length, constants_1.TICK.test)
            .then(function (result) { return expect(result).toEqual(expected); });
    });
};
exports.isInRange = function (array, idx) {
    return 0 <= idx && idx < array.length;
};
