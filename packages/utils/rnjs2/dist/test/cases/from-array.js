"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromArrayTestCases = void 0;
var create_1 = require("../../src/create");
var utils_1 = require("../utils");
var createStream = function () {
    return create_1.fromArray([1, 1, 2, 3, 5, 8, 13, 21, 34, 55]);
};
exports.fromArrayTestCases = [
    {
        name: 'fromArray case 1',
        numTakeDefault: 9,
        run: function (take) {
            var source$ = createStream();
            return utils_1.getStreamOutputAsPromise(source$, take, function () {
                source$.emit();
            });
        },
        preview: function () {
            var source$ = createStream();
            source$.subscribe(function (a) { return console.log('fromArray', a); });
            source$.emit();
        },
    },
];
