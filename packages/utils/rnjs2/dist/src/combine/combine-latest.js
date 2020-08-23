"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.combineLatest = void 0;
var tslib_1 = require("tslib");
var abstract_class_1 = require("../abstract_class");
var util_1 = require("../util");
exports.combineLatest = function () {
    var rns = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        rns[_i] = arguments[_i];
    }
    return new CombineLatestRNClass(rns);
};
var CombineLatestRNClass = /** @class */ (function (_super) {
    tslib_1.__extends(CombineLatestRNClass, _super);
    function CombineLatestRNClass(parents) {
        return _super.call(this, 'sync child', false, 1 + parents.reduce(function (mx, a) { return Math.max(mx, a.depth); }, 0), parents, util_1.none, false) || this;
    }
    CombineLatestRNClass.prototype.tryUpdate = function () {
        var _this = this;
        this.tryUpdateAndSetFlag(function () {
            if (_this.parents.some(function (a) { return util_1.isNone(a.currentValue); }))
                return false;
            if (_this.parents.every(function (a) { return !a.isUpdated; }))
                return false;
            var currValues = _this.parents.map(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            function (a) { return a.currentValue.value; });
            _this.update(currValues);
            return true;
        });
    };
    return CombineLatestRNClass;
}(abstract_class_1.RNClass));
