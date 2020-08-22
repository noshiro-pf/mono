"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.intervalTestCases = void 0;
var create_1 = require("../../src/create");
var utils_1 = require("../utils");
exports.intervalTestCases = [
    {
        name: 'interval case 1',
        numTakeDefault: 10,
        run: function (take, tick) {
            var source$ = create_1.interval(tick);
            return utils_1.getStreamOutputAsPromise(source$, take, function () {
                source$.start();
            }, function () {
                source$.stop();
            });
        },
        preview: function (tick) {
            var source$ = create_1.interval(tick);
            source$.subscribe(function (a) { return console.log('interval', a); });
        },
    },
];
