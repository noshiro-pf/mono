"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debounceTimeTestCases = void 0;
var combine_1 = require("../../src/combine");
var create_1 = require("../../src/create");
var operators_1 = require("../../src/operators");
var utils_1 = require("../utils");
/*
  counter   0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18  19  20
  even      0       2       4       6       8       10      12      14      16      18      20
  filtered  0   1   2   3   4                       10  11  12  13  14
  debounced                             4                                       14
  combined                              x   x       x       x       x       x   x   x       x
*/
var createStreams = function (tick) {
    var counter$ = create_1.interval(tick);
    var even$ = counter$.pipe(operators_1.filter(function (n) { return n % 2 === 0; }));
    var filtered$ = counter$.pipe(operators_1.filter(function (n) { return n % 10 < 5; }));
    var debounced$ = filtered$.pipe(operators_1.debounceTime(tick * 3));
    var combined$ = combine_1.combineLatest(even$, debounced$);
    return {
        counter$: counter$,
        even$: even$,
        filtered$: filtered$,
        debounced$: debounced$,
        combined$: combined$,
    };
};
exports.debounceTimeTestCases = [
    {
        name: 'debounceTime case 1',
        numTakeDefault: 20,
        run: function (take, tick) {
            var _a = createStreams(tick), counter$ = _a.counter$, combined$ = _a.combined$;
            return utils_1.getStreamOutputAsPromise(combined$, take, function () {
                counter$.start();
            }, function () {
                counter$.stop();
            });
        },
        preview: function (tick) {
            var _a = createStreams(tick), counter$ = _a.counter$, even$ = _a.even$, filtered$ = _a.filtered$, debounced$ = _a.debounced$, combined$ = _a.combined$;
            console.log(counter$.id, counter$.descendantsIds, counter$.children.map(function (a) { return a.id; }), even$.id, even$.descendantsIds, even$.children.map(function (a) { return a.id; }), filtered$.id, filtered$.descendantsIds, filtered$.children.map(function (a) { return a.id; }), debounced$.id, debounced$.descendantsIds, debounced$.children.map(function (a) { return a.id; }), combined$.id, combined$.descendantsIds, combined$.children.map(function (a) { return a.id; }));
            even$.subscribe(function (a) { return console.log('even', a); });
            filtered$.subscribe(function (a) { return console.log('filtered', a); });
            debounced$.subscribe(function (a) { return console.log('debounced', a); });
            combined$.subscribe(function (a) { return console.log('combined', a); });
            counter$.start();
        },
    },
];
