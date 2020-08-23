"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromObservable = exports.fromSubscribable = void 0;
var tslib_1 = require("tslib");
var abstract_class_1 = require("../abstract_class");
var util_1 = require("../util");
exports.fromSubscribable = function (subscribable) {
    return new FromObservableRNClass(subscribable);
};
exports.fromObservable = exports.fromSubscribable;
var FromObservableRNClass = /** @class */ (function (_super) {
    tslib_1.__extends(FromObservableRNClass, _super);
    function FromObservableRNClass(subscribable) {
        var _this = _super.call(this, 'source', 0, [], util_1.none, false) || this;
        _this.subscribable = subscribable;
        _this.subscribable.subscribe(function (value) {
            _this.update(value);
            _this.isUpdated = true;
        }, function (error) {
            _this.complete();
            throw new Error(error);
        }, function () {
            _this.complete();
        });
        return _this;
    }
    return FromObservableRNClass;
}(abstract_class_1.ManagerRNClass));
