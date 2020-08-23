"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interval = void 0;
var tslib_1 = require("tslib");
var abstract_class_1 = require("../abstract_class");
var util_1 = require("../util");
exports.interval = function (millisec) {
    return new IntervalRNClass(millisec);
};
var IntervalRNClass = /** @class */ (function (_super) {
    tslib_1.__extends(IntervalRNClass, _super);
    function IntervalRNClass(millisec) {
        var _this = _super.call(this, 'source', 0, [], util_1.none, false) || this;
        _this.counter = 0;
        _this.millisec = millisec;
        return _this;
    }
    IntervalRNClass.prototype.start = function () {
        var _this = this;
        if (this.isCompleted)
            return;
        this.isUpdated = true;
        this.update(0);
        this.timerId = setInterval(function () {
            _this.counter += 1;
            _this.update(_this.counter);
        }, this.millisec);
    };
    IntervalRNClass.prototype.stop = function () {
        this.complete();
    };
    IntervalRNClass.prototype.tryUpdate = function () {
        // Manual updates are not allowed.
        return;
    };
    IntervalRNClass.prototype.complete = function () {
        if (this.timerId !== undefined) {
            clearInterval(this.timerId);
        }
    };
    return IntervalRNClass;
}(abstract_class_1.ManagerRNClass));
