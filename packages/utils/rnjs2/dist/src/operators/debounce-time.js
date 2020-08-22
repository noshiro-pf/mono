"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debounceTime = void 0;
var tslib_1 = require("tslib");
var abstract_class_1 = require("../abstract_class");
var util_1 = require("../util");
exports.debounceTime = function (millisec) { return function (parent) { return new DebounceTimeRNClass(parent, millisec); }; };
var DebounceTimeRNClass = /** @class */ (function (_super) {
    tslib_1.__extends(DebounceTimeRNClass, _super);
    function DebounceTimeRNClass(parent, millisec) {
        var _this = _super.call(this, 'async child', parent, util_1.none, false) || this;
        _this.millisec = millisec;
        return _this;
    }
    DebounceTimeRNClass.prototype.update = function (nextValue) {
        var _this = this;
        // reset timer
        if (this.timerId !== undefined) {
            clearTimeout(this.timerId);
        }
        // set timer
        this.timerId = setTimeout(function () {
            _this.isUpdated = true;
            _super.prototype.update.call(_this, nextValue);
        }, this.millisec);
    };
    DebounceTimeRNClass.prototype.tryUpdate = function () {
        var _this = this;
        this.tryUpdateAndSetFlag(function () {
            var b = util_1.monoParentTryUpdate(_this.parent);
            if (b === 'skipped')
                return false;
            _this.update(b.value);
            return false;
        });
    };
    DebounceTimeRNClass.prototype.complete = function () {
        if (this.timerId !== undefined) {
            clearInterval(this.timerId);
        }
    };
    return DebounceTimeRNClass;
}(abstract_class_1.ManagerOperatorRNClass));
