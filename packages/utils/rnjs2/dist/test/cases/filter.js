"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterTestCases = void 0;
var create_1 = require("../../src/create");
var operators_1 = require("../../src/operators");
var utils_1 = require("../utils");
/*
  counter   0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18  19  20
  even      0       2       4       6       8       10      12      14      16      18      20
  filtered  0   1   2   3   4                       10  11  12  13  14
*/
var createStreams = function (tick) {
    var counter$ = create_1.interval(tick);
    var even$ = counter$.pipe(operators_1.filter(function (n) { return n % 2 === 0; }));
    var filtered$ = counter$.pipe(operators_1.filter(function (n) { return n % 10 < 5; }));
    return {
        counter$: counter$,
        even$: even$,
        filtered$: filtered$,
    };
};
exports.filterTestCases = [
    {
        name: 'filter case 1',
        numTakeDefault: 10,
        run: function (take, tick) {
            var _a = createStreams(tick), counter$ = _a.counter$, filtered$ = _a.filtered$;
            return utils_1.getStreamOutputAsPromise(filtered$, take, function () {
                counter$.start();
            }, function () {
                counter$.stop();
            });
        },
        preview: function (tick) {
            var _a = createStreams(tick), counter$ = _a.counter$, even$ = _a.even$, filtered$ = _a.filtered$;
            console.log(counter$.id, counter$.descendantsIds, counter$.children.map(function (a) { return a.id; }), even$.id, even$.descendantsIds, even$.children.map(function (a) { return a.id; }), filtered$.id, filtered$.descendantsIds, filtered$.children.map(function (a) { return a.id; }));
            even$.subscribe(function (a) { return console.log('even', a); });
            filtered$.subscribe(function (a) { return console.log('filtered', a); });
            counter$.start();
        },
    },
];
