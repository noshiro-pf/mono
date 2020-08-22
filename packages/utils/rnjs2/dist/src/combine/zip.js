"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zip = void 0;
var tslib_1 = require("tslib");
var abstract_class_1 = require("../abstract_class");
var util_1 = require("../util");
exports.zip = function () {
    var rns = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        rns[_i] = arguments[_i];
    }
    return new ZipRNClass(rns);
};
var ZipRNClass = /** @class */ (function (_super) {
    tslib_1.__extends(ZipRNClass, _super);
    function ZipRNClass(parents) {
        var _this = _super.call(this, 'sync child', false, 1 + parents.reduce(function (mx, a) { return Math.max(mx, a.depth); }, 0), parents, util_1.none, false) || this;
        _this._nextValueQueues = parents.map(function () { return []; });
        _this._subscriptions = parents.map(function (p, i) {
            return p.subscribe(function (v) {
                _this._nextValueQueues[i].push(v);
            });
        });
        return _this;
    }
    ZipRNClass.prototype.tryUpdate = function () {
        var _this = this;
        this.tryUpdateAndSetFlag(function () {
            if (_this.parents.some(function (a) { return util_1.isNone(a.currentValue); }))
                return false;
            if (_this.parents.every(function (a) { return !a.isUpdated; }))
                return false;
            if (_this._nextValueQueues.some(function (q) { return q.length === 0; }))
                return false;
            var currValues = _this._nextValueQueues.map(function (q) { return q.shift(); });
            _this.update(currValues);
            return true;
        });
    };
    ZipRNClass.prototype.complete = function () {
        this._subscriptions.forEach(function (s) {
            s.unsubscribe();
        });
        _super.prototype.complete.call(this);
    };
    return ZipRNClass;
}(abstract_class_1.RNClass));
