"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throttleTime = void 0;
var tslib_1 = require("tslib");
var abstract_class_1 = require("../abstract_class");
var util_1 = require("../util");
exports.throttleTime = function (millisec) { return function (parent) { return new ThrottleTimeRNClass(parent, millisec); }; };
var ThrottleTimeRNClass = /** @class */ (function (_super) {
    tslib_1.__extends(ThrottleTimeRNClass, _super);
    function ThrottleTimeRNClass(parent, millisec) {
        var _this = _super.call(this, 'async child', parent, util_1.none, false) || this;
        _this.millisec = millisec;
        _this.isSkippingInput = false;
        _this.nextValueCandidate = util_1.none;
        return _this;
    }
    ThrottleTimeRNClass.prototype.update = function (nextValue) {
        var _this = this;
        this.isUpdated = false;
        this.nextValueCandidate = util_1.some(nextValue);
        if (this.isSkippingInput)
            return;
        var curr = this.nextValueCandidate;
        if (util_1.isNone(curr))
            return;
        this.isUpdated = true;
        _super.prototype.update.call(this, curr.value);
        // set timer
        this.isSkippingInput = true;
        this.timerId = setTimeout(function () {
            _this.isSkippingInput = false;
        }, this.millisec);
    };
    ThrottleTimeRNClass.prototype.tryUpdate = function () {
        var _this = this;
        this.tryUpdateAndSetFlag(function () {
            var b = util_1.monoParentTryUpdate(_this.parent);
            if (b === 'skipped')
                return false;
            _this.update(b.value);
            return false;
        });
    };
    ThrottleTimeRNClass.prototype.complete = function () {
        if (this.timerId !== undefined) {
            clearInterval(this.timerId);
        }
    };
    return ThrottleTimeRNClass;
}(abstract_class_1.ManagerOperatorRNClass));
