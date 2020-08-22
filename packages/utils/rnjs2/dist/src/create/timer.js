"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timer = void 0;
var tslib_1 = require("tslib");
var abstract_class_1 = require("../abstract_class");
var util_1 = require("../util");
exports.timer = function (millisec) { return new TimerRNClass(millisec); };
var TimerRNClass = /** @class */ (function (_super) {
    tslib_1.__extends(TimerRNClass, _super);
    function TimerRNClass(millisec) {
        var _this = _super.call(this, 'source', 0, [], util_1.none, false) || this;
        _this.millisec = millisec;
        return _this;
    }
    TimerRNClass.prototype.start = function () {
        var _this = this;
        if (this.isCompleted)
            return;
        this.isUpdated = true;
        this.update(0);
        this.timerId = setTimeout(function () {
            _this.update(0);
        }, this.millisec);
    };
    TimerRNClass.prototype.stop = function () {
        this.complete();
    };
    TimerRNClass.prototype.tryUpdate = function () {
        // Manual updates are not allowed.
        return;
    };
    TimerRNClass.prototype.complete = function () {
        if (this.timerId !== undefined) {
            clearInterval(this.timerId);
        }
    };
    return TimerRNClass;
}(abstract_class_1.ManagerRNClass));
