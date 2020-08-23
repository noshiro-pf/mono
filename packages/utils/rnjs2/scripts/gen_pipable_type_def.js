"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fs_1 = tslib_1.__importDefault(require("fs"));
var header = "\nimport { Operator } from '../types';\nimport { RN } from './rn-interface';\n\nexport interface Pipable<A> {\n";
var seq = function (start, end) {
    return new Array(end - start).fill(0).map(function (_, i) { return i + start; });
};
var genPipeMethod = function (length) {
    var e_1, _a;
    if (length < 1)
        return '';
    // length === 3 =>
    //    `
    //      pipe<T1, T2, T3>(
    //        op1: Operator<A, T1>,
    //        op2: Operator<T1, T2>,
    //        op3: Operator<T2, T3>
    //      ): RN<T3>;
    //    `
    var typeVarList = seq(1, length + 1).map(function (i) { return "T" + i; });
    var result = '';
    result += "  pipe<" + typeVarList.join(', ') + ">(\n";
    var currTypeVar = 'A';
    try {
        for (var _b = tslib_1.__values(typeVarList.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _d = tslib_1.__read(_c.value, 2), index = _d[0], nextTypeVar = _d[1];
            result += "    op" + (index + 1) + ": Operator<" + currTypeVar + ", " + nextTypeVar + ">,\n";
            currTypeVar = nextTypeVar;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    result += "  ): RN<" + currTypeVar + ">;\n";
    return result;
};
var footer = "\n  pipe(\n    ...operators: readonly [Operator<any, any>, ...Operator<any, any>[]]\n  ): RN<any>;\n}\n";
var createPipableTypeDef = function (length) {
    return [
        header,
        seq(1, length + 1)
            .map(genPipeMethod)
            .join('\n'),
        footer,
    ].join('\n');
};
var input = function () {
    var args = process.argv.slice(2);
    if (args.length !== 2) {
        throw new Error('Exactly 2 arguments are required.');
    }
    var length = Number(args[0]);
    var path = args[1];
    if (Number.isNaN(length)) {
        throw new Error('The first argument must be integer.');
    }
    var MIN_LENGTH = 6;
    if (length < MIN_LENGTH) {
        throw new Error("Length must be greater than or equal to " + MIN_LENGTH + ".");
    }
    if (!path) {
        throw new Error('Path is required.');
    }
    return [length, path];
};
var main = function () {
    var _a = tslib_1.__read(input(), 2), length = _a[0], path = _a[1];
    var result = createPipableTypeDef(length);
    fs_1.default.writeFile(path, result, { flag: 'w' }, function () { return undefined; });
};
main();
