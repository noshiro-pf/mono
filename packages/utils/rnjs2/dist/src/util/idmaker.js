"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genId = void 0;
var tslib_1 = require("tslib");
// const genId = () => Symbol('RNId');
function idMaker() {
    var i;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                i = 0;
                _a.label = 1;
            case 1:
                if (!true) return [3 /*break*/, 3];
                return [4 /*yield*/, i];
            case 2:
                _a.sent();
                i += 1;
                return [3 /*break*/, 1];
            case 3: return [2 /*return*/];
        }
    });
}
var idmaker = idMaker();
exports.genId = function () { return idmaker.next().value; };
