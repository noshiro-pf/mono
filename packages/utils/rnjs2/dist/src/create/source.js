"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subject = exports.source = void 0;
var tslib_1 = require("tslib");
var abstract_class_1 = require("../abstract_class");
var util_1 = require("../util");
exports.source = function () { return new SourceRNClass(); };
exports.subject = exports.source; // alias
var SourceRNClass = /** @class */ (function (_super) {
    tslib_1.__extends(SourceRNClass, _super);
    function SourceRNClass() {
        return _super.call(this, 'source', 0, [], util_1.none, false) || this;
    }
    SourceRNClass.prototype.push = function (nextValue) {
        this.update(nextValue);
    };
    return SourceRNClass;
}(abstract_class_1.ManagerRNClass));
