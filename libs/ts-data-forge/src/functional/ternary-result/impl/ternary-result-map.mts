import { isOk } from './ternary-result-is-ok.mjs';
import { isWarn } from './ternary-result-is-warn.mjs';
import { ok } from './ternary-result-ok.mjs';
import { warn } from './ternary-result-warn.mjs';
import { type UnwrapErr, type UnwrapOk, type UnwrapWarn } from './types.mjs';

/**
 * Maps the Ok variant while leaving Warn/Err untouched.
 *
 * @example
 *
 * ```ts
 * const okNumber = TernaryResult.ok(5);
 * const warnValue = TernaryResult.warn(5, 'slow');
 * const errValue = TernaryResult.err('bad');
 *
 * const doubled = TernaryResult.map(okNumber, (value) => value * 2);
 * const warnPassthrough = TernaryResult.map(
 *   warnValue,
 *   (value: number) => value * 2,
 * );
 * const errPassthrough = TernaryResult.map(
 *   errValue,
 *   (value: number) => value * 2,
 * );
 *
 * assert.deepStrictEqual(doubled, TernaryResult.ok(10));
 * assert.deepStrictEqual(warnPassthrough, TernaryResult.warn(10, 'slow'));
 * assert.deepStrictEqual(errPassthrough, errValue);
 * ```
 */
export function map<R extends UnknownTernaryResult, S2>(
  result: R,
  mapFn: (value: UnwrapOk<R>) => S2,
): TernaryResult<S2, UnwrapErr<R>, UnwrapWarn<R>>;

// Curried version
export function map<S, S2>(
  mapFn: (value: S) => S2,
): <W, E>(result: TernaryResult<S, E, W>) => TernaryResult<S2, E, W>;

export function map<R extends UnknownTernaryResult, S2>(
  ...args:
    | readonly [result: R, mapFn: (value: UnwrapOk<R>) => S2]
    | readonly [mapFn: (value: UnwrapOk<R>) => S2]
):
  | TernaryResult<S2, UnwrapErr<R>, UnwrapWarn<R>>
  | ((result: R) => TernaryResult<S2, UnwrapErr<R>, UnwrapWarn<R>>) {
  switch (args.length) {
    case 2: {
      const [result, mapFn] = args;
      return mapImpl(result, mapFn);
    }
    case 1: {
      const [mapFn] = args;
      return (result: R) => mapImpl(result, mapFn);
    }
  }
}

const mapImpl = <R extends UnknownTernaryResult, S2>(
  result: R,
  mapFn: (value: UnwrapOk<R>) => S2,
): TernaryResult<S2, UnwrapErr<R>, UnwrapWarn<R>> => {
  if (isOk(result)) {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return ok(mapFn(result.value as UnwrapOk<R>));
  }

  if (isWarn(result)) {
    return warn(
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      mapFn(result.value as UnwrapOk<R>),
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      result.warning as UnwrapWarn<R>,
    );
  }

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return result as TernaryErr<UnwrapErr<R>>;
};
