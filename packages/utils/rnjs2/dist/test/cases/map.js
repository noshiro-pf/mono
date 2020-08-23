"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapTestCases = void 0;
var create_1 = require("../../src/create");
var operators_1 = require("../../src/operators");
var utils_1 = require("../utils");
var createStreams = function (tick) {
    var counter$ = create_1.interval(tick);
    var double$ = counter$.pipe(operators_1.map(function (x) { return x * 2; }));
    var quad1$ = double$.pipe(operators_1.map(function (x) { return x * 2; }));
    var quad2$ = counter$.pipe(operators_1.map(function (x) { return x * 2; }), operators_1.map(function (x) { return x * 2; }));
    return {
        counter$: counter$,
        double$: double$,
        quad1$: quad1$,
        quad2$: quad2$,
    };
};
exports.mapTestCases = [
    {
        name: 'map case 1',
        numTakeDefault: 10,
        run: function (take, tick) {
            var _a = createStreams(tick), counter$ = _a.counter$, double$ = _a.double$;
            return utils_1.getStreamOutputAsPromise(double$, take, function () {
                counter$.start();
            }, function () {
                counter$.stop();
            });
        },
        preview: function (tick) {
            var _a = createStreams(tick), counter$ = _a.counter$, double$ = _a.double$;
            counter$.subscribe(function (a) { return console.log('counter', a); });
            double$.subscribe(function (a) { return console.log('double', a); });
            console.log(counter$.id, counter$.descendantsIds, counter$.children.map(function (a) { return a.id; }), double$.id, double$.descendantsIds, double$.children.map(function (a) { return a.id; }));
            counter$.start();
        },
    },
    {
        name: 'map case 2',
        numTakeDefault: 10,
        run: function (take, tick) {
            var _a = createStreams(tick), counter$ = _a.counter$, quad1$ = _a.quad1$;
            return utils_1.getStreamOutputAsPromise(quad1$, take, function () {
                counter$.start();
            }, function () {
                counter$.stop();
            });
        },
        preview: function (tick) {
            var _a = createStreams(tick), counter$ = _a.counter$, quad1$ = _a.quad1$;
            counter$.subscribe(function (a) { return console.log('counter', a); });
            quad1$.subscribe(function (a) { return console.log('quad1', a); });
            console.log(counter$.id, counter$.descendantsIds, counter$.children.map(function (a) { return a.id; }), quad1$.id, quad1$.descendantsIds, quad1$.children.map(function (a) { return a.id; }));
            counter$.start();
        },
    },
    {
        name: 'map case 3',
        numTakeDefault: 10,
        run: function (take, tick) {
            var _a = createStreams(tick), counter$ = _a.counter$, quad1$ = _a.quad1$;
            return utils_1.getStreamOutputAsPromise(quad1$, take, function () {
                counter$.start();
            }, function () {
                counter$.stop();
            });
        },
        preview: function (tick) {
            var _a = createStreams(tick), counter$ = _a.counter$, quad2$ = _a.quad2$;
            counter$.subscribe(function (a) { return console.log('counter', a); });
            quad2$.subscribe(function (a) { return console.log('quad2', a); });
            console.log(counter$.id, counter$.descendantsIds, counter$.children.map(function (a) { return a.id; }), quad2$.id, quad2$.descendantsIds, quad2$.children.map(function (a) { return a.id; }));
            counter$.start();
        },
    },
];
