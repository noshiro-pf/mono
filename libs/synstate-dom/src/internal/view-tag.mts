/**
 * The key a {@link View} carries, so that binding can tell it from a constant
 * at run time. `Symbol.for` rather than `Symbol`, matching the mark synstate
 * puts on its observables: two copies of the module still agree.
 */
export const viewTag: unique symbol = Symbol.for('synstate-dom/view');
