"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerRNClass = void 0;
var tslib_1 = require("tslib");
var util_1 = require("../util");
var rn_1 = require("./rn");
var ManagerRNClass = /** @class */ (function (_super) {
    tslib_1.__extends(ManagerRNClass, _super);
    function ManagerRNClass(type, depth, parents, currentValueInit, isUpdatedInit) {
        var _this = _super.call(this, type, true, depth, parents, currentValueInit, isUpdatedInit) || this;
        _this.procedure = [];
        return _this;
    }
    /** @internal */
    ManagerRNClass.prototype.addDescendant = function (child) {
        if (this._descendantsIdSet.has(child.id))
            return;
        _super.prototype.addDescendant.call(this, child);
        var insertPos = util_1.binarySearch(this.procedure.map(function (a) { return a.depth; }), child.depth);
        this.procedure.splice(insertPos, 0, child);
    };
    ManagerRNClass.prototype.update = function (nextValue) {
        var e_1, _a, e_2, _b;
        this.isUpdated = true;
        _super.prototype.update.call(this, nextValue);
        // let numRNsToUpdate = this.numDescendants;
        this.isUpdated = true;
        try {
            for (var _c = tslib_1.__values(this.procedure), _d = _c.next(); !_d.done; _d = _c.next()) {
                var p = _d.value;
                p.isUpdated = false; // reset
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        try {
            for (var _e = tslib_1.__values(this.procedure), _f = _e.next(); !_f.done; _f = _e.next()) {
                var p = _f.value;
                p.tryUpdate();
                // numRNsToUpdate += -1 + (p.isUpdated ? p.numDescendants : 0);
                // if (numRNsToUpdate === 0) break; // for early stopping
                /*
                 * [note]: This early stopping logic is not accurate
                 * since `numChildToUpdate` is added up considering the dependency graph as a tree.
                 */
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    /** @internal */
    ManagerRNClass.prototype.tryUpdate = function (nextValue) {
        var _this = this;
        this.tryUpdateAndSetFlag(function () {
            _this.update(nextValue);
            return true;
        });
    };
    return ManagerRNClass;
}(rn_1.RNClass));
exports.ManagerRNClass = ManagerRNClass;
