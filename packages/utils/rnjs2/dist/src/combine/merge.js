"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.merge = void 0;
var tslib_1 = require("tslib");
var abstract_class_1 = require("../abstract_class");
var util_1 = require("../util");
exports.merge = function () {
    var srcs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        srcs[_i] = arguments[_i];
    }
    return new MergeRNClass(srcs);
};
var MergeRNClass = /** @class */ (function (_super) {
    tslib_1.__extends(MergeRNClass, _super);
    function MergeRNClass(parents) {
        var _this = _super.call(this, 'merge', false, 1 + parents.reduce(function (mx, a) { return Math.max(mx, a.depth); }, 0), parents, util_1.none, false) || this;
        _this._nextValueCandidate = util_1.none;
        _this._subscriptions = parents.map(function (p) {
            return p.subscribe(function (v) {
                _this._nextValueCandidate = util_1.some(v);
            });
        });
        return _this;
    }
    MergeRNClass.prototype.tryUpdate = function () {
        var _this = this;
        this.tryUpdateAndSetFlag(function () {
            if (util_1.isNone(_this._nextValueCandidate))
                return false;
            if (_this.parents.every(function (a) { return !a.isUpdated; }))
                return false;
            _super.prototype.update.call(_this, _this._nextValueCandidate.value);
            return true;
        });
    };
    MergeRNClass.prototype.complete = function () {
        this._subscriptions.forEach(function (s) {
            s.unsubscribe();
        });
        _super.prototype.complete.call(this);
    };
    return MergeRNClass;
}(abstract_class_1.RNClass));
