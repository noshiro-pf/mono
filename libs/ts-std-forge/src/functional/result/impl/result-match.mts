import { type UnknownResult } from '../result.mjs';
import { isOk } from './result-is-ok.mjs';
import { type UnwrapErr, type UnwrapOk } from './types.mjs';

/**
 * Folds a `Result` into a plain value by applying one of two case handlers:
 * `ok` if the `Result` is `Ok`, `err` otherwise. This is the function form of
 * pattern matching on a `Result`.
 *
 * Unlike {@link Result.fold}, which maps both sides and returns another
 * `Result`, `match` unwraps: both branches produce the final value directly.
 *
 * @example
 *
 * ```ts
 * const doubledOrZero = Result.match(Result.ok(21), {
 *   ok: (value) => value * 2,
 *   err: () => 0,
 * });
 *
 * assert.deepStrictEqual(doubledOrZero, 42);
 *
 * const matcher = Result.match({
 *   ok: (value: number) => value + 1,
 *   err: (error: string) => error.length,
 * });
 *
 * assert.deepStrictEqual(matcher(Result.ok(1)), 2);
 *
 * assert.deepStrictEqual(matcher(Result.err('oops')), 4);
 * ```
 *
 * @template R The input `UnknownResult` type.
 * @template S2 The type returned by the `ok` case.
 * @template E2 The type returned by the `err` case.
 * @param result The `Result` to match on.
 * @param cases An object with an `ok` handler receiving the success value and
 *   an `err` handler receiving the error value.
 * @returns The value produced by whichever case handler was applied.
 */
export function match<R extends UnknownResult, S2, E2>(
  result: R,
  cases: Readonly<{
    ok: (value: UnwrapOk<R>) => S2;
    err: (error: UnwrapErr<R>) => E2;
  }>,
): E2 | S2;

// Curried version
//
// The returned function is generic over the *whole* result, mirroring the
// direct overload above; see the comment on the curried overload of
// `Result.map` for why the parameter is a conditional type instead of a plain
// `Result<S, E>`. Both sides have to be checked here, hence the nested
// conditional.
export function match<S, E, S2, E2>(
  cases: Readonly<{
    ok: (value: S) => S2;
    err: (error: E) => E2;
  }>,
): <R extends UnknownResult>(
  result: UnwrapOk<R> extends S ? (UnwrapErr<R> extends E ? R : never) : never,
) => E2 | S2;

export function match<R extends UnknownResult, S2, E2>(
  ...args:
    | readonly [
        result: R,
        cases: Readonly<{
          ok: (value: UnwrapOk<R>) => S2;
          err: (error: UnwrapErr<R>) => E2;
        }>,
      ]
    | readonly [
        cases: Readonly<{
          ok: (value: UnwrapOk<R>) => S2;
          err: (error: UnwrapErr<R>) => E2;
        }>,
      ]
): E2 | S2 | ((result: R) => E2 | S2) {
  switch (args.length) {
    case 2: {
      const [result, cases] = args;

      return matchImpl(result, cases);
    }

    case 1: {
      // Curried version: the only argument is the case handlers
      const [cases] = args;

      return (result: R) => matchImpl(result, cases);
    }
  }
}

const matchImpl = <R extends UnknownResult, S2, E2>(
  result: R,
  cases: Readonly<{
    ok: (value: UnwrapOk<R>) => S2;
    err: (error: UnwrapErr<R>) => E2;
  }>,
): E2 | S2 =>
  isOk(result)
    ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      cases.ok(result.value as UnwrapOk<R>)
    : // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      cases.err(result.value as UnwrapErr<R>);
