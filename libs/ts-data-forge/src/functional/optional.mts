import { isRecord } from '../guard/index.mjs';
import { pipe } from './pipe.mjs';

/** @internal String literal tag to identify the 'Some' variant of Optional. */
const SomeTypeTagName = 'ts-data-forge::Optional.some';

/** @internal String literal tag to identify the 'None' variant of Optional. */
const NoneTypeTagName = 'ts-data-forge::Optional.none';

/**
 * @internal
 * Represents the 'Some' variant of an Optional, containing a value.
 * @template S The type of the contained value.
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
 * Represents an optional value that can either be 'Some' (containing a value) or 'None' (empty).
 * @template S The type of the value that might be present.
 */
export type Optional<S> = None_ | Some_<S>;

/**
 * Namespace for the {@link Optional} type and related functions.
 * Provides utilities to handle values that might be absent, similar to Option types in other languages.
 */
export namespace Optional {
  /**
   * Checks if the given value is an {@link Optional}.
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
   * @template S The type of the contained value.
   */
  export type Some<S> = Some_<S>;

  /**
   * Represents an {@link Optional} that does not contain a value (is empty).
   */
  export type None = None_;

  /**
   * Base type for any {@link Optional}, used for generic constraints.
   * Represents an {@link Optional} with an unknown value type.
   */
  export type Base = Optional<unknown>;

  /**
   * Extracts the value type `S` from an {@link Optional.Some}<S>.
   * If the {@link Optional} is {@link Optional.None}, resolves to `never`.
   * @template O The {@link Optional.Base} type to unwrap.
   */
  export type Unwrap<O extends Base> = O extends Some<infer S> ? S : never;

  /**
   * Narrows an {@link Optional.Base} type to {@link Optional.Some}<S> if it is a {@link Optional.Some}.
   * If the {@link Optional} is {@link Optional.None}, resolves to `never`.
   * @template O The {@link Optional.Base} type to narrow.
   */
  export type NarrowToSome<O extends Base> = O extends None ? never : O;

  /**
   * Narrows an {@link Optional.Base} type to {@link Optional.None} if it is a {@link Optional.None}.
   * If the {@link Optional} is {@link Optional.Some}<S>, resolves to `never`.
   * @template O The {@link Optional.Base} type to narrow.
   */
  export type NarrowToNone<O extends Base> = O extends None ? O : never;

  /**
   * Creates an {@link Optional.Some} containing the given value.
   * @template S The type of the value.
   * @param value The value to wrap in an {@link Optional.Some}.
   * @returns An {@link Optional.Some}<S> containing the value.
   * @example
   * ```typescript
   * const someValue = Optional.some(42);
   * console.log(Optional.isSome(someValue)); // true
   * console.log(Optional.unwrap(someValue)); // 42
   * ```
   */
  export const some = <S,>(value: S): Some<S> => ({
    $$tag: SomeTypeTagName,
    value,
  });

  /**
   * The singleton instance representing {@link Optional.None} (an empty Optional).
   * @example
   * ```typescript
   * const emptyValue = Optional.none;
   * console.log(Optional.isNone(emptyValue)); // true
   * console.log(Optional.unwrapOr(emptyValue, "default")); // "default"
   * ```
   */
  export const none: None = { $$tag: NoneTypeTagName } as const;

  /**
   * Checks if an {@link Optional} is {@link Optional.Some}.
   * Acts as a type guard.
   * @template O The {@link Optional.Base} type to check.
   * @param optional The {@link Optional} to check.
   * @returns `true` if the {@link Optional} is {@link Optional.Some}, `false` otherwise.
   */
  export const isSome = <O extends Base>(
    optional: O,
  ): optional is NarrowToSome<O> => optional.$$tag === SomeTypeTagName;

  /**
   * Checks if an {@link Optional} is {@link Optional.None}.
   * Acts as a type guard.
   * @template O The {@link Optional.Base} type to check.
   * @param optional The {@link Optional} to check.
   * @returns `true` if the {@link Optional} is {@link Optional.None}, `false` otherwise.
   */
  export const isNone = <O extends Base>(
    optional: O,
  ): optional is NarrowToNone<O> => optional.$$tag === NoneTypeTagName;

  /**
   * Unwraps an `Optional`, returning the contained value.
   * Throws an error if the `Optional` is `Optional.None`.
   *
   * This is a safer alternative to direct value access when you know the Optional
   * should contain a value. Use this method when an empty Optional represents
   * a programming error or unexpected condition.
   *
   * @template O The `Optional.Base` type to unwrap.
   * @param optional The `Optional` to unwrap.
   * @returns The contained value if `Optional.Some`.
   * @throws {Error} Error with message "`unwrapThrow()` has failed because it is `None`" if the `Optional` is `Optional.None`.
   * @example
   * ```typescript
   * const userInput = Optional.some(42);
   * console.log(Optional.unwrapThrow(userInput)); // 42
   *
   * const empty = Optional.none;
   * try {
   *   Optional.unwrapThrow(empty); // throws Error
   * } catch (error) {
   *   console.log(error.message); // "`unwrapThrow()` has failed because it is `None`"
   * }
   * ```
   */
  export const unwrapThrow = <O extends Base>(optional: O): Unwrap<O> => {
    if (isSome(optional)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      return optional.value as Unwrap<O>;
    }

    throw new Error('`unwrapThrow()` has failed because it is `None`');
  };

  /**
   * Unwraps an `Optional`, returning the contained value or `undefined` if empty.
   *
   * This function provides a safe way to extract values from Optionals without
   * throwing exceptions. It has overloaded behavior based on the type:
   * - For `Optional.Some<T>`: Always returns `T` (guaranteed by type system)
   * - For general `Optional<T>`: Returns `T | undefined`
   *
   * @template O The `Optional.Base` type to unwrap.
   * @param optional The `Optional` to unwrap.
   * @returns The contained value if `Optional.Some`, otherwise `undefined`.
   * @example
   * ```typescript
   * const some = Optional.some(42);
   * const value = Optional.unwrap(some); // 42
   *
   * const none = Optional.none;
   * const result = Optional.unwrap(none); // undefined
   * ```
   */
  export const unwrap: UnwrapFnOverload = (<O extends Base>(
    optional: O,
  ): Unwrap<O> | undefined =>
    isNone(optional)
      ? undefined
      : // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        ((optional as NarrowToSome<O>).value as Unwrap<O>)) as UnwrapFnOverload;

  type UnwrapFnOverload = {
    <O extends Some<unknown>>(optional: O): Unwrap<O>;

    <O extends Base>(optional: O): Unwrap<O> | undefined;
  };

  /**
   * Unwraps an `Optional`, returning the contained value or a default value if it's `Optional.None`.
   *
   * Supports both direct usage and curried form for functional composition.
   * This is often preferred over `unwrap()` when you have a sensible fallback value.
   *
   * @template O The `Optional.Base` type to unwrap.
   * @template D The type of the default value.
   * @param optional The `Optional` to unwrap.
   * @param defaultValue The value to return if `optional` is `Optional.None`.
   * @returns The contained value if `Optional.Some`, otherwise `defaultValue`.
   * @example
   * ```typescript
   * // Direct usage - most common pattern
   * const some = Optional.some(42);
   * const value1 = Optional.unwrapOr(some, 0);
   * console.log(value1); // 42
   *
   * const none = Optional.none;
   * const value2 = Optional.unwrapOr(none, 0);
   * console.log(value2); // 0
   *
   * // Curried usage
   * const unwrapWithDefault = Optional.unwrapOr("default");
   * const result = unwrapWithDefault(Optional.some("hello"));
   * console.log(result); // "hello"
   * ```
   */
  export const unwrapOr: UnwrapOrFnOverload = (<O extends Base, D>(
    ...args:
      | readonly [optional: O, defaultValue: D]
      | readonly [defaultValue: D]
  ): (D | Unwrap<O>) | ((optional: Optional<Unwrap<O>>) => D | Unwrap<O>) => {
    switch (args.length) {
      case 2: {
        const [optional, defaultValue] = args;
        return isNone(optional)
          ? defaultValue
          : // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            ((optional as NarrowToSome<O>).value as Unwrap<O>);
      }

      case 1: {
        // Curried version: first argument is default value
        const [defaultValue] = args;
        return (optional: Optional<Unwrap<O>>) =>
          unwrapOr(optional, defaultValue);
      }
    }
  }) as UnwrapOrFnOverload;

  type UnwrapOrFnOverload = {
    <O extends Base, D>(optional: O, defaultValue: D): D | Unwrap<O>;

    // Curried version
    <S, D>(defaultValue: D): (optional: Optional<S>) => D | S;
  };

  /**
   * Returns the `Optional` if it is `Some`, otherwise returns the alternative.
   *
   * Provides a way to chain Optional operations with fallback values. This is
   * particularly useful for implementing default behavior or cascading lookups.
   * Supports both direct usage and curried form for functional composition.
   *
   * @template O The input `Optional.Base` type.
   * @param optional The `Optional` to check.
   * @param alternative The alternative `Optional` to return if the first is `None`.
   * @returns The first `Optional` if `Some`, otherwise the alternative.
   * @example
   * ```typescript
   * const primary = Optional.none;
   * const fallback = Optional.some("default");
   * const result = Optional.orElse(primary, fallback);
   * console.log(Optional.unwrap(result)); // "default"
   * ```
   */
  export const orElse: OrElseFnOverload = (<
    O extends Base,
    const O2 extends Base,
  >(
    ...args:
      | readonly [optional: O, alternative: O2]
      | readonly [alternative: O2]
  ):
    | (O | O2)
    | ((optional: Optional<Unwrap<O>>) => Optional<Unwrap<O>> | O2) => {
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
  }) as OrElseFnOverload;

  type OrElseFnOverload = {
    <O extends Base, const O2 extends Base>(
      optional: O,
      alternative: O2,
    ): O | O2;

    // Curried version
    <S, S2>(
      alternative: Optional<S2>,
    ): (optional: Optional<S>) => Optional<S> | Optional<S2>;
  };

  /**
   * Maps an {@link Optional}<S> to {@link Optional}<S2> by applying a function to a contained value.
   * If the {@link Optional} is {@link Optional.None}, it returns {@link Optional.none}.
   * Otherwise, it applies the `mapFn` to the value in `Optional.Some` and returns a new `Optional.Some` with the result.
   * @template O The input `Optional.Base` type.
   * @template S2 The type of the value returned by the mapping function.
   * @param optional The `Optional` to map.
   * @param mapFn The function to apply to the value if it exists.
   * @returns A new `Optional<S2>` resulting from the mapping, or `Optional.None` if the input was `Optional.None`.
   * @example
   * ```typescript
   * const someNumber = Optional.some(5);
   * const mapped = Optional.map(someNumber, x => x * 2);
   * console.log(Optional.unwrap(mapped)); // 10
   *
   * const noneValue = Optional.none;
   * const mappedNone = Optional.map(noneValue, x => x * 2);
   * console.log(Optional.isNone(mappedNone)); // true
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const map: MapFnOverload = (<O extends Base, S2>(
    ...args:
      | readonly [optional: O, mapFn: (value: Unwrap<O>) => S2]
      | readonly [mapFn: (value: Unwrap<O>) => S2]
  ): Optional<S2> | ((optional: O) => Optional<S2>) => {
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
  }) as MapFnOverload;

  type MapFnOverload = {
    <O extends Base, S2>(
      optional: O,
      mapFn: (value: Unwrap<O>) => S2,
    ): Optional<S2>;

    // Curried version
    <S, S2>(mapFn: (value: S) => S2): (optional: Optional<S>) => Optional<S2>;
  };

  /**
   * Applies a function that returns an `Optional` to the value in an `Optional.Some`.
   * If the input is `Optional.None`, returns `Optional.None`.
   * This is the monadic bind operation for `Optional`.
   * @template O The input `Optional.Base` type.
   * @template S2 The value type of the `Optional` returned by the function.
   * @param optional The `Optional` to flat map.
   * @param flatMapFn The function to apply that returns an `Optional`.
   * @returns The result of applying the function, or `Optional.None`.
   * @example
   * ```typescript
   * const parseNumber = (s: string): Optional<number> => {
   *   const n = Number(s);
   *   return isNaN(n) ? Optional.none : Optional.some(n);
   * };
   *
   * const result = Optional.flatMap(Optional.some("42"), parseNumber);
   * console.log(Optional.unwrap(result)); // 42
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const flatMap: FlatMapFnOverload = (<O extends Base, S2>(
    ...args:
      | readonly [optional: O, flatMapFn: (value: Unwrap<O>) => Optional<S2>]
      | readonly [flatMapFn: (value: Unwrap<O>) => Optional<S2>]
  ): Optional<S2> | ((optional: O) => Optional<S2>) => {
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
  }) as FlatMapFnOverload;

  type FlatMapFnOverload = {
    <O extends Base, S2>(
      optional: O,
      flatMapFn: (value: Unwrap<O>) => Optional<S2>,
    ): Optional<S2>;

    // Curried version
    <S, S2>(
      flatMapFn: (value: S) => Optional<S2>,
    ): (optional: Optional<S>) => Optional<S2>;
  };

  /**
   * Filters an `Optional` based on a predicate.
   * If the `Optional` is `Some` and the predicate returns true, returns the original `Optional`.
   * Otherwise returns `None`.
   * @template O The input `Optional.Base` type.
   * @param optional The `Optional` to filter.
   * @param predicate The predicate function.
   * @returns The filtered `Optional`.
   * @example
   * ```typescript
   * const someEven = Optional.some(4);
   * const filtered = Optional.filter(someEven, x => x % 2 === 0);
   * console.log(Optional.unwrap(filtered)); // 4
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const filter: FilterFnOverload = (<O extends Base>(
    ...args:
      | readonly [optional: O, predicate: (value: Unwrap<O>) => boolean]
      | readonly [predicate: (value: Unwrap<O>) => boolean]
  ): Optional<Unwrap<O>> | ((optional: O) => Optional<Unwrap<O>>) => {
    switch (args.length) {
      case 2: {
        const [optional, predicate] = args;
        return isSome(optional)
          ? pipe(unwrap(optional)).map((value) =>
              predicate(value) ? some(value) : none,
            ).value
          : none;
      }

      case 1: {
        // Curried version: first argument is predicate function
        const [predicate] = args;
        return (optional: O) => filter(optional, predicate);
      }
    }
  }) as FilterFnOverload;

  type FilterFnOverload = {
    <O extends Base>(
      optional: O,
      predicate: (value: Unwrap<O>) => boolean,
    ): Optional<Unwrap<O>>;

    // Curried version
    <S>(
      predicate: (value: S) => boolean,
    ): (optional: Optional<S>) => Optional<S>;
  };

  /**
   * Unwraps an `Optional`, returning the contained value or throwing an error with the provided message.
   * @template O The `Optional.Base` type to unwrap.
   * @param optional The `Optional` to unwrap.
   * @param message The error message to throw if the `Optional` is `Optional.None`.
   * @returns The contained value if `Optional.Some`.
   * @throws Error with the provided message if the `Optional` is `Optional.None`.
   * @example
   * ```typescript
   * const some = Optional.some(42);
   * const value = Optional.expectToBe(some, "Value must exist");
   * console.log(value); // 42
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const expectToBe: ExpectToBeFnOverload = (<O extends Base>(
    ...args:
      | readonly [optional: O, message: string]
      | readonly [message: string]
  ): Unwrap<O> | ((optional: Optional<Unwrap<O>>) => Unwrap<O>) => {
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
  }) as ExpectToBeFnOverload;

  type ExpectToBeFnOverload = {
    <O extends Base>(optional: O, message: string): Unwrap<O>;

    // Curried version
    <S>(message: string): (optional: Optional<S>) => S;
  };

  /**
   * Combines two `Optional` values into a single `Optional` containing a tuple.
   * If either `Optional` is `None`, returns `None`.
   * @template A The value type of the first `Optional`.
   * @template B The value type of the second `Optional`.
   * @param optionalA The first `Optional`.
   * @param optionalB The second `Optional`.
   * @returns An `Optional` containing a tuple of both values, or `None`.
   * @example
   * ```typescript
   * const a = Optional.some(1);
   * const b = Optional.some("hello");
   * const zipped = Optional.zip(a, b);
   * console.log(Optional.unwrap(zipped)); // [1, "hello"]
   *
   * const withNone = Optional.zip(a, Optional.none);
   * console.log(Optional.isNone(withNone)); // true
   * ```
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
   * @template T The type of the nullable value.
   * @param value The nullable value to convert.
   * @returns `Optional.Some<NonNullable<T>>` if the value is not null or undefined, otherwise `Optional.None`.
   * @example
   * ```typescript
   * const value: string | null = "hello";
   * const optional = Optional.fromNullable(value);
   * console.log(Optional.unwrap(optional)); // "hello"
   *
   * const nullValue: string | null = null;
   * const noneOptional = Optional.fromNullable(nullValue);
   * console.log(Optional.isNone(noneOptional)); // true
   * ```
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
   * Note: This returns `undefined` (not `null`) for consistency with JavaScript's
   * undefined semantics and TypeScript's optional properties.
   *
   * @template O The `Optional.Base` type to convert.
   * @param optional The `Optional` to convert.
   * @returns The contained value if `Some`, otherwise `undefined`.
   * @example
   * ```typescript
   * const some = Optional.some(42);
   * console.log(Optional.toNullable(some)); // 42
   *
   * const none = Optional.none;
   * console.log(Optional.toNullable(none)); // undefined
   * ```
   */
  export const toNullable = <O extends Base>(
    optional: O,
  ): Unwrap<O> | undefined => (isSome(optional) ? unwrap(optional) : undefined);
}
