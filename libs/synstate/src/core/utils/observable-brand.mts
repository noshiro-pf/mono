/**
 * The key every observable carries, set to `true` by `assembleObservable`. It
 * lets `isObservable` tell an observable from any other value at run time —
 * a `subscribe` method is not enough, since plain values may have one — and,
 * as a type, makes the public observable types impossible to satisfy with an
 * object literal: an imitation passed to an operator would lack the internal
 * members propagation reads and fail at run time instead of at compile time.
 *
 * `Symbol.for`, so that an observable made by another copy of synstate in the
 * same program is still recognized.
 */
export const observableBrand: unique symbol = Symbol.for('synstate/observable');
