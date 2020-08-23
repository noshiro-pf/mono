"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeTestCases = void 0;
var combine_1 = require("../../src/combine");
var create_1 = require("../../src/create");
var operators_1 = require("../../src/operators");
var utils_1 = require("../utils");
/*
  counter   0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18  19  20  21  22  23
  even      0       2       4       6       8       10      12      14      16      18      20      22
  odd          "1"     "3"     "5"     "7"     "9"     "11"    "13"    "15"    "17"    "19"    "21"    "23"
  merged    0  "1"  2  "3"  4  "5"  6  "7"  8  "9"  10 "11" 12 "13" 14 "15" 16 "17" 18 "19" 20 "21" 22 "23"
*/
var createStreams = function (tick) {
    var counter$ = create_1.interval(tick);
    var even$ = counter$.pipe(operators_1.filter(function (n) { return n % 2 === 0; }));
    var odd$ = counter$.pipe(operators_1.filter(function (n) { return n % 2 === 1; }), operators_1.map(function (a) { return a.toString(); }));
    var merged$ = combine_1.merge(even$, odd$);
    return {
        counter$: counter$,
        even$: even$,
        odd$: odd$,
        merged$: merged$,
    };
};
exports.mergeTestCases = [
    {
        name: 'merge case 1',
        numTakeDefault: 6,
        run: function (take, tick) {
            var _a = createStreams(tick), counter$ = _a.counter$, merged$ = _a.merged$;
            return utils_1.getStreamOutputAsPromise(merged$, take, function () {
                counter$.start();
            }, function () {
                counter$.stop();
            });
        },
        preview: function (tick) {
            var _a = createStreams(tick), counter$ = _a.counter$, even$ = _a.even$, odd$ = _a.odd$, merged$ = _a.merged$;
            even$.subscribe(function (a) { return console.log('even', a); });
            odd$.subscribe(function (a) { return console.log('odd', a); });
            merged$.subscribe(function (a) { return console.log('merged', a); });
            counter$.start();
        },
    },
];
