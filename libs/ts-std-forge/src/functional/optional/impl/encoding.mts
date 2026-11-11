/**
 * The runtime representation of `Optional`. Internal: not exported from the
 * package, and nothing outside `functional/optional/impl/` may depend on it.
 *
 * A `Some` is its value itself, with no object around it, and `None` is one
 * reserved string. Keeping the value unwrapped saves an allocation per `Some`,
 * which is what an Optional held in an array, a map or state costs otherwise.
 *
 * Only **strings that start with {@link reservedPrefix}**, which are the
 * encoding's own, are rewritten on the way into a `Some`: `<prefix>n<k>` is
 * `some` applied `k` times to `none`, so `none` is `<prefix>n0` and
 * `some(none)` is `<prefix>n1`, which keeps `Optional<Optional<T>>` sound; any
 * other string with the prefix, including a caller's string that looks like a
 * marker but is not one `encodeSome` writes, is held as `<prefix>r<rest>`.
 *
 * Every other value is held as itself, falsy ones included: a `Some` of
 * `undefined`, `null`, `0` or `''` is that value, falsy or nullish at runtime
 * although its type is an object. So an Optional is never tested with
 * truthiness, `??`, `?.` or a default parameter, which would take such a `Some`
 * for a missing value; that is what `Optional.isSome` / `isNone` are for.
 *
 * Whatever goes into {@link encodeSome} comes back out of {@link decodeSome}.
 * `some(some(5))` and `some(5)` are the same runtime value; only a reserved
 * string keeps its levels of nesting apart, and a caller's string equal to one
 * of those rewritten values is that value, so `some('<prefix>n0')` is
 * `some(none)`.
 *
 * Encoding and decoding pay for more than a `typeof` and one comparison only for
 * strings that start with `t`. Objects are never inspected: reading a property
 * of an arbitrary object (the way ReScript marks a nested `None`) makes that
 * read megamorphic, which measured twice as slow as the wrapped representation
 * it replaces.
 *
 * The prefix is a string, not a `Symbol.for` key, for two reasons. A registered
 * symbol reserves a key in the same agent-wide namespace a string does, so it
 * buys no isolation; and a string survives `structuredClone`, `postMessage` and
 * `JSON` as the previous object representation did, where a symbol is dropped
 * or throws. (JSON keeps a `Some` only as far as it keeps the value it holds: a
 * `Some` of `Infinity` or of `undefined` does not come back as it went in, as
 * the value alone does not.) It is ASCII so that any store that takes the
 * string takes it (Postgres `jsonb` rejects a NUL, for one). Two copies of this
 * package agree on it because it is the same string: **changing the prefix or
 * the encoding is a breaking change** to every Optional that was ever
 * serialized, and makes copies of different versions misread each other's
 * values.
 */

/** The runtime value of `Optional.some(value)`. */
export const encodeSome = (value: unknown): unknown => {
  if (typeof value !== 'string' || !isReserved(value)) {
    return value;
  }

  const depth = markerDepth(value);

  return depth === undefined || depth >= maxDepth
    ? `${reservedPrefix}r${value.slice(prefixLength)}`
    : `${reservedPrefix}n${depth + 1}`;
};

/**
 * The value a `Some` holds, from its runtime value. Must only be given a value
 * that is not {@link noneValue}.
 */
export const decodeSome = (encoded: unknown): unknown => {
  if (typeof encoded !== 'string' || !isReserved(encoded)) {
    return encoded;
  }

  if (encoded.codePointAt(prefixLength) === escapeTag) {
    return `${reservedPrefix}${encoded.slice(prefixLength + 1)}`;
  }

  const depth = markerDepth(encoded);

  // `encodeSome` produces markers of depth 1 to `maxDepth` only.
  return depth === undefined || depth === 0
    ? encoded
    : `${reservedPrefix}n${depth - 1}`;
};

/** The prefix of every string the encoding reserves. */
export const reservedPrefix = 'ts-std-forge::Optional/';

// The reserved value below is a literal rather than a template over
// `reservedPrefix`, so that it is one interned string. The tests check that it
// starts with the prefix.

/** The runtime value of `Optional.none`: `some` applied zero times to `none`. */
export const noneValue = 'ts-std-forge::Optional/n0';

const prefixLength = reservedPrefix.length;

/** `t`, the first character of {@link reservedPrefix}. */
const prefixHead = 0x74;

/** `n` */
const markerTag = 0x6e;

/** `r` */
const escapeTag = 0x72;

/**
 * The deepest nesting a marker records. A canonical marker of this depth is
 * escaped rather than incremented, so that every marker `encodeSome` writes is
 * one `markerDepth` reads back.
 */
const maxDepth = 999_999_999;

/**
 * The depth of a marker, if `str` is a canonical `<prefix>n<k>`: digits with no
 * leading zero (`0` alone excepted), `k` at most {@link maxDepth}. Anything
 * else that starts with the prefix is not a marker.
 */
const markerDepth = (str: string): number | undefined => {
  if (str.codePointAt(prefixLength) !== markerTag) {
    return undefined;
  }

  const digits = str.slice(prefixLength + 1);

  return /^(?:0|[1-9]\d{0,8})$/u.test(digits) ? Number(digits) : undefined;
};

const isReserved = (str: string): boolean =>
  // Most strings fail on the first character, before `startsWith` is called.
  str.codePointAt(0) === prefixHead && str.startsWith(reservedPrefix);
