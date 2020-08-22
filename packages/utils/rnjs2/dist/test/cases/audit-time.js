"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditTimeTestCases = void 0;
var combine_1 = require("../../src/combine");
var create_1 = require("../../src/create");
var operators_1 = require("../../src/operators");
var audit_time_1 = require("../../src/operators/audit-time");
var utils_1 = require("../utils");
/*
  counter   0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18  19  20  21  22  23
  filtered      1       3   4                       10          13          16  17  18  19  20
  auditTime               3           4                       10          13          18          20
*/
var createStreams = function (tick) {
    var emitValues = [1, 3, 4, 10, 13, 16, 17, 18, 19, 20];
    var counter$ = create_1.interval(tick);
    var filtered$ = counter$.pipe(operators_1.filter(function (n) { return emitValues.includes(n); }));
    var auditTime$ = filtered$.pipe(audit_time_1.auditTime(tick * 2.5));
    var merged$ = combine_1.merge(filtered$, auditTime$);
    return {
        counter$: counter$,
        filtered$: filtered$,
        auditTime$: auditTime$,
        merged$: merged$,
    };
};
exports.auditTimeTestCases = [
    {
        name: 'auditTime case 1',
        numTakeDefault: 6,
        run: function (take, tick) {
            var _a = createStreams(tick), counter$ = _a.counter$, auditTime$ = _a.auditTime$;
            return utils_1.getStreamOutputAsPromise(auditTime$, take, function () {
                counter$.start();
            }, function () {
                counter$.stop();
            });
        },
        preview: function (tick) {
            var _a = createStreams(tick), counter$ = _a.counter$, filtered$ = _a.filtered$, auditTime$ = _a.auditTime$;
            filtered$.subscribe(function (a) { return console.log('filtered', a); });
            auditTime$.subscribe(function (a) { return console.log('auditTime', a); });
            counter$.start();
        },
    },
    {
        name: 'auditTime case 2',
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
            var _a = createStreams(tick), counter$ = _a.counter$, filtered$ = _a.filtered$, auditTime$ = _a.auditTime$, merged$ = _a.merged$;
            filtered$.subscribe(function (a) { return console.log('filtered', a); });
            auditTime$.subscribe(function (a) { return console.log('auditTime', a); });
            merged$.subscribe(function (a) {
                return console.log('merged', a, filtered$.isUpdated, auditTime$.isUpdated);
            });
            counter$.start();
        },
    },
];
