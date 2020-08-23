"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromPromise = void 0;
var tslib_1 = require("tslib");
var abstract_class_1 = require("../abstract_class");
var util_1 = require("../util");
exports.fromPromise = function (promise) {
    return new FromPromiseRNClass(promise);
};
var FromPromiseRNClass = /** @class */ (function (_super) {
    tslib_1.__extends(FromPromiseRNClass, _super);
    function FromPromiseRNClass(promise) {
        var _this = _super.call(this, 'source', 0, [], util_1.none, false) || this;
        _this.promise = promise;
        _this.promise
            .then(function (value) {
            _this.update(value);
            _this.isUpdated = true;
        })
            .catch(function (err) { return console.error(err); });
        return _this;
    }
    return FromPromiseRNClass;
}(abstract_class_1.ManagerRNClass));
