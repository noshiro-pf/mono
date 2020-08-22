"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromPromiseTestCases = void 0;
var create_1 = require("../../src/create");
var utils_1 = require("../utils");
var valueToEmit = 1;
var createStream = function (tick) {
    var promise = new Promise(function (resolve) {
        setTimeout(function () { return resolve(valueToEmit); }, tick);
    });
    return create_1.fromPromise(promise);
};
exports.fromPromiseTestCases = [
    {
        name: 'fromPromise case 1',
        numTakeDefault: 1,
        run: function (take, tick) {
            var source$ = createStream(tick);
            return utils_1.getStreamOutputAsPromise(source$, take, function () { return null; });
        },
        preview: function (tick) {
            var source$ = createStream(tick);
            source$.subscribe(function (a) { return console.log('fromPromise', a); });
        },
    },
];
