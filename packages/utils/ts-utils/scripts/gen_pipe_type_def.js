"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fs_1 = tslib_1.__importDefault(require("fs"));
var funcTypeName = 'FuncType';
var header = "\nexport const pipe: Pipe = (x: any, ...fns: " + funcTypeName + "<any, any>[]) =>\n  fns.reduce((curr, f) => f(curr) as unknown, x) as unknown;\n\ntype " + funcTypeName + "<A, B> = (v: A) => B;\n\nexport interface Pipe {\n";
var range = function (start, end) {
    return new Array(end - start).fill(0).map(function (_, i) { return start + i; });
};
var genPipeMethod = function (length) {
    if (length < 2)
        return '';
    // length === 3 =>
    // ```
    // <T0, T1, T2>(x: T0, f1: FuncType<T0, T1>, f2: FuncType<T1, T2>): T2;
    // ```
    var typeVars = range(0, length).map(function (i) { return "T" + i; });
    var result = "<" + typeVars.join(',') + ">(x: " + typeVars[0] + ", ";
    for (var i = 1; i < length; ++i) {
        result += "f" + i + ": " + funcTypeName + "<" + typeVars[i - 1] + ", " + typeVars[i] + ">, ";
    }
    result += "): " + typeVars[length - 1] + ";";
    return result;
};
var footer = "\n  <T0>(x: T0, f1: " + funcTypeName + "<T0, any>, ...fns: " + funcTypeName + "<any, any>[]): any;\n}\n";
var createPipeTypeDef = function (length) {
    return [
        header,
        range(2, length + 1)
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
    var result = createPipeTypeDef(length);
    fs_1.default.writeFile(path, result, { flag: 'w' }, function () { return undefined; });
};
main();
