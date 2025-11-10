import { err } from './ternary-result-err.mjs';
import { isErr } from './ternary-result-is-err.mjs';
import { type UnwrapErr, type UnwrapOk, type UnwrapWarn } from './types.mjs';

/**
 * Maps the Err variant while leaving Ok/Warn untouched.
 *
 * @example
 *
 * ```ts
 * const errValue = TernaryResult.err('boom');
 * const mappedErr = TernaryResult.mapErr(errValue, (error) =>
 *   error.toUpperCase(),
 * );
 * const warnPassthrough = TernaryResult.mapErr(
 *   TernaryResult.warn(2, 'slow'),
 *   (error: string) => `${error}!`,
 * );
 *
 * assert.deepStrictEqual(mappedErr, TernaryResult.err('BOOM'));
 * assert.deepStrictEqual(warnPassthrough, TernaryResult.warn(2, 'slow'));
 * ```
 */
export function mapErr<R extends UnknownTernaryResult, E2>(
  result: R,
  mapFn: (error: UnwrapErr<R>) => E2,
): TernaryResult<UnwrapOk<R>, E2, UnwrapWarn<R>>;

// Curried version
export function mapErr<E, E2>(
  mapFn: (error: E) => E2,
): <S, W>(result: TernaryResult<S, E, W>) => TernaryResult<S, E2, W>;

export function mapErr<R extends UnknownTernaryResult, E2>(
  ...args:
    | readonly [result: R, mapFn: (error: UnwrapErr<R>) => E2]
    | readonly [mapFn: (error: UnwrapErr<R>) => E2]
):
  | TernaryResult<UnwrapOk<R>, E2, UnwrapWarn<R>>
  | ((result: R) => TernaryResult<UnwrapOk<R>, E2, UnwrapWarn<R>>) {
  switch (args.length) {
    case 2: {
      const [result, mapFn] = args;
      return mapErrImpl(result, mapFn);
    }
    case 1: {
      const [mapFn] = args;
      return (result: R) => mapErrImpl(result, mapFn);
    }
  }
}

const mapErrImpl = <R extends UnknownTernaryResult, E2>(
  result: R,
  mapFn: (error: UnwrapErr<R>) => E2,
): TernaryResult<UnwrapOk<R>, E2, UnwrapWarn<R>> => {
  if (isErr(result)) {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return err(mapFn(result.value as UnwrapErr<R>));
  }

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return result as TernaryResult<UnwrapOk<R>, E2, UnwrapWarn<R>>;
};
