"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throttleTimeTestCases = void 0;
var combine_1 = require("../../src/combine");
var create_1 = require("../../src/create");
var operators_1 = require("../../src/operators");
var utils_1 = require("../utils");
/*
  counter      0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18  19  20  21  22  23
  filtered         1   2   3               7       9   10      12  13          16  17  18  19  20
  throttleTime     1                       7           10          13          16
*/
var createStreams = function (tick) {
    var emitValues = [1, 2, 3, 7, 9, 10, 12, 13, 16, 17, 18, 19, 20];
    var counter$ = create_1.interval(tick);
    var filtered$ = counter$.pipe(operators_1.filter(function (n) { return emitValues.includes(n); }));
    var throttleTime$ = filtered$.pipe(operators_1.throttleTime(tick * 2.5));
    var merged$ = combine_1.merge(filtered$, throttleTime$);
    return {
        counter$: counter$,
        filtered$: filtered$,
        throttleTime$: throttleTime$,
        merged$: merged$,
    };
};
exports.throttleTimeTestCases = [
    {
        name: 'throttleTime case 1',
        numTakeDefault: 5,
        run: function (take, tick) {
            var _a = createStreams(tick), counter$ = _a.counter$, throttleTime$ = _a.throttleTime$;
            return utils_1.getStreamOutputAsPromise(throttleTime$, take, function () {
                counter$.start();
            }, function () {
                counter$.stop();
            });
        },
        preview: function (tick) {
            var _a = createStreams(tick), counter$ = _a.counter$, filtered$ = _a.filtered$, throttleTime$ = _a.throttleTime$;
            filtered$.subscribe(function (a) { return console.log('filtered', a); });
            throttleTime$.subscribe(function (a) { return console.log('throttleTime', a); });
            counter$.start();
        },
    },
    {
        name: 'throttleTime case 2',
        numTakeDefault: 16,
        run: function (take, tick) {
            var _a = createStreams(tick), counter$ = _a.counter$, merged$ = _a.merged$;
            return utils_1.getStreamOutputAsPromise(merged$, take, function () {
                counter$.start();
            }, function () {
                counter$.stop();
            });
        },
        preview: function (tick) {
            var _a = createStreams(tick), counter$ = _a.counter$, filtered$ = _a.filtered$, throttleTime$ = _a.throttleTime$, merged$ = _a.merged$;
            filtered$.subscribe(function (a) { return console.log('filtered', a); });
            throttleTime$.subscribe(function (a) { return console.log('throttleTime', a); });
            merged$.subscribe(function (a) {
                return console.log('merged', a, filtered$.isUpdated, throttleTime$.isUpdated);
            });
            counter$.start();
        },
    },
];
