/**
 * Type guards for the built-in objects this package special-cases, read from
 * the `Object.prototype.toString` tag as `@sindresorhus/is` reads it, so that
 * each answers as it did when this package depended on that one: an object from
 * another realm is recognized, which `instanceof` misses, and an error-like
 * plain object is not.
 *
 * They replace that dependency because `@sindresorhus/is` keeps most of itself
 * in a bundle that imports any one of its guards.
 *
 * Not part of the package's API: `gen:index:src` leaves this file out of the
 * barrel.
 */

export const isError = (value: unknown): value is Error =>
  tagOf(value) === 'Error';

export const isDate = (value: unknown): value is Date =>
  tagOf(value) === 'Date';

export const isRegExp = (value: unknown): value is RegExp =>
  tagOf(value) === 'RegExp';

export const isMap = (value: unknown): value is ReadonlyMap<unknown, unknown> =>
  tagOf(value) === 'Map';

export const isSet = (value: unknown): value is ReadonlySet<unknown> =>
  tagOf(value) === 'Set';

const tagOf = (value: unknown): string =>
  Object.prototype.toString.call(value).slice(8, -1);
