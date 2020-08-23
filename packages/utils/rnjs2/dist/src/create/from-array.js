"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromArray = void 0;
var tslib_1 = require("tslib");
var abstract_class_1 = require("../abstract_class");
var util_1 = require("../util");
exports.fromArray = function (values) {
    return new FromArrayRNClass(values);
};
var FromArrayRNClass = /** @class */ (function (_super) {
    tslib_1.__extends(FromArrayRNClass, _super);
    function FromArrayRNClass(values) {
        var _this = _super.call(this, 'source', 0, [], util_1.none, false) || this;
        _this._values = values;
        return _this;
    }
    FromArrayRNClass.prototype.emit = function () {
        var _this = this;
        if (this.isCompleted)
            return;
        this._values.forEach(function (v) {
            _this.update(v);
            _this.isUpdated = true;
        });
        this.complete();
    };
    return FromArrayRNClass;
}(abstract_class_1.ManagerRNClass));
