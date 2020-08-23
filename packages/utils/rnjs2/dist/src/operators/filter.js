"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filter = void 0;
var tslib_1 = require("tslib");
var abstract_class_1 = require("../abstract_class");
var util_1 = require("../util");
exports.filter = function (filterFn) { return function (parent) { return new FilterRNClass(parent, filterFn); }; };
var FilterRNClass = /** @class */ (function (_super) {
    tslib_1.__extends(FilterRNClass, _super);
    function FilterRNClass(parent, filterFn) {
        var _this = _super.call(this, 'sync child', parent, util_1.none, false) || this;
        _this.filterFn = filterFn;
        return _this;
    }
    FilterRNClass.prototype.tryUpdate = function () {
        var _this = this;
        this.tryUpdateAndSetFlag(function () {
            var b = util_1.monoParentTryUpdate(_this.parent);
            if (b === 'skipped')
                return false;
            if (_this.filterFn(b.value)) {
                _this.update(b.value);
                return true;
            }
            else {
                return false;
            }
        });
    };
    return FilterRNClass;
}(abstract_class_1.OperatorRNClass));
