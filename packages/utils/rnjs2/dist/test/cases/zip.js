"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zipTestCases = void 0;
var combine_1 = require("../../src/combine");
var create_1 = require("../../src/create");
var operators_1 = require("../../src/operators");
var utils_1 = require("../utils");
/*
  counter   0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18  19  20  21  22  23
  even      0       2       4       6       8       10      12      14      16      18      20      22
  n%3       0           3           6           9           12          15          18          21
  zipped    [0,0]       [2,3]       [4,6]       [6,9]       [8,12]      [10,15]     [12,18]     [14,21]
*/
var createStreams = function (tick) {
    var counter$ = create_1.interval(tick);
    var even$ = counter$.pipe(operators_1.filter(function (n) { return n % 2 === 0; }));
    var multiplesOf3$ = counter$.pipe(operators_1.filter(function (n) { return n % 3 === 0; }));
    var zipped$ = combine_1.zip(even$, multiplesOf3$);
    return {
        counter$: counter$,
        even$: even$,
        multiplesOf3$: multiplesOf3$,
        zipped$: zipped$,
    };
};
exports.zipTestCases = [
    {
        name: 'merge case 1',
        numTakeDefault: 12,
        run: function (take, tick) {
            var _a = createStreams(tick), counter$ = _a.counter$, zipped$ = _a.zipped$;
            return utils_1.getStreamOutputAsPromise(zipped$, take, function () {
                counter$.start();
            }, function () {
                counter$.stop();
            });
        },
        preview: function (tick) {
            var _a = createStreams(tick), counter$ = _a.counter$, even$ = _a.even$, multiplesOf3$ = _a.multiplesOf3$, zipped$ = _a.zipped$;
            even$.subscribe(function (a) { return console.log('even', a); });
            multiplesOf3$.subscribe(function (a) { return console.log('multiplesOf3', a); });
            zipped$.subscribe(function (a) { return console.log('zipped', a); });
            counter$.start();
        },
    },
];
