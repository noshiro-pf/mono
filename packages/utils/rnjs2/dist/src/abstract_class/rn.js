"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RNClass = void 0;
var tslib_1 = require("tslib");
var util_1 = require("../util");
var RNClass = /** @class */ (function () {
    function RNClass(type, isSourceRN, depth, parents, currentValueInit, isUpdatedInit) {
        this._subscribers = new Map();
        this._descendantsIdSet = new Set();
        this._isCompleted = false;
        this.id = util_1.genId();
        this.type = type;
        this.isUpdateManager = isSourceRN;
        this.depth = depth;
        this.parents = parents;
        this._children = [];
        this._currentValue = currentValueInit;
        this.isUpdated = isUpdatedInit;
        this.registerThis();
    }
    Object.defineProperty(RNClass.prototype, "currentValue", {
        get: function () {
            return this._currentValue;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RNClass.prototype, "children", {
        get: function () {
            return this._children;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RNClass.prototype, "descendantsIds", {
        get: function () {
            return Array.from(this._descendantsIdSet);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RNClass.prototype, "isCompleted", {
        get: function () {
            return this._isCompleted;
        },
        enumerable: false,
        configurable: true
    });
    /** @internal */
    RNClass.prototype.addChild = function (child) {
        this._children.push(child);
    };
    RNClass.prototype.registerThis = function () {
        var e_1, _a;
        try {
            for (var _b = tslib_1.__values(this.parents), _c = _b.next(); !_c.done; _c = _b.next()) {
                var p = _c.value;
                p.addChild(this);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // register this to ancestor SourceRNs
        var rest = this.parents.slice();
        while (rest.length > 0) {
            var p = rest.pop();
            if (p === undefined)
                break;
            p.addDescendant(this);
            if (!p.isUpdateManager) {
                rest.push.apply(rest, tslib_1.__spread(p.parents));
            }
        }
    };
    /** @internal */
    RNClass.prototype.addDescendant = function (rn) {
        this._descendantsIdSet.add(rn.id);
    };
    RNClass.prototype.complete = function () {
        if (this.isCompleted)
            return; // terminate only once
        // change state
        this._isCompleted = true;
        // run subscribers for the current value
        this._subscribers.forEach(function (s) {
            s.complete();
        });
        // remove all subscribers
        this._subscribers.clear();
        // propagate to children
        this.children.forEach(function (rn) {
            rn.tryComplete();
        });
    };
    RNClass.prototype.tryComplete = function () {
        if (this.parents.length > 0 && this.parents.every(function (r) { return r.isCompleted; })) {
            this.complete();
        }
    };
    // TODO: error handling
    /** @internal */
    RNClass.prototype.subscribe = function (nextOrSubscriber, error, complete) {
        var _this = this;
        var subscriber = util_1.unifySubscriberType(nextOrSubscriber, error, complete);
        // first emit
        var curr = this.currentValue;
        if (util_1.isNotNone(curr)) {
            subscriber.next(curr.value);
        }
        if (this.isCompleted) {
            subscriber.complete();
            return { unsubscribe: util_1.noop };
        }
        var id = this.addSubscriber(subscriber);
        return {
            unsubscribe: function () {
                _this.removeSubscriber(id);
                _this.tryComplete();
            },
        };
    };
    RNClass.prototype.update = function (nextValue) {
        this._currentValue = util_1.some(nextValue);
        this._subscribers.forEach(function (s) { return s.next(nextValue); });
    };
    RNClass.prototype.tryUpdateAndSetFlag = function (tryUpdateBodyFn) {
        this.isUpdated = tryUpdateBodyFn();
    };
    /** @internal */
    RNClass.prototype.tryUpdate = function (nextValue) {
        var _this = this;
        this.tryUpdateAndSetFlag(function () {
            // always update by default
            if (nextValue !== undefined) {
                _this.update(nextValue);
                return true;
            }
            else {
                return false;
            }
        });
    };
    RNClass.prototype.pipe = function () {
        var operators = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            operators[_i] = arguments[_i];
        }
        return operators.reduce(function (parent, op) { return op(parent); }, this);
    };
    RNClass.prototype.addSubscriber = function (s) {
        // return the index of added subscriber
        var id = util_1.genId();
        this._subscribers.set(id, s);
        return id;
    };
    RNClass.prototype.removeSubscriber = function (id) {
        this._subscribers.delete(id);
    };
    return RNClass;
}());
exports.RNClass = RNClass;
