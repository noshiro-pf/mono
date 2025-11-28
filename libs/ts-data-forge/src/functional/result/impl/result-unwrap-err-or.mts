import { unwrapErr } from './result-unwrap-err.mjs';
import { type UnwrapErr } from './types.mjs';

/**
 * Unwraps a `Result`, returning the error value or a default value if it is
 * `Result.Ok`.
 *
 * @example
 *
 * ```ts
 * const okResult = Result.ok('success');
 *
 * const errResult = Result.err('failure');
 *
 * assert.isTrue(Result.unwrapErrOr(okResult, 'default') === 'default');
 *
 * assert.isTrue(Result.unwrapErrOr(errResult, 'default') === 'failure');
 *
 * const unwrapError = Result.unwrapErrOr('fallback error');
 *
 * assert.isTrue(unwrapError(Result.err('boom')) === 'boom');
 *
 * assert.isTrue(unwrapError(Result.ok('no error')) === 'fallback error');
 * ```
 *
 * @template R The `UnknownResult` type to unwrap.
 * @template D The type of the default value.
 * @param result The `Result` to unwrap.
 * @param defaultValue The value to return if `result` is `Result.Ok`.
 * @returns The error value if `Result.Err`, otherwise `defaultValue`.
 */
export function unwrapErrOr<R extends UnknownResult, D>(
  result: R,
  defaultValue: D,
): D | UnwrapErr<R>;

// Curried version
export function unwrapErrOr<D>(
  defaultValue: D,
): <S, E>(result: Result<S, E>) => D | E;

export function unwrapErrOr<R extends UnknownResult, D>(
  ...args: readonly [result: R, defaultValue: D] | readonly [defaultValue: D]
): D | UnwrapErr<R> | ((result: R) => D | UnwrapErr<R>) {
  switch (args.length) {
    case 2: {
      // Direct version: first argument is result
      const [result, defaultValue] = args;

      return unwrapErrOrImpl(result, defaultValue);
    }

    case 1: {
      // Curried version
      const [defaultValue] = args;

      return (result: R) => unwrapErrOrImpl(result, defaultValue);
    }
  }
}

const unwrapErrOrImpl = <R extends UnknownResult, D>(
  result: R,
  defaultValue: D,
): D | UnwrapErr<R> => unwrapErr(result) ?? defaultValue;
