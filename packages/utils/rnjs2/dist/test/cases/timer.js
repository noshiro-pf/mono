"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timerTestCases = void 0;
var create_1 = require("../../src/create");
var utils_1 = require("../utils");
exports.timerTestCases = [
    {
        name: 'timer case 1',
        numTakeDefault: 1,
        run: function (take, tick) {
            var source$ = create_1.timer(tick);
            return utils_1.getStreamOutputAsPromise(source$, take, function () {
                source$.start();
            }, function () {
                source$.stop();
            });
        },
        preview: function (tick) {
            var source$ = create_1.timer(tick);
            source$.subscribe(function (a) { return console.log('timer', a); });
        },
    },
];
