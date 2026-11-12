/**
 * Type guards for the built-in objects this package special-cases, read from
 * the `Object.prototype.toString` tag as `@sindresorhus/is` reads it, so that
 * each answers as it did when this package depended on that one: an object from
 * another realm is recognized, which `instanceof` misses, and an error-like
 * plain object is not. `isError` alone answers differently: a `DOMException` is
 * an error to it, which `@sindresorhus/is` misses.
 *
 * They replace that dependency because `@sindresorhus/is` keeps most of itself
 * in a bundle that imports any one of its guards.
 *
 * Not part of the package's API: `gen:index:src` leaves this file out of the
 * barrel.
 */

/**
 * Whether `value` is an error: its tag is `Error`, or it is a DOMException.
 *
 * A DOMException is an Error (`instanceof Error`) whose tag is its own, and a
 * subclass of it (`WebTransportError`, `OverconstrainedError`) has yet another,
 * so a DOMException is found by the first prototype in its chain whose own tag
 * is `DOMException` and then checked by reading `message` through that
 * prototype on it, which must give a string. DOMException's getter throws for
 * anything its constructor did not make, and any throw answers false, so an
 * object re-pointed at `DOMException.prototype` fails, as one re-pointed at
 * `Error.prototype` fails the tag check. The walk starts at the value's
 * prototype, so neither `DOMException.prototype` itself nor a plain object that
 * sets its own `DOMException` tag is an error. Another realm's
 * DOMException carries the same string tag, so it is found too; that is not
 * tested, as Node's `vm` contexts have no DOMException.
 *
 * Known limits, each tested:
 *
 * - A tag is taken at its word: a plain object that sets its own `Error` tag
 *   passes, and so does a hand-made prototype carrying the `DOMException` tag
 *   through which `message` reads as a string without DOMException's getter.
 *   Only a deliberate imitation builds either.
 * - An `Error` subclass that sets a tag of its own other than `Error` or
 *   `DOMException` fails, as the tag is all that is read for it; a
 *   DOMException subclass is found through its prototype chain instead.
 * - A Proxy around a DOMException fails, as the getter refuses the Proxy as
 *   its receiver, and so does one around an `Error` whose chain sets no tag,
 *   as its tag then reads `Object`. Accepting either would mean trusting
 *   something any plain object can imitate.
 *
 * Not `instanceof Error`, which misses another realm's errors; nor
 * `Error.isError`, missing before Node.js 24, whose answers would make `Err`
 * values differ between supported versions.
 */
export const isError = (value: unknown): value is Error =>
  tagOf(value) === 'Error' || isDomException(value);

export const isDate = (value: unknown): value is Date =>
  tagOf(value) === 'Date';

export const isRegExp = (value: unknown): value is RegExp =>
  tagOf(value) === 'RegExp';

export const isMap = (value: unknown): value is ReadonlyMap<unknown, unknown> =>
  tagOf(value) === 'Map';

export const isSet = (value: unknown): value is ReadonlySet<unknown> =>
  tagOf(value) === 'Set';

/**
 * How far up the chain `DOMException.prototype` is looked for: deeper than any
 * subclass hierarchy written in practice, and a bound on a chain a Proxy makes
 * endless.
 */
const maxPrototypeDepth = 64;

// `Object.prototype.toString` throws on a revoked Proxy; such a value is none
// of the built-ins.
const tagOf = (value: unknown): string => {
  try {
    return Object.prototype.toString.call(value).slice(8, -1);
  } catch {
    return '';
  }
};

/**
 * Whether `prototype`, or one within `depth` steps up its chain, has the own
 * tag `DOMException`, and `message` read through it on `value` is a string (see
 * `isError` for what that admits).
 */
const isDomExceptionFrom = (
  value: unknown,
  prototype: unknown,
  depth: number,
): boolean =>
  depth > 0 &&
  typeof prototype === 'object' &&
  prototype !== null &&
  (Object.getOwnPropertyDescriptor(prototype, Symbol.toStringTag)?.value ===
  'DOMException'
    ? typeof Reflect.get(prototype, 'message', value) === 'string'
    : isDomExceptionFrom(value, Object.getPrototypeOf(prototype), depth - 1));

const isDomException = (value: unknown): boolean => {
  try {
    return (
      typeof value === 'object' &&
      value !== null &&
      isDomExceptionFrom(value, Object.getPrototypeOf(value), maxPrototypeDepth)
    );
  } catch {
    return false;
  }
};
