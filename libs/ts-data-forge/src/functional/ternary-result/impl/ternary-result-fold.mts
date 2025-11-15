import { err } from './ternary-result-err.mjs';
import { isOk } from './ternary-result-is-ok.mjs';
import { isWarn } from './ternary-result-is-warn.mjs';
import { ok } from './ternary-result-ok.mjs';
import { warn } from './ternary-result-warn.mjs';
import { type UnwrapErr, type UnwrapOk, type UnwrapWarn } from './types.mjs';

/**
 * Applies the provided mapper based on the current variant.
 *
 * @example
 *
 * ```ts
 * const okFold = TernaryResult.fold(
 *   TernaryResult.ok(2),
 *   (value) => value * 2,
 *   (warn: string) => warn.length,
 *   (error: string) => error.toUpperCase(),
 * );
 *
 * const warnFold = TernaryResult.fold(
 *   TernaryResult.warn(2, 'spike'),
 *   (value: number) => value,
 *   (warn: string) => warn.toUpperCase(),
 *   (error: string) => error,
 * );
 *
 * assert.deepStrictEqual(okFold, TernaryResult.ok(4));
 *
 * assert.deepStrictEqual(warnFold, TernaryResult.warn(2, 'SPIKE'));
 * ```
 */
export function fold<R extends UnknownTernaryResult, S2, W2, E2>(
  result: R,
  mapOk: (value: UnwrapOk<R>) => S2,
  mapWarn: (value: UnwrapWarn<R>) => W2,
  mapErr: (error: UnwrapErr<R>) => E2,
): TernaryResult<S2, E2, W2>;

// Curried version
export function fold<S, W, E, S2, W2, E2>(
  mapOk: (value: S) => S2,
  mapWarn: (value: W) => W2,
  mapErr: (error: E) => E2,
): (result: TernaryResult<S, E, W>) => TernaryResult<S2, E2, W2>;

export function fold<R extends UnknownTernaryResult, S2, W2, E2>(
  ...args:
    | readonly [
        result: R,
        mapOk: (value: UnwrapOk<R>) => S2,
        mapWarn: (value: UnwrapWarn<R>) => W2,
        mapErr: (error: UnwrapErr<R>) => E2,
      ]
    | readonly [
        mapOk: (value: UnwrapOk<R>) => S2,
        mapWarn: (value: UnwrapWarn<R>) => W2,
        mapErr: (error: UnwrapErr<R>) => E2,
      ]
): TernaryResult<S2, E2, W2> | ((result: R) => TernaryResult<S2, E2, W2>) {
  switch (args.length) {
    case 4: {
      const [result, mapOk, mapWarn, mapErr] = args;

      return foldImpl(result, mapOk, mapWarn, mapErr);
    }

    case 3: {
      const [mapOk, mapWarn, mapErr] = args;

      return (result: R) => foldImpl(result, mapOk, mapWarn, mapErr);
    }
  }
}

const foldImpl = <R extends UnknownTernaryResult, S2, W2, E2>(
  result: R,
  mapOk: (value: UnwrapOk<R>) => S2,
  mapWarnFn: (warning: UnwrapWarn<R>) => W2,
  mapErrFn: (error: UnwrapErr<R>) => E2,
): TernaryResult<S2, E2, W2> => {
  if (isOk(result)) {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return ok(mapOk(result.value as UnwrapOk<R>));
  }

  if (isWarn(result)) {
    return warn(
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      mapOk(result.value as UnwrapOk<R>),
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      mapWarnFn(result.warning as UnwrapWarn<R>),
    );
  }

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return err(mapErrFn(result.value as UnwrapErr<R>));
};
