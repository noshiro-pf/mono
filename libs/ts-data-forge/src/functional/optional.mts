import { isRecord } from '../guard/index.mjs';

/** @internal String literal tag to identify the 'Some' variant of Optional. */
const SomeTypeTagName = 'ts-data-forge::Optional.some';

/** @internal String literal tag to identify the 'None' variant of Optional. */
const NoneTypeTagName = 'ts-data-forge::Optional.none';

/**
 * @template S The type of the contained value.
 * @internal
 * Represents the 'Some' variant of an Optional, containing a value.
 */
type Some_<S> = Readonly<{
  /**
   * @internal
   * Discriminant property for the 'Some' type.
   */
  $$tag: typeof SomeTypeTagName;

  /** The contained value. */
  value: S;
}>;

/**
 * @internal
 * Represents the 'None' variant of an Optional, indicating the absence of a value.
 */
type None_ = Readonly<{
  /**
   * @internal
   * Discriminant property for the 'None' type.
   */
  $$tag: typeof NoneTypeTagName;
}>;

/**
 * Represents an optional value that can either be 'Some' (containing a value)
 * or 'None' (empty).
 *
 * @template S The type of the value that might be present.
 */
export type Optional<S> = None_ | Some_<S>;

/**
 * Namespace for the {@link Optional} type and related functions. Provides
 * utilities to handle values that might be absent, similar to Option types in
 * other languages.
 */
export namespace Optional {
  /**
   * Checks if the given value is an {@link Optional}.
   *
   * @example
   *
   * ```ts
   * const maybeOptional = Optional.some('value');
   * const notOptional = { $$tag: 'ts-data-forge::Optional.some' };
   *
   * assert.ok(Optional.isOptional(maybeOptional));
   * assert.notOk(Optional.isOptional(notOptional));
   * ```
   *
   * @param maybeOptional The value to check.
   * @returns `true` if the value is an {@link Optional}, otherwise `false`.
   */
  export const isOptional = (
    maybeOptional: unknown,
  ): maybeOptional is Optional<unknown> =>
    isRecord(maybeOptional) &&
    Object.hasOwn(maybeOptional, '$$tag') &&
    ((maybeOptional['$$tag'] === SomeTypeTagName &&
      Object.hasOwn(maybeOptional, 'value')) ||
      maybeOptional['$$tag'] === NoneTypeTagName);

  /**
   * Represents an {@link Optional} that contains a value.
   *
   * @template S The type of the contained value.
   */
  export type Some<S> = Some_<S>;

  /** Represents an {@link Optional} that does not contain a value (is empty). */
  export type None = None_;

  /**
   * Base type for any {@link Optional}, used for generic constraints. Represents
   * an {@link Optional} with an unknown value type.
   */
  export type Base = Optional<unknown>;

  /**
   * Extracts the value type `S` from an {@link Optional.Some}<S>. If the
   * {@link Optional} is {@link Optional.None}, resolves to `never`.
   *
   * @template O The {@link Optional.Base} type to unwrap.
   */
  export type Unwrap<O extends Base> = O extends Some<infer S> ? S : never;

  /**
   * Narrows an {@link Optional.Base} type to {@link Optional.Some}<S> if it is a
   * {@link Optional.Some}. If the {@link Optional} is {@link Optional.None},
   * resolves to `never`.
   *
   * @template O The {@link Optional.Base} type to narrow.
   */
  export type NarrowToSome<O extends Base> = O extends None ? never : O;

  /**
   * Narrows an {@link Optional.Base} type to {@link Optional.None} if it is a
   * {@link Optional.None}. If the {@link Optional} is {@link Optional.Some}<S>,
   * resolves to `never`.
   *
   * @template O The {@link Optional.Base} type to narrow.
   */
  export type NarrowToNone<O extends Base> = O extends None ? O : never;

  /**
   * Creates an {@link Optional.Some} containing the given value.
   *
   * @example
   *
   * ```ts
   * const someValue = Optional.some({ id: 1 });
   * const noneValue = Optional.none;
   *
   * assert.ok(Optional.isSome(someValue));
   * assert.ok(Optional.isNone(noneValue));
   * ```
   *
   * @template S The type of the value.
   * @param value The value to wrap in an {@link Optional.Some}.
   * @returns An {@link Optional.Some}<S> containing the value.
   */
  export const some = <S,>(value: S): Some<S> => ({
    $$tag: SomeTypeTagName,
    value,
  });

  /**
   * The singleton instance representing {@link Optional.None} (an empty
   * Optional).
   *
   * @example
   *
   * ```ts
   * const someValue = Optional.some({ id: 1 });
   * const noneValue = Optional.none;
   *
   * assert.ok(Optional.isSome(someValue));
   * assert.ok(Optional.isNone(noneValue));
   * ```
   */
  export const none: None = { $$tag: NoneTypeTagName } as const;

  /**
   * Checks if an {@link Optional} is {@link Optional.Some}. Acts as a type guard.
   *
   * @example
   *
   * ```ts
   * const optionalNumber = Optional.some(42);
   *
   * if (Optional.isSome(optionalNumber)) {
   *   const value: number = optionalNumber.value;
   *   assert(value === 42);
   * }
   * ```
   *
   * @template O The {@link Optional.Base} type to check.
   * @param optional The {@link Optional} to check.
   * @returns `true` if the {@link Optional} is {@link Optional.Some}, `false`
   *   otherwise.
   */
  export const isSome = <O extends Base>(
    optional: O,
  ): optional is NarrowToSome<O> => optional.$$tag === SomeTypeTagName;

  /**
   * Checks if an {@link Optional} is {@link Optional.None}. Acts as a type guard.
   *
   * @example
   *
   * ```ts
   * const optionalValue = Optional.none as Optional<number>;
   *
   * if (Optional.isNone(optionalValue)) {
   *   // Type narrowed to None
   *   assert.ok(true); // optionalValue is None
   * }
   * ```
   *
   * @template O The {@link Optional.Base} type to check.
   * @param optional The {@link Optional} to check.
   * @returns `true` if the {@link Optional} is {@link Optional.None}, `false`
   *   otherwise.
   */
  export const isNone = <O extends Base>(
    optional: O,
  ): optional is NarrowToNone<O> => optional.$$tag === NoneTypeTagName;

  /**
   * Unwraps an `Optional`, returning the contained value. Throws an error if
   * the `Optional` is `Optional.None`.
   *
   * This is a safer alternative to direct value access when you know the
   * Optional should contain a value. Use this method when an empty Optional
   * represents a programming error or unexpected condition.
   *
   * @example
   *
   * ```ts
   * const present = Optional.some('available');
   *
   * assert(Optional.unwrapThrow(present) === 'available');
   * assert.throws(
   *   () => Optional.unwrapThrow(Optional.none),
   *   /has failed because it is `None`/u,
   * );
   * ```
   *
   * @template O The `Optional.Base` type to unwrap.
   * @param optional The `Optional` to unwrap.
   * @returns The contained value if `Optional.Some`.
   * @throws {Error} Error with message "`unwrapThrow()` has failed because it
   *   is `None`" if the `Optional` is `Optional.None`.
   */
  export const unwrapThrow = <O extends Base>(optional: O): Unwrap<O> => {
    if (isSome(optional)) {
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return optional.value as Unwrap<O>;
    }

    throw new Error('`unwrapThrow()` has failed because it is `None`');
  };

  /**
   * Unwraps an `Optional`, returning the contained value or `undefined` if
   * empty.
   *
   * This function provides a safe way to extract values from Optionals without
   * throwing exceptions. It has overloaded behavior based on the type:
   *
   * - For `Optional.Some<T>`: Always returns `T` (guaranteed by type system)
   * - For general `Optional<T>`: Returns `T | undefined`
   *
   * @example
   *
   * ```ts
   * const someString = Optional.some('text');
   * const noneString = Optional.none as Optional<string>;
   *
   * assert(Optional.unwrap(someString) === 'text');
   * assert(Optional.unwrap(noneString) === undefined);
   * ```
   *
   * @template O The `Optional.Base` type to unwrap.
   * @param optional The `Optional` to unwrap.
   * @returns The contained value if `Optional.Some`, otherwise `undefined`.
   */
  export function unwrap<O extends Some<unknown>>(optional: O): Unwrap<O>;

  export function unwrap<O extends Base>(optional: O): Unwrap<O> | undefined;

  export function unwrap<O extends Base>(optional: O): Unwrap<O> | undefined {
    return isSome(optional)
      ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        (optional.value as Unwrap<O>)
      : undefined;
  }

  /**
   * Unwraps an `Optional`, returning the contained value or a default value if
   * it's `Optional.None`.
   *
   * Supports both direct usage and curried form for functional composition.
   * This is often preferred over `unwrap()` when you have a sensible fallback
   * value.
   *
   * @example
   *
   * ```ts
   * const withValue = Optional.some(5);
   * const withoutValue = Optional.none as Optional<number>;
   *
   * assert(Optional.unwrapOr(withValue, 0) === 5);
   * assert(Optional.unwrapOr(withoutValue, 0) === 0);
   *
   * const unwrapWithDefault = Optional.unwrapOr(10);
   *
   * assert(unwrapWithDefault(Optional.some(3)) === 3);
   * assert(unwrapWithDefault(Optional.none) === 10);
   * ```
   *
   * @template O The `Optional.Base` type to unwrap.
   * @template D The type of the default value.
   * @param optional The `Optional` to unwrap.
   * @param defaultValue The value to return if `optional` is `Optional.None`.
   * @returns The contained value if `Optional.Some`, otherwise `defaultValue`.
   */
  export function unwrapOr<O extends Base, D>(
    optional: O,
    defaultValue: D,
  ): D | Unwrap<O>;

  // Curried version
  export function unwrapOr<S, D>(
    defaultValue: D,
  ): (optional: Optional<S>) => D | S;

  export function unwrapOr<O extends Base, D>(
    ...args:
      | readonly [optional: O, defaultValue: D]
      | readonly [defaultValue: D]
  ): (D | Unwrap<O>) | ((optional: Optional<Unwrap<O>>) => D | Unwrap<O>) {
    switch (args.length) {
      case 2: {
        const [optional, defaultValue] = args;
        return isSome(optional)
          ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
            (optional.value as Unwrap<O>)
          : defaultValue;
      }

      case 1: {
        // Curried version: first argument is default value
        const [defaultValue] = args;
        return (optional: Optional<Unwrap<O>>) =>
          unwrapOr(optional, defaultValue);
      }
    }
  }

  /**
   * Returns the `Optional` if it is `Some`, otherwise returns the alternative.
   *
   * Provides a way to chain Optional operations with fallback values. This is
   * particularly useful for implementing default behavior or cascading lookups.
   * Supports both direct usage and curried form for functional composition.
   *
   * @example
   *
   * ```ts
   * const preferred = Optional.some('primary');
   * const fallback = Optional.some('secondary');
   * const noneValue = Optional.none as Optional<string>;
   *
   * assert.deepStrictEqual(Optional.orElse(preferred, fallback), preferred);
   * assert.deepStrictEqual(Optional.orElse(noneValue, fallback), fallback);
   *
   * const orElseFallback = Optional.orElse(Optional.some('default'));
   *
   * assert.deepStrictEqual(orElseFallback(Optional.none), Optional.some('default'));
   * assert.deepStrictEqual(
   *   orElseFallback(Optional.some('value')),
   *   Optional.some('value'),
   * );
   * ```
   *
   * @template O The input `Optional.Base` type.
   * @param optional The `Optional` to check.
   * @param alternative The alternative `Optional` to return if the first is
   *   `None`.
   * @returns The first `Optional` if `Some`, otherwise the alternative.
   */
  export function orElse<O extends Base, const O2 extends Base>(
    optional: O,
    alternative: O2,
  ): O | O2;

  // Curried version
  export function orElse<S, S2>(
    alternative: Optional<S2>,
  ): (optional: Optional<S>) => Optional<S> | Optional<S2>;

  export function orElse<O extends Base, const O2 extends Base>(
    ...args:
      | readonly [optional: O, alternative: O2]
      | readonly [alternative: O2]
  ): (O | O2) | ((optional: Optional<Unwrap<O>>) => Optional<Unwrap<O>> | O2) {
    switch (args.length) {
      case 2: {
        const [optional, alternative] = args;
        return isNone(optional) ? alternative : optional;
      }

      case 1: {
        const [alternative] = args;
        return (optional: Optional<Unwrap<O>>) => orElse(optional, alternative);
      }
    }
  }

  /**
   * Maps an {@link Optional}<S> to {@link Optional}<S2> by applying a function to
   * a contained value. If the {@link Optional} is {@link Optional.None}, it
   * returns {@link Optional.none}. Otherwise, it applies the `mapFn` to the
   * value in `Optional.Some` and returns a new `Optional.Some` with the
   * result.
   *
   * @example
   *
   * ```ts
   * const numberOptional = Optional.some(21);
   * const mapped = Optional.map(numberOptional, (value) => value * 2);
   *
   * assert.deepStrictEqual(mapped, Optional.some(42));
   *
   * const mapToLength = Optional.map((text: string) => text.length);
   *
   * assert.deepStrictEqual(mapToLength(Optional.some('abc')), Optional.some(3));
   * assert.deepStrictEqual(mapToLength(Optional.none), Optional.none);
   * ```
   *
   * @template O The input `Optional.Base` type.
   * @template S2 The type of the value returned by the mapping function.
   * @param optional The `Optional` to map.
   * @param mapFn The function to apply to the value if it exists.
   * @returns A new `Optional<S2>` resulting from the mapping, or
   *   `Optional.None` if the input was `Optional.None`.
   */
  export function map<O extends Base, S2>(
    optional: O,
    mapFn: (value: Unwrap<O>) => S2,
  ): Optional<S2>;

  // Curried version
  export function map<S, S2>(
    mapFn: (value: S) => S2,
  ): (optional: Optional<S>) => Optional<S2>;

  export function map<O extends Base, S2>(
    ...args:
      | readonly [optional: O, mapFn: (value: Unwrap<O>) => S2]
      | readonly [mapFn: (value: Unwrap<O>) => S2]
  ): Optional<S2> | ((optional: O) => Optional<S2>) {
    switch (args.length) {
      case 2: {
        const [optional, mapFn] = args;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return isSome(optional) ? some(mapFn(unwrap(optional)!)) : none;
      }
      case 1: {
        // Curried version: first argument is mapping function
        const [mapFn] = args;
        return (optional: O) => map(optional, mapFn);
      }
    }
  }

  /**
   * Applies a function that returns an `Optional` to the value in an
   * `Optional.Some`. If the input is `Optional.None`, returns `Optional.None`.
   * This is the monadic bind operation for `Optional`.
   *
   * @example
   *
   * ```ts
   * const parseNumber = (input: string): Optional<number> => {
   *   const num = Number.parseInt(input, 10);
   *   return Number.isNaN(num) ? Optional.none : Optional.some(num);
   * };
   *
   * const parsed = Optional.flatMap(Optional.some('10'), parseNumber);
   *
   * assert.deepStrictEqual(parsed, Optional.some(10));
   *
   * const flatMapParse = Optional.flatMap(parseNumber);
   *
   * assert.deepStrictEqual(flatMapParse(Optional.some('5')), Optional.some(5));
   * assert.deepStrictEqual(flatMapParse(Optional.some('invalid')), Optional.none);
   * ```
   *
   * @template O The input `Optional.Base` type.
   * @template S2 The value type of the `Optional` returned by the function.
   * @param optional The `Optional` to flat map.
   * @param flatMapFn The function to apply that returns an `Optional`.
   * @returns The result of applying the function, or `Optional.None`.
   */
  export function flatMap<O extends Base, S2>(
    optional: O,
    flatMapFn: (value: Unwrap<O>) => Optional<S2>,
  ): Optional<S2>;

  // Curried version
  export function flatMap<S, S2>(
    flatMapFn: (value: S) => Optional<S2>,
  ): (optional: Optional<S>) => Optional<S2>;

  export function flatMap<O extends Base, S2>(
    ...args:
      | readonly [optional: O, flatMapFn: (value: Unwrap<O>) => Optional<S2>]
      | readonly [flatMapFn: (value: Unwrap<O>) => Optional<S2>]
  ): Optional<S2> | ((optional: O) => Optional<S2>) {
    switch (args.length) {
      case 2: {
        const [optional, flatMapFn] = args;
        return isSome(optional) ? flatMapFn(unwrap(optional)) : none;
      }

      case 1: {
        const [flatMapFn] = args;
        return (optional: O) => flatMap(optional, flatMapFn);
      }
    }
  }

  /**
   * Filters an `Optional` based on a predicate. If the `Optional` is `Some` and
   * the predicate returns true, returns the original `Optional`. Otherwise
   * returns `None`.
   *
   * @example
   *
   * ```ts
   * const even = Optional.filter(Optional.some(4), (value) => value % 2 === 0);
   * const odd = Optional.filter(Optional.some(3), (value) => value % 2 === 0);
   *
   * assert.deepStrictEqual(even, Optional.some(4));
   * assert.deepStrictEqual(odd, Optional.none);
   *
   * const filterEven = Optional.filter((value: number) => value % 2 === 0);
   *
   * assert.deepStrictEqual(filterEven(Optional.some(6)), Optional.some(6));
   * assert.deepStrictEqual(filterEven(Optional.some(5)), Optional.none);
   * ```
   *
   * @template O The input `Optional.Base` type.
   * @param optional The `Optional` to filter.
   * @param predicate The predicate function.
   * @returns The filtered `Optional`.
   */
  export function filter<O extends Base>(
    optional: O,
    predicate: (value: Unwrap<O>) => boolean,
  ): Optional<Unwrap<O>>;

  // Curried version
  export function filter<S>(
    predicate: (value: S) => boolean,
  ): (optional: Optional<S>) => Optional<S>;

  export function filter<O extends Base>(
    ...args:
      | readonly [optional: O, predicate: (value: Unwrap<O>) => boolean]
      | readonly [predicate: (value: Unwrap<O>) => boolean]
  ): Optional<Unwrap<O>> | ((optional: O) => Optional<Unwrap<O>>) {
    switch (args.length) {
      case 2: {
        const [optional, predicate] = args;
        if (isSome(optional)) {
          const value = unwrap(optional);
          return predicate(value) ? some(value) : none;
        }
        // If the optional is None, return None
        return none;
      }

      case 1: {
        // Curried version: first argument is predicate function
        const [predicate] = args;
        return (optional: O) => filter(optional, predicate);
      }
    }
  }

  /**
   * Unwraps an `Optional`, returning the contained value or throwing an error
   * with the provided message.
   *
   * @example
   *
   * ```ts
   * const optionalValue = Optional.some('data');
   *
   * assert(Optional.expectToBe(optionalValue, 'value expected') === 'data');
   *
   * const expectValue = Optional.expectToBe<string>('missing optional');
   *
   * assert.throws(() => expectValue(Optional.none), /missing optional/u);
   * assert(expectValue(Optional.some('present')) === 'present');
   * ```
   *
   * @template O The `Optional.Base` type to unwrap.
   * @param optional The `Optional` to unwrap.
   * @param message The error message to throw if the `Optional` is
   *   `Optional.None`.
   * @returns The contained value if `Optional.Some`.
   * @throws Error with the provided message if the `Optional` is
   *   `Optional.None`.
   */
  export function expectToBe<O extends Base>(
    optional: O,
    message: string,
  ): Unwrap<O>;

  // Curried version
  export function expectToBe<S>(message: string): (optional: Optional<S>) => S;

  export function expectToBe<O extends Base>(
    ...args:
      | readonly [optional: O, message: string]
      | readonly [message: string]
  ): Unwrap<O> | ((optional: Optional<Unwrap<O>>) => Unwrap<O>) {
    switch (args.length) {
      case 2: {
        const [optional, message] = args;
        if (isSome(optional)) {
          return unwrap(optional);
        }
        throw new Error(message);
      }

      case 1: {
        // Curried version: first argument is message
        const [message] = args;
        return (optional: Optional<Unwrap<O>>): Unwrap<O> =>
          expectToBe(optional, message);
      }
    }
  }

  /**
   * Combines two `Optional` values into a single `Optional` containing a tuple.
   * If either `Optional` is `None`, returns `None`.
   *
   * @example
   *
   * ```ts
   * const zipped = Optional.zip(Optional.some('left'), Optional.some(1));
   *
   * assert.ok(Optional.isSome(zipped));
   * if (Optional.isSome(zipped)) {
   *   const expected: readonly [string, number] = ['left', 1];
   *   assert.deepStrictEqual(zipped.value, expected);
   * }
   *
   * const missing = Optional.zip(
   *   Optional.some('value'),
   *   Optional.none as Optional<number>,
   * );
   *
   * assert.deepStrictEqual(missing, Optional.none);
   * ```
   *
   * @template A The value type of the first `Optional`.
   * @template B The value type of the second `Optional`.
   * @param optionalA The first `Optional`.
   * @param optionalB The second `Optional`.
   * @returns An `Optional` containing a tuple of both values, or `None`.
   */
  export const zip = <A, const B>(
    optionalA: Optional<A>,
    optionalB: Optional<B>,
  ): Optional<readonly [A, B]> =>
    isSome(optionalA) && isSome(optionalB)
      ? some([optionalA.value, optionalB.value] as const)
      : none;

  /**
   * Converts a nullable value to an `Optional`.
   *
   * This is the primary way to lift nullable values (null or undefined) into
   * the Optional type system. The function treats both `null` and `undefined`
   * as empty values, converting them to `Optional.None`.
   *
   * @example
   *
   * ```ts
   * const present = Optional.fromNullable('hello');
   * const absent = Optional.fromNullable<string | null>(null);
   *
   * assert.deepStrictEqual(present, Optional.some('hello'));
   * assert.deepStrictEqual(absent, Optional.none);
   * ```
   *
   * @template T The type of the nullable value.
   * @param value The nullable value to convert.
   * @returns `Optional.Some<NonNullable<T>>` if the value is not null or
   *   undefined, otherwise `Optional.None`.
   */
  export const fromNullable = <T,>(
    value: T | null | undefined,
  ): Optional<NonNullable<T>> => (value == null ? none : some(value));

  /**
   * Converts an `Optional` to a nullable value.
   *
   * This function extracts the value from an Optional, returning `undefined`
   * for empty Optionals. This is useful when interfacing with APIs or systems
   * that expect nullable values rather than Optional types.
   *
   * Note: This returns `undefined` (not `null`) for consistency with
   * JavaScript's undefined semantics and TypeScript's optional properties.
   *
   * @example
   *
   * ```ts
   * const someNumber = Optional.some(42);
   * const noneNumber = Optional.none as Optional<number>;
   *
   * assert(Optional.toNullable(someNumber) === 42);
   * assert(Optional.toNullable(noneNumber) === undefined);
   * ```
   *
   * @template O The `Optional.Base` type to convert.
   * @param optional The `Optional` to convert.
   * @returns The contained value if `Some`, otherwise `undefined`.
   */
  export const toNullable = <O extends Base>(
    optional: O,
  ): Unwrap<O> | undefined => (isSome(optional) ? unwrap(optional) : undefined);
}
