"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.combineLatestTestCases = void 0;
var combine_1 = require("../../src/combine");
var create_1 = require("../../src/create");
var operators_1 = require("../../src/operators");
var utils_1 = require("../utils");
/*
 *  [      counter      ]
 *    |           |
 *    |           |
 * [double]    [square]
 *    |  \        |  \
 *    | [quad]    | [squareEven]
 *    |     |     |     |
 *    |     |     |     |
 *  [      combined       ]
 */
var createStreams = function (tick) {
    var counter$ = create_1.interval(tick);
    var double$ = counter$.pipe(operators_1.map(function (x) { return x * 2; }));
    var quad$ = counter$.pipe(operators_1.map(function (x) { return x * 2; }), operators_1.map(function (x) { return x * 2; }));
    var square$ = counter$.pipe(operators_1.map(function (x) { return x * x; }));
    var squareEven$ = square$.pipe(operators_1.filter(function (x) { return x % 2 === 0; }));
    var combined$ = combine_1.combineLatest(counter$, double$, quad$, square$, squareEven$);
    return {
        counter$: counter$,
        double$: double$,
        quad$: quad$,
        square$: square$,
        squareEven$: squareEven$,
        combined$: combined$,
    };
};
exports.combineLatestTestCases = [
    {
        name: 'combineLatest case 1',
        numTakeDefault: 10,
        run: function (take, tick) {
            var _a = createStreams(tick), counter$ = _a.counter$, combined$ = _a.combined$;
            return utils_1.getStreamOutputAsPromise(combined$, take, function () {
                counter$.start();
            }, function () {
                counter$.stop();
            });
        },
        preview: function (tick) {
            var _a = createStreams(tick), counter$ = _a.counter$, double$ = _a.double$, quad$ = _a.quad$, square$ = _a.square$, squareEven$ = _a.squareEven$, combined$ = _a.combined$;
            counter$.subscribe(function (a) { return console.log('counter', a); });
            double$.subscribe(function (a) { return console.log('double', a); });
            quad$.subscribe(function (a) { return console.log('quad', a); });
            square$.subscribe(function (a) { return console.log('square', a); });
            squareEven$.subscribe(function (a) { return console.log('squareEven', a); });
            combined$.subscribe(function (a) { return console.log('combined', a); });
            console.log(counter$.id, counter$.descendantsIds, counter$.children.map(function (a) { return a.id; }), double$.id, double$.descendantsIds, double$.children.map(function (a) { return a.id; }), quad$.id, quad$.descendantsIds, quad$.children.map(function (a) { return a.id; }), square$.id, square$.descendantsIds, square$.children.map(function (a) { return a.id; }), squareEven$.id, squareEven$.descendantsIds, squareEven$.children.map(function (a) { return a.id; }), combined$.id, combined$.descendantsIds, combined$.children.map(function (a) { return a.id; }));
            counter$.start();
        },
    },
];
