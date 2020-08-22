"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerOperatorRNClass = exports.OperatorRNClass = void 0;
var tslib_1 = require("tslib");
var manager_rn_1 = require("./manager-rn");
var rn_1 = require("./rn");
var OperatorRNClass = /** @class */ (function (_super) {
    tslib_1.__extends(OperatorRNClass, _super);
    function OperatorRNClass(type, parent, currentValueInit, isUpdatedInit) {
        var _this = _super.call(this, type, false, parent.depth + 1, [parent], currentValueInit, isUpdatedInit) || this;
        _this.parent = parent;
        return _this;
    }
    return OperatorRNClass;
}(rn_1.RNClass));
exports.OperatorRNClass = OperatorRNClass;
var ManagerOperatorRNClass = /** @class */ (function (_super) {
    tslib_1.__extends(ManagerOperatorRNClass, _super);
    function ManagerOperatorRNClass(type, parent, currentValueInit, isUpdatedInit) {
        var _this = _super.call(this, type, parent.depth + 1, [parent], currentValueInit, isUpdatedInit) || this;
        _this.parent = parent;
        return _this;
    }
    return ManagerOperatorRNClass;
}(manager_rn_1.ManagerRNClass));
exports.ManagerOperatorRNClass = ManagerOperatorRNClass;
