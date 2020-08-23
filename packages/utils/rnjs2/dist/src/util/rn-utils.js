"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unifySubscriberType = exports.monoParentTryUpdate = void 0;
var utils_1 = require("./utils");
exports.monoParentTryUpdate = function (parent) {
    if (!parent.isUpdated || utils_1.isNone(parent.currentValue))
        return 'skipped';
    return parent.currentValue;
};
exports.unifySubscriberType = function (nextOrSubscriber, error, complete) {
    if (typeof nextOrSubscriber === 'function') {
        return {
            next: nextOrSubscriber !== null && nextOrSubscriber !== void 0 ? nextOrSubscriber : utils_1.noop,
            error: error !== null && error !== void 0 ? error : utils_1.noop,
            complete: complete !== null && complete !== void 0 ? complete : utils_1.noop,
        };
    }
    return nextOrSubscriber;
};
