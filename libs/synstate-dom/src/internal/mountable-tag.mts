/**
 * The key a {@link Mountable} carries, so that mounting a child can tell a
 * description from a `Bindable` at run time.
 */
export const mountableTag: unique symbol = Symbol.for('synstate-dom/mountable');
