/**
 * Type guards for the built-in objects this package special-cases, read from
 * the `Object.prototype.toString` tag as `@sindresorhus/is` reads it, so that
 * each answers as it did when this package depended on that one: an object from
 * another realm is recognized, which `instanceof` misses, and an error-like
 * plain object is not. ts-std-forge keeps the same guards for itself; neither
 * package exports them.
 *
 * They replace that dependency because `@sindresorhus/is` keeps most of itself
 * in a bundle that imports any one of its guards.
 *
 * Not part of the package's API: `gen:index:src` leaves this file out of the
 * barrel.
 */

export const isError = (value: unknown): value is Error =>
  tagOf(value) === 'Error';

export const isRegExp = (value: unknown): value is RegExp =>
  tagOf(value) === 'RegExp';

export const isMap = (value: unknown): value is ReadonlyMap<unknown, unknown> =>
  tagOf(value) === 'Map';

export const isSet = (value: unknown): value is ReadonlySet<unknown> =>
  tagOf(value) === 'Set';

export const isTypedArray = (value: unknown): value is TypedArray =>
  typedArrayTags.has(tagOf(value));

export const isArrayBuffer = (
  value: unknown,
): value is ArrayBuffer | SharedArrayBuffer =>
  tagOf(value) === 'ArrayBuffer' || tagOf(value) === 'SharedArrayBuffer';

export const isDataView = (value: unknown): value is DataView =>
  tagOf(value) === 'DataView';

type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;

const typedArrayTags: ReadonlySet<string> = new Set<string>([
  'Int8Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'Int16Array',
  'Uint16Array',
  'Int32Array',
  'Uint32Array',
  'Float32Array',
  'Float64Array',
  'BigInt64Array',
  'BigUint64Array',
]);

const tagOf = (value: unknown): string =>
  Object.prototype.toString.call(value).slice(8, -1);
