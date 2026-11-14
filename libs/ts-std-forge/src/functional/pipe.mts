import { expectType } from '../expect-type.mjs';
import { Optional, type UnknownOptional } from './optional/index.mjs';

/**
 * Creates a new pipe object that allows for chaining operations on a value.
 *
 * This function provides a fluent interface for applying transformations to
 * values. Its type offers the methods that suit the value's type:
 *
 * - Every pipe: `map` for general transformations and `mapNullable` for
 *   null-safe ones
 * - `Optional` values also: `mapOptional` for safe Optional transformations
 *
 * The choice is the type's alone: at runtime every pipe has every method,
 * because a `Some` is its value unwrapped and so cannot be told from a value
 * that is not an `Optional`. Reaching `mapOptional` on such a value by a cast
 * reads it as an `Optional`.
 *
 * @template A The type of the initial value to wrap in a pipe.
 * @param a The initial value to wrap in a pipe.
 * @returns A pipe object with chaining methods appropriate for the value type.
 */
export const pipe = <const A,>(a: A): Pipe<A> =>
  ({
    value: a,
    map: (fn) => pipe(fn(a)),
    mapNullable: (fn) => pipe(a == null ? undefined : fn(a)),

    // A `Some` is its value unwrapped, so `mapOptional` cannot be attached by
    // inspecting `a`; the type `Pipe<A>` alone decides whether a caller can
    // reach it. Attaching it to every pipe costs one closure per pipe, as `map`
    // and `mapNullable` already do.
    mapOptional: (fn) =>
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- reachable only where `Pipe<A>` offers `mapOptional`, i.e. `A` is an Optional
      pipe(Optional.map(a as Cast<A, UnknownOptional>, fn)),
  }) as const satisfies PipeImpl<A>;

// `PipeBase<A>` is always present; the conditional only *adds* `mapOptional`
// for Optional values. Two subtleties motivate this shape:
//
//   1. The check is `[A] extends [UnknownOptional]` (a 1-tuple), not the bare
//      `A extends UnknownOptional`. A bare check distributes over unions, so a
//      piped union value such as `Result<D, E> | undefined` would expand into
//      `Pipe<Ok<D>> | Pipe<Err<E>> | Pipe<undefined>`. Calling a chained method
//      on that union of pipe objects forces TypeScript to synthesize a merged
//      call signature, during which a branded member like `Ok<D>` is widened to
//      its constraint (`Ok<number>`) — losing the brand `D`.
//
//   2. `value: A` lives on `PipeBase<A>`, *outside* the conditional. If `value`
//      flowed through the conditional, then for a not-yet-resolved generic `A`
//      the deferred true branch narrows `A` to `A & UnknownOptional`, so
//      `.value` would surface as the noisy `(A & UnknownOptional) | A`. Keeping
//      it on the unconditional base yields a clean `A`.
export type Pipe<A> = PipeBase<A> &
  PipeMapNullable<A> &
  ([A] extends [UnknownOptional] ? PipeMapOptional<A> : unknown);

// NOTE: 以下では 'typing when used with generics' test で型エラーが出る。
// 詳細は documents/reports/pipe-typing.md の 「mapNullable を条件付きで含めるのがうまくいかない理由」を参照。
// export type Pipe<A> = PipeBase<A> &
//   ([A] extends [UnknownOptional] ? PipeMapOptional<A> : unknown) &
//   ([undefined] extends [A] ? PipeMapNullable<A> : unknown) &
//   ([null] extends [A] ? PipeMapNullable<A> : unknown);

expectType<Optional<number>, UnknownOptional>('<=');

expectType<number | undefined, undefined>('>=');

expectType<keyof Pipe<number | undefined>, 'value' | 'map' | 'mapNullable'>(
  '=',
);

expectType<
  keyof Pipe<Optional<number>>,
  'value' | 'map' | 'mapNullable' | 'mapOptional'
>('=');

expectType<
  keyof Pipe<Optional<number | undefined>>,
  'value' | 'map' | 'mapNullable' | 'mapOptional'
>('=');

expectType<
  keyof Pipe<Optional<number> | undefined>,
  'value' | 'map' | 'mapNullable'
>('=');

/** @internal A step of `Pipe`; a consumer spells `Pipe`. */
type PipeBase<A> = Readonly<{
  /** The current value being piped. */
  value: A;

  /**
   * Maps the current value to a new value using the provided function.
   *
   * @example
   *
   * ```ts
   * const result = pipe(2)
   *   .map((value) => value * 3)
   *   .map((value) => `value: ${value}`);
   *
   * assert.strictEqual(result.value, 'value: 6');
   * ```
   *
   * @template B The type of the new value.
   * @param fn Function to transform the current value.
   * @returns A new pipe containing the transformed value.
   */
  map: <B>(fn: (a: A) => B) => Pipe<B>;
}>;

/** @internal A step of `Pipe`; a consumer spells `Pipe`. */
type PipeMapNullable<A> = Readonly<{
  /**
   * Maps the current value only if it's not null or undefined. If the current
   * value is null/undefined, the transformation is skipped and undefined is
   * propagated through the pipe.
   *
   * @example
   *
   * ```ts
   * const result = pipe<string | undefined>('hello')
   *   .mapNullable((value) => value.toUpperCase())
   *   .mapNullable((value) => value.slice(0, 2));
   *
   * assert.strictEqual(result.value, 'HE');
   *
   * const empty = pipe<string | undefined>(undefined).mapNullable((value) =>
   *   value.toUpperCase(),
   * );
   *
   * assert.isTrue(empty.value === undefined);
   * ```
   *
   * @template B The type of the transformed value.
   * @param fn Function to transform the non-null value.
   * @returns A new pipe containing the transformed value or undefined.
   */
  mapNullable: <B>(fn: (a: NonNullable<A>) => B) => Pipe<B | undefined>;
}>;

/** @internal A step of `Pipe`; a consumer spells `Pipe`. */
type PipeMapOptional<A extends UnknownOptional> = Readonly<{
  /**
   * Maps the value inside an Optional using Optional.map semantics. If the
   * Optional is None, the transformation is skipped and None is propagated.
   * If the Optional is Some, the transformation is applied to the inner value.
   *
   * @example
   *
   * ```ts
   * const result = pipe(Optional.some(10))
   *   .mapOptional((value) => value * 2)
   *   .mapOptional((value) => value + 5);
   *
   * assert.deepStrictEqual(result.value, Optional.some(25));
   *
   * const empty = pipe(Optional.none as Optional<number>).mapOptional(
   *   (value) => value * 2,
   * );
   *
   * assert.isTrue(Optional.isNone(empty.value));
   * ```
   *
   * @template B The type of the transformed inner value.
   * @param fn Function to transform the inner value of the Optional.
   * @returns A new pipe containing an Optional with the transformed value.
   */
  mapOptional: <B>(fn: (a: Optional.Unwrap<A>) => B) => Pipe<Optional<B>>;
}>;

/** @internal */
type Cast<T, U> = T & U;

/** @internal */
// `mapOptional` is optional although `pipe` always attaches it: the methods
// return `pipe(...)`, typed `Pipe<B>`, which offers `mapOptional` only when `B`
// is an Optional, and `PipeImpl<B>` must accept it.
type PipeImpl<A> = Readonly<{
  value: A;
  map: <B>(fn: (a: A) => B) => PipeImpl<B>;
  mapNullable: <B>(fn: (a: NonNullable<A>) => B) => PipeImpl<B | undefined>;
  mapOptional?: <B>(
    fn: (a: Optional.Unwrap<Cast<A, UnknownOptional>>) => B,
  ) => PipeImpl<Optional<B>>;
}>;
