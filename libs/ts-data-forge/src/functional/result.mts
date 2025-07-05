import { isRecord } from '../guard/index.mjs';
import { unknownToString } from '../others/index.mjs';
import { Optional } from './optional.mjs';

/** @internal String literal tag to identify the 'Ok' variant of Result. */
const OkTypeTagName = 'ts-data-forge::Result.ok';

/** @internal String literal tag to identify the 'Err' variant of Result. */
const ErrTypeTagName = 'ts-data-forge::Result.err';

/**
 * @internal
 * Represents the 'Ok' variant of a Result, containing a success value.
 * @template S The type of the success value.
 */
type Ok_<S> = Readonly<{
  /**
   * @internal
   * Discriminant property for the 'Ok' type.
   */
  $$tag: typeof OkTypeTagName;

  /** The success value. */
  value: S;
}>;

/**
 * @internal
 * Represents the 'Err' variant of a Result, containing an error value.
 * @template E The type of the error value.
 */
type Err_<E> = Readonly<{
  /**
   * @internal
   * Discriminant property for the 'Err' type.
   */
  $$tag: typeof ErrTypeTagName;

  /** The error value. */
  value: E;
}>;

/**
 * Represents a value that can either be a success (`Ok`) or an error (`Err`).
 * @template S The type of the success value.
 * @template E The type of the error value.
 */
export type Result<S, E> = Ok_<S> | Err_<E>;

/**
 * Namespace for the `Result` type and related functions.
 * Provides utilities to handle operations that can succeed or fail.
 */
export namespace Result {
  /**
   * Checks if the given value is a `Result`.
   * @param maybeOptional The value to check.
   * @returns `true` if the value is a `Result`, otherwise `false`.
   */
  export const isResult = (
    maybeOptional: unknown,
  ): maybeOptional is Result<unknown, unknown> =>
    isRecord(maybeOptional) &&
    Object.hasOwn(maybeOptional, '$$tag') &&
    Object.hasOwn(maybeOptional, 'value') &&
    (maybeOptional['$$tag'] === ErrTypeTagName ||
      maybeOptional['$$tag'] === OkTypeTagName);

  /**
   * Represents a `Result` that is a success, containing a value.
   * @template S The type of the success value.
   */
  export type Ok<S> = Ok_<S>;

  /**
   * Represents a `Result` that is an error, containing an error value.
   * @template E The type of the error value.
   */
  export type Err<E> = Err_<E>;

  /**
   * Base type for any `Result`, used for generic constraints.
   * Represents a `Result` with unknown success and error types.
   */
  export type Base = Result<unknown, unknown>;

  /**
   * Extracts the success value type `S` from a `Result.Ok<S>`.
   * If the `Result` is `Result.Err<E>`, resolves to `never`.
   * @template R The `Result.Base` type to unwrap.
   */
  export type UnwrapOk<R extends Base> = R extends Ok<infer S> ? S : never;

  /**
   * Extracts the error value type `E` from a `Result.Err<E>`.
   * If the `Result` is `Result.Ok<S>`, resolves to `never`.
   * @template R The `Result.Base` type to unwrap.
   */
  export type UnwrapErr<R extends Base> = R extends Err<infer E> ? E : never;

  /**
   * Narrows a `Result.Base` type to `Result.Ok<S>` if it is an `Ok`.
   * If the `Result` is `Result.Err<E>`, resolves to `never`.
   * @template R The `Result.Base` type to narrow.
   */
  export type NarrowToOk<R extends Base> = R extends Err<unknown> ? never : R;

  /**
   * Narrows a `Result.Base` type to `Result.Err<E>` if it is an `Err`.
   * If the `Result` is `Result.Ok<S>`, resolves to `never`.
   * @template R The `Result.Base` type to narrow.
   */
  export type NarrowToErr<R extends Base> = R extends Ok<unknown> ? never : R;

  /**
   * Creates a `Result.Ok` containing the given success value.
   *
   * Use this constructor when an operation succeeds and you want to wrap
   * the successful result in a Result type for consistent error handling.
   *
   * @template S The type of the success value.
   * @param value The success value.
   * @returns A `Result.Ok<S>` containing the value.
   * @example
   * ```typescript
   * // Basic success case
   * const success = Result.ok(42);
   * console.log(Result.isOk(success)); // true
   * console.log(Result.unwrapOk(success)); // 42
   *
   * // Function that returns a Result
   * function divide(a: number, b: number): Result<number, string> {
   *   if (b === 0) {
   *     return Result.err("Division by zero");
   *   }
   *   return Result.ok(a / b);
   * }
   *
   * const result = divide(10, 2);
   * console.log(Result.unwrapOk(result)); // 5
   * ```
   */
  export const ok = <S,>(value: S): Ok<S> => ({
    $$tag: OkTypeTagName,
    value,
  });

  /**
   * Creates a `Result.Err` containing the given error value.
   *
   * Use this constructor when an operation fails and you want to wrap
   * the error information in a Result type for consistent error handling.
   *
   * @template E The type of the error value.
   * @param value The error value.
   * @returns A `Result.Err<E>` containing the value.
   * @example
   * ```typescript
   * // Basic error case
   * const failure = Result.err("Something went wrong");
   * console.log(Result.isErr(failure)); // true
   * console.log(Result.unwrapErr(failure)); // "Something went wrong"
   *
   * // Function that can fail
   * function parseInteger(input: string): Result<number, string> {
   *   const num = parseInt(input, 10);
   *   if (isNaN(num)) {
   *     return Result.err(`Invalid number format: ${input}`);
   *   }
   *   return Result.ok(num);
   * }
   *
   * const result = parseInteger("abc");
   * console.log(Result.unwrapErr(result)); // "Invalid number format: abc"
   *
   * // Using custom error types
   * interface ValidationError {
   *   field: string;
   *   message: string;
   * }
   *
   * const validationError = Result.err<ValidationError>({
   *   field: "email",
   *   message: "Invalid email format"
   * });
   * ```
   */
  export const err = <E,>(value: E): Err<E> => ({
    $$tag: ErrTypeTagName,
    value,
  });

  /**
   * @internal
   * Default string conversion function using native String constructor.
   */
  const toStr_ = String;

  /**
   * Checks if a `Result` is `Result.Ok`.
   * Acts as a type guard, narrowing the type to the success variant.
   *
   * This function is essential for type-safe Result handling, allowing
   * TypeScript to understand that subsequent operations will work with
   * the success value rather than the error value.
   *
   * @template R The `Result.Base` type to check.
   * @param result The `Result` to check.
   * @returns `true` if the `Result` is `Result.Ok`, otherwise `false`.
   * @example
   * ```typescript
   * // Basic type guard usage
   * const result: Result<number, string> = divide(10, 2);
   *
   * if (Result.isOk(result)) {
   *   // TypeScript knows result is Result.Ok<number>
   *   console.log(result.value); // Safe to access .value
   *   console.log(Result.unwrapOk(result)); // 5
   * } else {
   *   // TypeScript knows result is Result.Err<string>
   *   console.log(result.value); // Error message
   * }
   *
   * // Using in conditional logic
   * const processResult = (r: Result<string, Error>) => {
   *   return Result.isOk(r)
   *     ? r.value.toUpperCase() // Safe string operations
   *     : "Error occurred";
   * };
   *
   * // Filtering arrays of Results
   * const results: Result<number, string>[] = [
   *   Result.ok(1),
   *   Result.err("error"),
   *   Result.ok(2)
   * ];
   * const successes = results.filter(Result.isOk);
   * // successes is Result.Ok<number>[]
   * ```
   */
  export const isOk = <R extends Base>(result: R): result is NarrowToOk<R> =>
    result.$$tag === OkTypeTagName;

  /**
   * Checks if a `Result` is `Result.Err`.
   * Acts as a type guard, narrowing the type to the error variant.
   *
   * This function is essential for type-safe Result handling, allowing
   * TypeScript to understand that subsequent operations will work with
   * the error value rather than the success value.
   *
   * @template R The `Result.Base` type to check.
   * @param result The `Result` to check.
   * @returns `true` if the `Result` is `Result.Err`, otherwise `false`.
   * @example
   * ```typescript
   * // Basic type guard usage
   * const result: Result<number, string> = divide(10, 0);
   *
   * if (Result.isErr(result)) {
   *   // TypeScript knows result is Result.Err<string>
   *   console.log(result.value); // Safe to access error .value
   *   console.log(Result.unwrapErr(result)); // "Division by zero"
   * } else {
   *   // TypeScript knows result is Result.Ok<number>
   *   console.log(result.value); // Success value
   * }
   *
   * // Error handling patterns
   * const handleResult = (r: Result<Data, ApiError>) => {
   *   if (Result.isErr(r)) {
   *     logError(r.value); // Safe error operations
   *     return null;
   *   }
   *   return processData(r.value);
   * };
   *
   * // Collecting errors from multiple Results
   * const results: Result<string, ValidationError>[] = validateForm();
   * const errors = results
   *   .filter(Result.isErr)
   *   .map(err => err.value); // ValidationError[]
   * ```
   */
  export const isErr = <R extends Base>(result: R): result is NarrowToErr<R> =>
    result.$$tag === ErrTypeTagName;

  /**
   * Unwraps a `Result`, returning the success value.
   * Throws an error if the `Result` is `Result.Err`.
   *
   * This is useful when you're confident that a Result should contain a success value
   * and want to treat errors as exceptional conditions. The error message will be
   * constructed from the error value using the provided string conversion function.
   *
   * @template R The `Result.Base` type to unwrap.
   * @param result The `Result` to unwrap.
   * @param toStr An optional function to convert the error value to a string for the error message. Defaults to `String`.
   * @returns The success value if `Result.Ok`.
   * @throws {Error} Error with the stringified error value if the `Result` is `Result.Err`.
   * @example
   * ```typescript
   * const success = Result.ok(42);
   * console.log(Result.unwrapThrow(success)); // 42
   *
   * const failure = Result.err("Network error");
   * try {
   *   Result.unwrapThrow(failure); // throws Error: "Network error"
   * } catch (error) {
   *   console.log(error.message); // "Network error"
   * }
   * ```
   */
  export const unwrapThrow = <R extends Base>(
    result: R,
    toStr: (e: UnwrapErr<R>) => string = toStr_,
  ): UnwrapOk<R> => {
    if (isErr(result)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      throw new Error(toStr(result.value as UnwrapErr<R>));
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return result.value as UnwrapOk<R>;
  };

  /**
   * Unwraps a `Result`, returning the success value or `undefined` if it's an error.
   *
   * This function provides a safe way to extract success values from Results without
   * throwing exceptions. It has overloaded behavior based on the type:
   * - For `Result.Ok<T>`: Always returns `T` (guaranteed by type system)
   * - For general `Result<T, E>`: Returns `T | undefined`
   *
   * @template R The `Result.Base` type to unwrap.
   * @param result The `Result` to unwrap.
   * @returns The success value if `Result.Ok`, otherwise `undefined`.
   * @example
   * ```typescript
   * // With guaranteed Ok - returns the value
   * const success = Result.ok(42);
   * const value = Result.unwrapOk(success); // Type: number, Value: 42
   *
   * // With general Result - may return undefined
   * const maybeResult: Result<string, Error> = fetchData();
   * const data = Result.unwrapOk(maybeResult); // Type: string | undefined
   *
   * // Safe pattern for handling both cases
   * const result = Result.ok("hello");
   * const unwrapped = Result.unwrapOk(result);
   * if (unwrapped !== undefined) {
   *   console.log(unwrapped.toUpperCase()); // "HELLO"
   * }
   *
   * // Useful in conditional chains
   * const processResult = (r: Result<number, string>) => {
   *   const value = Result.unwrapOk(r);
   *   return value !== undefined ? value * 2 : 0;
   * };
   * ```
   */
  export function unwrapOk<R extends Ok<unknown>>(result: R): UnwrapOk<R>;

  export function unwrapOk<R extends Base>(result: R): UnwrapOk<R> | undefined;

  export function unwrapOk<R extends Base>(result: R): UnwrapOk<R> | undefined {
    return isErr(result)
      ? undefined
      : // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        (result.value as UnwrapOk<R>);
  }

  /**
   * Unwraps a `Result`, returning the success value or a default value if it is `Result.Err`.
   * @template R The `Result.Base` type to unwrap.
   * @template D The type of the default value.
   * @param result The `Result` to unwrap.
   * @param defaultValue The value to return if `result` is `Result.Err`.
   * @returns The success value if `Result.Ok`, otherwise `defaultValue`.
   * @example
   * ```typescript
   * const result = Result.ok(42);
   * const value = Result.unwrapOkOr(result, 0);
   * console.log(value); // 42
   * ```
   */
  export function unwrapOkOr<R extends Base, D>(
    result: R,
    defaultValue: D,
  ): D | UnwrapOk<R>;

  // Curried version
  export function unwrapOkOr<S, D>(
    defaultValue: D,
  ): <E>(result: Result<S, E>) => D | S;

  export function unwrapOkOr<R extends Base, D>(
    ...args: readonly [result: R, defaultValue: D] | readonly [defaultValue: D]
  ):
    | D
    | UnwrapOk<R>
    | (<E>(result: Result<UnwrapOk<R>, E>) => D | UnwrapOk<R>) {
    switch (args.length) {
      case 2: {
        // Direct version: first argument is result
        const [result, defaultValue] = args;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        return isErr(result) ? defaultValue : (result.value as UnwrapOk<R>);
      }

      case 1: {
        // Curried version: first argument is default value
        const [defaultValue] = args;
        return <E,>(result: Result<UnwrapOk<R>, E>) =>
          unwrapOkOr(result, defaultValue);
      }
    }
  }

  /**
   * Unwraps a `Result`, returning the error value.
   * Throws an error if the `Result` is `Result.Ok`.
   *
   * This function is used when you expect a Result to be an error and want to
   * extract the error value. If the Result is unexpectedly Ok, it will throw
   * an error with information about the unexpected success value.
   *
   * @template R The `Result.Base` type to unwrap.
   * @param result The `Result` to unwrap.
   * @param toStr An optional function to convert the success value to a string for the error message when the Result is unexpectedly Ok. Defaults to `String`.
   * @returns The error value if `Result.Err`.
   * @throws {Error} Error with message "Expected Err but got Ok: {value}" if the `Result` is `Result.Ok`.
   * @example
   * ```typescript
   * const failure = Result.err("Network timeout");
   * console.log(Result.unwrapErrThrow(failure)); // "Network timeout"
   *
   * const success = Result.ok(42);
   * try {
   *   Result.unwrapErrThrow(success); // throws Error: "Expected Err but got Ok: 42"
   * } catch (error) {
   *   console.log(error.message); // "Expected Err but got Ok: 42"
   * }
   * ```
   */
  export const unwrapErrThrow = <R extends Base>(
    result: R,
    toStr: (v: UnwrapOk<R>) => string = toStr_,
  ): UnwrapErr<R> => {
    if (isOk(result)) {
      throw new Error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        `Expected Err but got Ok: ${toStr(result.value as UnwrapOk<R>)}`,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return result.value as UnwrapErr<R>;
  };

  /**
   * Unwraps a `Result`, returning the error value or `undefined` if it is `Result.Ok`.
   *
   * This provides a safe way to extract error values from Results without throwing
   * exceptions. Useful for error handling patterns where you want to check for
   * specific error conditions.
   *
   * @template R The `Result.Base` type to unwrap.
   * @param result The `Result` to unwrap.
   * @returns The error value if `Result.Err`, otherwise `undefined`.
   * @example
   * ```typescript
   * const failure = Result.err("Connection failed");
   * console.log(Result.unwrapErr(failure)); // "Connection failed"
   *
   * const success = Result.ok(42);
   * console.log(Result.unwrapErr(success)); // undefined
   * ```
   */
  export const unwrapErr = <R extends Base>(
    result: R,
  ): UnwrapErr<R> | undefined =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    isErr(result) ? (result.value as UnwrapErr<R>) : undefined;

  /**
   * Unwraps a `Result`, returning the error value or a default value if it is `Result.Ok`.
   * @template R The `Result.Base` type to unwrap.
   * @template D The type of the default value.
   * @param result The `Result` to unwrap.
   * @param defaultValue The value to return if `result` is `Result.Ok`.
   * @returns The error value if `Result.Err`, otherwise `defaultValue`.
   * @example
   * ```typescript
   * const result = Result.err("failed");
   * const error = Result.unwrapErrOr(result, "default");
   * console.log(error); // "failed"
   * ```
   */
  export function unwrapErrOr<R extends Base, D>(
    result: R,
    defaultValue: D,
  ): D | UnwrapErr<R>;

  // Curried version
  export function unwrapErrOr<E, D>(
    defaultValue: D,
  ): <S>(result: Result<S, E>) => D | E;

  export function unwrapErrOr<R extends Base, D>(
    ...args: readonly [result: R, defaultValue: D] | readonly [defaultValue: D]
  ):
    | D
    | UnwrapErr<R>
    | (<S>(result: Result<S, UnwrapErr<R>>) => D | UnwrapErr<R>) {
    switch (args.length) {
      case 2: {
        // Direct version: first argument is result
        const [result, defaultValue] = args;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        return isErr(result) ? (result.value as UnwrapErr<R>) : defaultValue;
      }

      case 1: {
        // Curried version: first argument is default value
        const [defaultValue] = args;
        return <S,>(result: Result<S, UnwrapErr<R>>) =>
          unwrapErrOr(result, defaultValue);
      }
    }
  }

  /**
   * Maps a `Result<S, E>` to `Result<S2, E>` by applying a function to the success value.
   * If the `Result` is `Result.Err`, returns the original `Err`.
   * @template R The input `Result.Base` type.
   * @template S2 The type of the success value returned by the mapping function.
   * @param result The `Result` to map.
   * @param mapFn The function to apply to the success value if present.
   * @returns A new `Result<S2, UnwrapErr<R>>`.
   * @example
   * ```typescript
   * // Regular usage
   * const result = Result.ok(5);
   * const mapped = Result.map(result, x => x * 2);
   * console.log(Result.unwrap(mapped)); // 10
   *
   * // Curried version for use with pipe
   * const doubler = Result.map((x: number) => x * 2);
   * const result2 = pipe(Result.ok(5)).map(doubler).value;
   * console.log(Result.unwrap(result2)); // 10
   * ```
   */
  export function map<R extends Base, S2>(
    result: R,
    mapFn: (value: UnwrapOk<R>) => S2,
  ): Result<S2, UnwrapErr<R>>;

  // Curried version
  export function map<S, S2>(
    mapFn: (value: S) => S2,
  ): <E>(result: Result<S, E>) => Result<S2, E>;

  export function map<R extends Base, S2>(
    ...args:
      | readonly [result: R, mapFn: (value: UnwrapOk<R>) => S2]
      | readonly [mapFn: (value: UnwrapOk<R>) => S2]
  ): Result<S2, UnwrapErr<R>> | ((result: R) => Result<S2, UnwrapErr<R>>) {
    switch (args.length) {
      case 2: {
        const [result, mapFn] = args;
        return isErr(result)
          ? // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            (result as Err<UnwrapErr<R>>)
          : // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            ok(mapFn(result.value as UnwrapOk<R>));
      }

      case 1: {
        // Curried version: first argument is mapping function
        const [mapFn] = args;
        return (result: R) => map(result, mapFn);
      }
    }
  }

  /**
   * Maps a `Result<S, E>` to `Result<S, E2>` by applying a function to the error value.
   * If the `Result` is `Result.Ok`, returns the original `Ok`.
   * @template R The input `Result.Base` type.
   * @template E2 The type of the error value returned by the mapping function.
   * @param result The `Result` to map.
   * @param mapFn The function to apply to the error value if present.
   * @returns A new `Result<UnwrapOk<R>, E2>`.
   * @example
   * ```typescript
   * const result = Result.err("error");
   * const mapped = Result.mapErr(result, e => e.toUpperCase());
   * console.log(Result.unwrapErr(mapped)); // "ERROR"
   * ```
   */
  export function mapErr<R extends Base, E2>(
    result: R,
    mapFn: (error: UnwrapErr<R>) => E2,
  ): Result<UnwrapOk<R>, E2>;

  // Curried version
  export function mapErr<E, E2>(
    mapFn: (error: E) => E2,
  ): <S>(result: Result<S, E>) => Result<S, E2>;

  export function mapErr<R extends Base, E2>(
    ...args:
      | readonly [result: R, mapFn: (error: UnwrapErr<R>) => E2]
      | readonly [mapFn: (error: UnwrapErr<R>) => E2]
  ): Result<UnwrapOk<R>, E2> | ((result: R) => Result<UnwrapOk<R>, E2>) {
    switch (args.length) {
      case 2: {
        const [result, mapFn] = args;
        return isOk(result)
          ? // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            (result as Ok<UnwrapOk<R>>)
          : // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            err(mapFn(result.value as UnwrapErr<R>));
      }

      case 1: {
        // Curried version: first argument is mapping function
        const [mapFn] = args;
        return (result: R) => mapErr(result, mapFn);
      }
    }
  }

  /**
   * Applies one of two functions depending on whether the `Result` is `Ok` or `Err`.
   * @template R The input `Result.Base` type.
   * @template S2 The type of the success value returned by `mapFn`.
   * @template E2 The type of the error value returned by `mapErrFn`.
   * @param result The `Result` to fold.
   * @param mapFn The function to apply if `result` is `Ok`.
   * @param mapErrFn The function to apply if `result` is `Err`.
   * @returns A new `Result<S2, E2>` based on the applied function.
   * @example
   * ```typescript
   * const result = Result.ok(42);
   * const folded = Result.fold(result, x => x * 2, () => 0);
   * console.log(Result.unwrapOk(folded)); // 84
   * ```
   */
  export function fold<R extends Base, S2, E2>(
    result: R,
    mapFn: (value: UnwrapOk<R>) => S2,
    mapErrFn: (error: UnwrapErr<R>) => E2,
  ): Result<S2, E2>;

  // Curried version
  export function fold<S, E, S2, E2>(
    mapFn: (value: S) => S2,
    mapErrFn: (error: E) => E2,
  ): (result: Result<S, E>) => Result<S2, E2>;

  export function fold<R extends Base, S2, E2>(
    ...args:
      | readonly [
          result: R,
          mapFn: (value: UnwrapOk<R>) => S2,
          mapErrFn: (error: UnwrapErr<R>) => E2,
        ]
      | readonly [
          mapFn: (value: UnwrapOk<R>) => S2,
          mapErrFn: (error: UnwrapErr<R>) => E2,
        ]
  ):
    | Result<S2, E2>
    | ((result: Result<UnwrapOk<R>, UnwrapErr<R>>) => Result<S2, E2>) {
    switch (args.length) {
      case 3: {
        const [result, mapFn, mapErrFn] = args;
        return isOk(result)
          ? // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            ok(mapFn(result.value as UnwrapOk<R>))
          : // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            err(mapErrFn(result.value as UnwrapErr<R>));
      }

      case 2: {
        const [mapFn, mapErrFn] = args;
        return (result: Result<UnwrapOk<R>, UnwrapErr<R>>) =>
          isOk(result) ? ok(mapFn(result.value)) : err(mapErrFn(result.value));
      }
    }
  }

  /**
   * Applies a function that returns a `Result` to the success value of a `Result`.
   * If the input is `Err`, returns the original `Err`.
   * This is the monadic bind operation for `Result`.
   * @template R The input `Result.Base` type.
   * @template S2 The success type of the `Result` returned by the function.
   * @template E2 The error type of the `Result` returned by the function.
   * @param result The `Result` to flat map.
   * @param flatMapFn The function to apply that returns a `Result`.
   * @returns The result of applying the function, or the original `Err`.
   * @example
   * ```typescript
   * const divide = (a: number, b: number): Result<number, string> =>
   *   b === 0 ? Result.err("Division by zero") : Result.ok(a / b);
   *
   * const result = Result.flatMap(Result.ok(10), x => divide(x, 2));
   * console.log(Result.unwrapOk(result)); // 5
   * ```
   */
  export function flatMap<R extends Base, S2, E2>(
    result: R,
    flatMapFn: (value: UnwrapOk<R>) => Result<S2, E2>,
  ): Result<S2, E2 | UnwrapErr<R>>;

  // Curried version
  export function flatMap<S, S2, E2>(
    flatMapFn: (value: S) => Result<S2, E2>,
  ): <E>(result: Result<S, E>) => Result<S2, E | E2>;

  export function flatMap<R extends Base, S2, E2>(
    ...args:
      | readonly [result: R, flatMapFn: (value: UnwrapOk<R>) => Result<S2, E2>]
      | readonly [flatMapFn: (value: UnwrapOk<R>) => Result<S2, E2>]
  ):
    | Result<S2, E2 | UnwrapErr<R>>
    | (<E>(result: Result<UnwrapOk<R>, E>) => Result<S2, E | E2>) {
    switch (args.length) {
      case 2: {
        const [result, flatMapFn] = args;
        return isErr(result)
          ? // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            (result as Err<UnwrapErr<R>>)
          : // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            flatMapFn(result.value as UnwrapOk<R>);
      }

      case 1: {
        const [flatMapFn] = args;
        return <E,>(result: Result<UnwrapOk<R>, E>) =>
          isErr(result) ? result : flatMapFn(result.value);
      }
    }
  }

  /**
   * Unwraps a `Result`, returning the success value or throwing an error with the provided message.
   * @template R The `Result.Base` type to unwrap.
   * @param result The `Result` to unwrap.
   * @param message The error message to throw if the `Result` is `Result.Err`.
   * @returns The success value if `Result.Ok`.
   * @throws Error with the provided message if the `Result` is `Result.Err`.
   * @example
   * ```typescript
   * const result = Result.ok(42);
   * const value = Result.expectToBe(result, "Operation must succeed");
   * console.log(value); // 42
   * ```
   */
  export function expectToBe<R extends Base>(
    result: R,
    message: string,
  ): UnwrapOk<R>;

  // Curried version
  export function expectToBe<S>(
    message: string,
  ): <E>(result: Result<S, E>) => S;

  export function expectToBe<R extends Base>(
    ...args: readonly [result: R, message: string] | readonly [message: string]
  ): UnwrapOk<R> | (<E>(result: Result<UnwrapOk<R>, E>) => UnwrapOk<R>) {
    switch (args.length) {
      case 2: {
        // Direct version: first argument is result
        const [result, message] = args;
        if (isOk(result)) {
          return unwrapOk(result);
        }

        throw new Error(message);
      }

      case 1: {
        // Curried version: first argument is message
        const [message] = args;
        return <E,>(result: Result<UnwrapOk<R>, E>): UnwrapOk<R> =>
          expectToBe(result, message);
      }
    }
  }

  /**
   * @internal
   * Utility type to extract the resolved value type from a Promise.
   * @template P The Promise type.
   * @example
   * UnwrapPromise<Promise<string>> // string
   * UnwrapPromise<Promise<number>> // number
   */
  type UnwrapPromise<P extends Promise<unknown>> =
    P extends Promise<infer V> ? V : never;

  /**
   * Converts a Promise into a Promise that resolves to a `Result`.
   * If the input Promise resolves, the `Result` will be `Ok` with the resolved value.
   * If the input Promise rejects, the `Result` will be `Err` with the rejection reason.
   * @template P The type of the input Promise.
   * @param promise The Promise to convert.
   * @returns A Promise that resolves to `Result<UnwrapPromise<P>, unknown>`.
   */
  export const fromPromise = <P extends Promise<unknown>>(
    promise: P,
  ): Promise<Result<UnwrapPromise<P>, unknown>> =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    promise.then((v) => ok(v) as Ok<UnwrapPromise<P>>).catch(err);

  /**
   * Wraps a function that may throw an exception in a `Result`.
   *
   * This is a fundamental utility for converting traditional exception-based error
   * handling into Result-based error handling. Any thrown value is converted to an
   * Error object for consistent error handling.
   *
   * If the function executes successfully, returns `Result.Ok` with the result.
   * If the function throws, returns `Result.Err` with the caught error.
   *
   * @template T The return type of the function.
   * @param fn The function to execute that may throw.
   * @returns A `Result<T, Error>` containing either the successful result or the caught error.
   * @example
   * ```typescript
   * // Wrapping JSON.parse which can throw
   * const parseJson = <T>(text: string): Result<T, Error> =>
   *   Result.fromThrowable(() => JSON.parse(text) as T);
   *
   * const validJson = parseJson<{valid: boolean}>('{"valid": true}');
   * if (Result.isOk(validJson)) {
   *   console.log(validJson.value.valid); // true
   * }
   *
   * ```
   */
  export const fromThrowable = <T,>(fn: () => T): Result<T, Error> => {
    try {
      return ok(fn());
    } catch (error) {
      if (error instanceof Error) {
        return err(error);
      }
      const msg = unknownToString(error);
      if (isErr(msg)) {
        return err(new Error(String(error)));
      } else {
        return err(new Error(msg.value));
      }
    }
  };

  /**
   * Swaps the success and error values of a `Result`.
   * @template R The input `Result.Base` type.
   * @param result The `Result` to swap.
   * @returns A new `Result` with success and error swapped.
   * @example
   * ```typescript
   * const okResult = Result.ok(42);
   * const swapped = Result.swap(okResult);
   * console.log(Result.isErr(swapped)); // true
   * console.log(Result.unwrapErr(swapped)); // 42
   * ```
   */
  export const swap = <R extends Base>(
    result: R,
  ): Result<UnwrapErr<R>, UnwrapOk<R>> =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    isOk(result) ? err(unwrapOk(result)) : ok(result.value as UnwrapErr<R>);

  /**
   * Converts a `Result` to an `Optional`.
   *
   * This conversion is useful when you want to discard error information and only
   * care about whether an operation succeeded. The error information is lost in
   * this conversion, so use it when error details are not needed.
   *
   * If the `Result` is `Ok`, returns `Some` with the value.
   * If the `Result` is `Err`, returns `None`.
   *
   * @template R The input `Result.Base` type.
   * @param result The `Result` to convert.
   * @returns An `Optional<UnwrapOk<R>>` containing the success value or representing `None`.
   * @example
   * ```typescript
   * // Basic conversion
   * const okResult = Result.ok(42);
   * const optional = Result.toOptional(okResult);
   * console.log(Optional.isSome(optional)); // true
   * console.log(Optional.unwrap(optional)); // 42
   *
   * const errResult = Result.err("Network error");
   * const none = Result.toOptional(errResult);
   * console.log(Optional.isNone(none)); // true
   *
   * ```
   */
  export const toOptional = <R extends Base>(
    result: R,
  ): Optional<UnwrapOk<R>> =>
    isOk(result) ? Optional.some(unwrapOk(result)) : Optional.none;

  /**
   * Returns the `Result` if it is `Ok`, otherwise returns the alternative.
   * @template R The input `Result.Base` type.
   * @param result The `Result` to check.
   * @param alternative The alternative `Result` to return if the first is `Err`.
   * @returns The first `Result` if `Ok`, otherwise the alternative.
   * @example
   * ```typescript
   * const primary = Result.err("error");
   * const fallback = Result.ok("default");
   * const result = Result.orElse(primary, fallback);
   * console.log(Result.unwrapOk(result)); // "default"
   * ```
   */
  export function orElse<R extends Base, R2 extends Base>(
    result: R,
    alternative: R2,
  ): NarrowToOk<R> | R2;

  // Curried version
  export function orElse<S, E, S2, E2>(
    alternative: Result<S2, E2>,
  ): (result: Result<S, E>) => Result<S, E> | Result<S2, E2>;

  export function orElse<R extends Base, R2 extends Base>(
    ...args: readonly [result: R, alternative: R2] | readonly [alternative: R2]
  ):
    | (NarrowToOk<R> | R2)
    | ((
        result: Result<UnwrapOk<R>, UnwrapErr<R>>,
      ) => Result<UnwrapOk<R>, UnwrapErr<R>> | R2) {
    switch (args.length) {
      case 2: {
        const [result, alternative] = args;
        return isOk(result) ? result : alternative;
      }

      case 1: {
        // Curried version: one argument (alternative) provided
        const [alternative] = args;
        return (result: Result<UnwrapOk<R>, UnwrapErr<R>>) =>
          orElse(result, alternative);
      }
    }
  }

  /**
   * Combines two `Result` values into a single `Result` containing a tuple.
   * If either `Result` is `Err`, returns the first `Err` encountered.
   * @template S1 The success type of the first `Result`.
   * @template E1 The error type of the first `Result`.
   * @template S2 The success type of the second `Result`.
   * @template E2 The error type of the second `Result`.
   * @param resultA The first `Result`.
   * @param resultB The second `Result`.
   * @returns A `Result` containing a tuple of both values, or the first `Err`.
   * @example
   * ```typescript
   * const a = Result.ok(1);
   * const b = Result.ok("hello");
   * const zipped = Result.zip(a, b);
   * console.log(Result.unwrapOk(zipped)); // [1, "hello"]
   *
   * const withErr = Result.zip(a, Result.err("error"));
   * console.log(Result.unwrapErr(withErr)); // "error"
   * ```
   */
  export const zip = <S1, E1, S2, E2>(
    resultA: Result<S1, E1>,
    resultB: Result<S2, E2>,
  ): Result<readonly [S1, S2], E1 | E2> =>
    isOk(resultA)
      ? isOk(resultB)
        ? ok([resultA.value, resultB.value] as const)
        : resultB
      : resultA;
}
