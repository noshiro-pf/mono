"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditTime = void 0;
var tslib_1 = require("tslib");
var abstract_class_1 = require("../abstract_class");
var util_1 = require("../util");
exports.auditTime = function (millisec) { return function (parent) { return new AuditTimeRNClass(parent, millisec); }; };
var AuditTimeRNClass = /** @class */ (function (_super) {
    tslib_1.__extends(AuditTimeRNClass, _super);
    function AuditTimeRNClass(parent, millisec) {
        var _this = _super.call(this, 'async child', parent, util_1.none, false) || this;
        _this.millisec = millisec;
        _this.isSkippingInput = false;
        _this.nextValueCandidate = util_1.none;
        return _this;
    }
    AuditTimeRNClass.prototype.update = function (nextValue) {
        var _this = this;
        this.isUpdated = false;
        this.nextValueCandidate = util_1.some(nextValue);
        if (this.isSkippingInput)
            return;
        // set timer
        this.isSkippingInput = true;
        this.timerId = setTimeout(function () {
            var curr = _this.nextValueCandidate;
            if (util_1.isNotNone(curr)) {
                _this.isUpdated = true;
                _super.prototype.update.call(_this, curr.value);
                _this.isSkippingInput = false;
            }
        }, this.millisec);
    };
    AuditTimeRNClass.prototype.tryUpdate = function () {
        var _this = this;
        this.tryUpdateAndSetFlag(function () {
            var b = util_1.monoParentTryUpdate(_this.parent);
            if (b === 'skipped')
                return false;
            _this.update(b.value);
            return false;
        });
    };
    AuditTimeRNClass.prototype.complete = function () {
        if (this.timerId !== undefined) {
            clearInterval(this.timerId);
        }
    };
    return AuditTimeRNClass;
}(abstract_class_1.ManagerOperatorRNClass));
