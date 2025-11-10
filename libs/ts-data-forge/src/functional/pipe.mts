import { Optional } from './optional/index.mjs';

/**
 * Creates a new pipe object that allows for chaining operations on a value.
 *
 * This function provides a fluent interface for applying transformations to
 * values, with intelligent method selection based on the input type:
 *
 * - For `Optional` values: Provides `mapOptional` for safe Optional
 *   transformations
 * - For other values: Provides `mapNullable` for null-safe transformations
 * - All types get the basic `map` method for general transformations
 *
 * The pipe maintains type safety throughout the chain, automatically selecting
 * the appropriate overload based on the current value type.
 *
 * @template A The type of the initial value to wrap in a pipe.
 * @param a The initial value to wrap in a pipe.
 * @returns A pipe object with chaining methods appropriate for the value type.
 */
export function pipe<const A extends UnknownOptional>(
  a: A,
): PipeWithMapOptional<A>;

export function pipe<const A>(a: A): PipeBase<A>;

export function pipe<const A>(a: A): PipeImpl<A> {
  if (Optional.isOptional(a)) {
    return {
      value: a,
      map: (fn) => pipe(fn(a)),
      mapOptional: (fn) => pipe(Optional.map(a, fn)),
    };
  } else {
    return {
      value: a,
      map: (fn) => pipe(fn(a)),
      mapNullable: (fn) => pipe(a == null ? undefined : fn(a)),
    };
  }
}

type Pipe<A> = A extends UnknownOptional ? PipeWithMapOptional<A> : PipeBase<A>;

/**
 * @template A The type of the current value in the pipe.
 * @internal
 * Base pipe interface providing core functionality.
 * All pipe types extend this interface.
 */
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
   * assert.deepStrictEqual(result.value, 'value: 6');
   * ```
   *
   * @template B The type of the new value.
   * @param fn Function to transform the current value.
   * @returns A new pipe containing the transformed value.
   */
  map: <B>(fn: (a: A) => B) => Pipe<B>;

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
   * assert.deepStrictEqual(result.value, 'HE');
   *
   * const empty = pipe<string | undefined>(undefined).mapNullable((value) =>
   *   value.toUpperCase(),
   * );
   *
   * assert(empty.value === undefined);
   * ```
   *
   * @template B The type of the transformed value.
   * @param fn Function to transform the non-null value.
   * @returns A new pipe containing the transformed value or undefined.
   */
  mapNullable: <B>(fn: (a: NonNullable<A>) => B) => Pipe<B | undefined>;
}>;

/**
 * @template A The Optional type currently in the pipe.
 * @internal
 * Pipe interface for Optional values, providing Optional-aware mapping.
 * Extends PipeBase with mapOptional functionality for monadic operations.
 */
type PipeWithMapOptional<A extends UnknownOptional> = MergeIntersection<
  PipeBase<A> &
    Readonly<{
      /**
       * Maps the value inside an Optional using Optional.map semantics. If the
       * Optional is None, the transformation is skipped and None is propagated.
       * If the Optional is Some, the transformation is applied to the inner
       * value.
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
       * assert.ok(Optional.isNone(empty.value));
       * ```
       *
       * @template B The type of the transformed inner value.
       * @param fn Function to transform the inner value of the Optional.
       * @returns A new pipe containing an Optional with the transformed value.
       */
      mapOptional: <B>(fn: (a: Optional.Unwrap<A>) => B) => Pipe<Optional<B>>;
    }>
>;

/** @internal */
type Cast<T, U> = T & U;

/** @internal */
type PipeImpl<A> = Partial<
  Readonly<{
    value: A;
    map: <B>(fn: (a: A) => B) => PipeBase<B>;
    mapNullable: <B>(fn: (a: NonNullable<A>) => B) => PipeBase<B | undefined>;
    mapOptional: <B>(
      fn: (a: Optional.Unwrap<Cast<A, UnknownOptional>>) => B,
    ) => PipeBase<Optional<B>>;
  }>
>;
