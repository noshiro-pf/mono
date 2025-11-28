import { unwrapOk } from './result-unwrap-ok.mjs';
import { type UnwrapOk } from './types.mjs';

/**
 * Unwraps a `Result`, returning the success value or a default value if it is
 * `Result.Err`.
 *
 * @example
 *
 * ```ts
 * const okValue = Result.ok(10);
 *
 * const errValue = Result.err('fail');
 *
 * assert.isTrue(Result.unwrapOkOr(okValue, 0) === 10);
 *
 * assert.isTrue(Result.unwrapOkOr(errValue, 0) === 0);
 *
 * const unwrapWithDefault = Result.unwrapOkOr(5);
 *
 * assert.isTrue(unwrapWithDefault(Result.ok(3)) === 3);
 *
 * assert.isTrue(unwrapWithDefault(Result.err('no data')) === 5);
 * ```
 *
 * @template R The `UnknownResult` type to unwrap.
 * @template D The type of the default value.
 * @param result The `Result` to unwrap.
 * @param defaultValue The value to return if `result` is `Result.Err`.
 * @returns The success value if `Result.Ok`, otherwise `defaultValue`.
 */
export function unwrapOkOr<R extends UnknownResult, D>(
  result: R,
  defaultValue: D,
): D | UnwrapOk<R>;

// Curried version
export function unwrapOkOr<S, D>(
  defaultValue: D,
): <E>(result: Result<S, E>) => D | S;

export function unwrapOkOr<R extends UnknownResult, D>(
  ...args: readonly [result: R, defaultValue: D] | readonly [defaultValue: D]
): D | UnwrapOk<R> | ((result: R) => D | UnwrapOk<R>) {
  switch (args.length) {
    case 2: {
      // Direct version: first argument is result
      const [result, defaultValue] = args;

      return unwrapOkOrImpl(result, defaultValue);
    }

    case 1: {
      // Curried version
      const [defaultValue] = args;

      return (result: R) => unwrapOkOrImpl(result, defaultValue);
    }
  }
}

const unwrapOkOrImpl = <R extends UnknownResult, D>(
  result: R,
  defaultValue: D,
): D | UnwrapOk<R> => unwrapOk(result) ?? defaultValue;
