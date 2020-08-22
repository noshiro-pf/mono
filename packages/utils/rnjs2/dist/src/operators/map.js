"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.map = void 0;
var tslib_1 = require("tslib");
var abstract_class_1 = require("../abstract_class");
var util_1 = require("../util");
exports.map = function (mapFn) { return function (parent) { return new MapRNClass(parent, mapFn); }; };
var MapRNClass = /** @class */ (function (_super) {
    tslib_1.__extends(MapRNClass, _super);
    function MapRNClass(parent, mapFn) {
        var _this = _super.call(this, 'sync child', parent, util_1.none, false) || this;
        _this.mapFn = mapFn;
        return _this;
    }
    MapRNClass.prototype.tryUpdate = function () {
        var _this = this;
        this.tryUpdateAndSetFlag(function () {
            var b = util_1.monoParentTryUpdate(_this.parent);
            if (b === 'skipped')
                return false;
            _this.update(_this.mapFn(b.value));
            return true;
        });
    };
    return MapRNClass;
}(abstract_class_1.OperatorRNClass));
