import { Optional, type SafeInt } from 'ts-data-forge';
import type { NonEmptyTuple } from 'ts-type-forge';
import { decodeCanonicalInt } from './internal/index.mjs';

/**
 * Reads one path segment into a value and writes it back. `decode` returns
 * `None` when the segment does not belong to the route, so the matcher moves on
 * to the next branch.
 */
export type ParamCodec<T> = Readonly<{
  /** Receives the segment after percent-decoding. */
  decode: (raw: string) => Optional<T>;
  /** Returns the segment before percent-encoding. */
  encode: (value: T) => string;
}>;

const paramString: ParamCodec<string> = {
  decode: (raw) => (raw === '' ? Optional.none : Optional.some(raw)),
  encode: (value) => value,
} as const;

const paramInt: ParamCodec<SafeInt> = {
  decode: decodeCanonicalInt,
  encode: (value) => value.toString(),
} as const;

const paramLiteral = <const Ls extends NonEmptyTuple<string>>(
  ...values: Ls
): ParamCodec<Ls[number]> => {
  const members: ReadonlySet<string> = new Set(values);

  const isMember = (raw: string): raw is Ls[number] => members.has(raw);

  return {
    decode: (raw) => (isMember(raw) ? Optional.some(raw) : Optional.none),
    encode: (value) => value,
  };
};

const paramRefine = <T, U extends T>(
  codec: ParamCodec<T>,
  guard: (value: T) => value is U,
): ParamCodec<U> =>
  ({
    decode: (raw) => {
      const decoded = codec.decode(raw);

      return Optional.isSome(decoded) && guard(decoded.value)
        ? Optional.some(decoded.value)
        : Optional.none;
    },
    encode: (value) => codec.encode(value),
  }) as const;

const paramCustom = <T,>(codec: ParamCodec<T>): ParamCodec<T> => codec;

/** The rest of a path: one segment or more, percent-decoded. */
export type RestSegments = NonEmptyTuple<string>;

/**
 * Reads the rest of the path, one segment or more, into a value and writes it
 * back. Only a node with no children can declare one: it ends its branch.
 */
export type RestParamCodec<T> = Readonly<{
  /** Tells a rest codec from a {@link ParamCodec}. */
  rest: true;
  /** Receives the remaining segments after percent-decoding. */
  decode: (segments: RestSegments) => Optional<T>;
  /** Returns the segments before percent-encoding. */
  encode: (value: T) => RestSegments;
}>;

const paramRest: RestParamCodec<RestSegments> = {
  rest: true,
  decode: (segments) => Optional.some(segments),
  encode: (value) => value,
} as const;

const paramRestCustom = <T,>(
  codec: Readonly<{
    decode: (segments: RestSegments) => Optional<T>;
    encode: (value: T) => RestSegments;
  }>,
): RestParamCodec<T> =>
  ({ rest: true, decode: codec.decode, encode: codec.encode }) as const;

/**
 * Codecs for path parameters. A segment that fails to decode means the route
 * does not match.
 *
 * - `param.string`: any non-empty segment.
 * - `param.int`: a `SafeInt` in canonical form (`01`, `+1` and `1.0` do not
 *   match).
 * - `param.literal('a', 'b')`: one of the listed values.
 * - `param.refine(codec, guard)`: narrows a codec with a type guard, checked at
 *   run time.
 * - `param.custom({ decode, encode })`: anything else.
 * - `param.rest`: the rest of the path, one segment or more, as a non-empty
 *   list of segments; only on a node with no children, and ranked below every
 *   static and dynamic sibling.
 * - `param.restCustom({ decode, encode })`: the rest of the path read by a codec
 *   over its segments.
 *
 * @example
 *
 * ```ts
 * assert.deepStrictEqual(
 *   param.int.decode('42'),
 *   Optional.some(asSafeInt(42)),
 * );
 *
 * // Only the canonical form matches, so each integer has one URL.
 * assert.deepStrictEqual(param.int.decode('042'), Optional.none);
 *
 * const env = param.literal('live', 'sandbox');
 *
 * assert.deepStrictEqual(env.decode('staging'), Optional.none);
 * ```
 */
export const param = {
  string: paramString,
  int: paramInt,
  literal: paramLiteral,
  refine: paramRefine,
  custom: paramCustom,
  rest: paramRest,
  restCustom: paramRestCustom,
} as const;
