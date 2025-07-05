import { Optional } from './optional.mjs';

/**
 * @internal
 * Utility type to merge intersection types into a single object type.
 * This helps with TypeScript's display of complex intersection types.
 * @template T The intersection type to merge.
 */
type MergeIntersection<T> = {
  [K in keyof T]: T[K];
};

/**
 * Creates a new pipe object that allows for chaining operations on a value.
 *
 * This function provides a fluent interface for applying transformations to values,
 * with intelligent method selection based on the input type:
 * - For `Optional` values: Provides `mapOptional` for safe Optional transformations
 * - For other values: Provides `mapNullable` for null-safe transformations
 * - All types get the basic `map` method for general transformations
 *
 * The pipe maintains type safety throughout the chain, automatically selecting
 * the appropriate overload based on the current value type.
 *
 * @template A The type of the initial value to wrap in a pipe.
 * @param a The initial value to wrap in a pipe.
 * @returns A pipe object with chaining methods appropriate for the value type.
 *
 * @example
 * Basic value transformation chaining:
 * ```typescript
 * // Simple sequential transformations
 * const result = pipe(10)
 *   .map(x => x * 2)        // 20
 *   .map(x => x + 5)        // 25
 *   .map(x => x.toString()) // '25'
 *   .value;
 *
 * // String processing pipeline
 * const processed = pipe("  Hello World  ")
 *   .map(s => s.trim())           // "Hello World"
 *   .map(s => s.toLowerCase())    // "hello world"
 *   .map(s => s.split(' '))       // ["hello", "world"]
 *   .map(arr => arr.join('-'))    // "hello-world"
 *   .value;
 * ```
 *
 * @example
 * Nullable value handling with automatic null checking:
 * ```typescript
 * // Safe operations on potentially null values
 * const maybeNumber: number | null = getNumberFromAPI();
 * const result = pipe(maybeNumber)
 *   .mapNullable(x => x * 2)           // Only applies if not null
 *   .mapNullable(x => `Result: ${x}`)  // Only applies if previous step succeeded
 *   .value; // 'Result: 20' or undefined
 *
 * // Handling undefined values
 * const maybeUser: User | undefined = findUser(id);
 * const userName = pipe(maybeUser)
 *   .mapNullable(user => user.name)
 *   .mapNullable(name => name.toUpperCase())
 *   .value; // string or undefined
 * ```
 *
 * @example
 * Optional value handling with monadic operations:
 * ```typescript
 * // Working with Optional types
 * const optional = Optional.some(42);
 * const result = pipe(optional)
 *   .mapOptional(x => x / 2)        // Optional.some(21)
 *   .mapOptional(x => Math.sqrt(x)) // Optional.some(~4.58)
 *   .value; // Optional.some(4.58...)
 *
 * // Optional chains that can become None
 * const parseAndProcess = (input: string) =>
 *   pipe(Optional.fromNullable(input))
 *     .mapOptional(s => s.trim())
 *     .mapOptional(s => s.length > 0 ? s : null) // Could become None
 *     .mapOptional(s => parseInt(s, 10))
 *     .mapOptional(n => isNaN(n) ? null : n)
 *     .value; // Optional<number>
 * ```
 *
 * @example
 * Mixed type transformations:
 * ```typescript
 * // Starting with a string, transforming through different types
 * const complex = pipe('hello')
 *   .map(s => s.length)          // number: 5
 *   .map(n => n > 3 ? n : null)  // number | null: 5
 *   .mapNullable(n => n * 10)    // number: 50 (or undefined if null)
 *   .value; // 50 or undefined
 *
 * // API response processing
 * const processApiResponse = (response: ApiResponse) =>
 *   pipe(response)
 *     .map(r => r.data)                    // Extract data
 *     .mapNullable(data => data.user)      // Safe user access
 *     .mapNullable(user => user.profile)   // Safe profile access
 *     .mapNullable(profile => profile.avatar) // Safe avatar access
 *     .value; // string | undefined
 * ```
 *
 * @example
 * Error-safe computation chains:
 * ```typescript
 * // Building complex computations safely
 * const safeCalculation = (input: unknown) =>
 *   pipe(input)
 *     .map(val => typeof val === 'number' ? val : null)
 *     .mapNullable(n => n > 0 ? n : null)          // Positive numbers only
 *     .mapNullable(n => Math.sqrt(n))              // Safe square root
 *     .mapNullable(n => n < 100 ? n : null)        // Limit result
 *     .mapNullable(n => Math.round(n * 100) / 100) // Round to 2 decimals
 *     .value; // number | undefined
 * ```
 */
export function pipe<const A extends Optional.Base>(
  a: A,
): PipeWithMapOptional<A>;

export function pipe<const A>(a: A): PipeWithMapNullable<A>;

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

/**
 * @internal
 * Base pipe interface providing core functionality.
 * All pipe types extend this interface.
 * @template A The type of the current value in the pipe.
 */
type PipeBase<A> = Readonly<{
  /** The current value being piped. */
  value: A;
  /**
   * Maps the current value to a new value using the provided function.
   * @template B The type of the new value.
   * @param fn Function to transform the current value.
   * @returns A new pipe containing the transformed value.
   */
  map: <B>(fn: (a: A) => B) => PipeBase<B>;
}>;

/**
 * @internal
 * Pipe interface for non-Optional values, providing null-safe mapping.
 * Extends PipeBase with mapNullable functionality.
 * @template A The type of the current value in the pipe.
 */
type PipeWithMapNullable<A> = MergeIntersection<
  PipeBase<A> &
    Readonly<{
      /**
       * Maps the current value only if it's not null or undefined.
       * If the current value is null/undefined, the transformation is skipped
       * and undefined is propagated through the pipe.
       * @template B The type of the transformed value.
       * @param fn Function to transform the non-null value.
       * @returns A new pipe containing the transformed value or undefined.
       */
      mapNullable: <B>(fn: (a: NonNullable<A>) => B) => PipeBase<B | undefined>;
    }>
>;

/**
 * @internal
 * Pipe interface for Optional values, providing Optional-aware mapping.
 * Extends PipeBase with mapOptional functionality for monadic operations.
 * @template A The Optional type currently in the pipe.
 */
type PipeWithMapOptional<A extends Optional.Base> = MergeIntersection<
  PipeBase<A> &
    Readonly<{
      /**
       * Maps the value inside an Optional using Optional.map semantics.
       * If the Optional is None, the transformation is skipped and None is propagated.
       * If the Optional is Some, the transformation is applied to the inner value.
       * @template B The type of the transformed inner value.
       * @param fn Function to transform the inner value of the Optional.
       * @returns A new pipe containing an Optional with the transformed value.
       */
      mapOptional: <B>(
        fn: (a: Optional.Unwrap<A>) => B,
      ) => PipeBase<Optional<B>>;
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
      fn: (a: Optional.Unwrap<Cast<A, Optional.Base>>) => B,
    ) => PipeBase<Optional<B>>;
  }>
>;
