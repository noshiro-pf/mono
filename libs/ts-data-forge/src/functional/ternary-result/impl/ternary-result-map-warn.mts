import { isWarn } from './ternary-result-is-warn.mjs';
import { warn } from './ternary-result-warn.mjs';
import { type UnwrapErr, type UnwrapOk, type UnwrapWarn } from './types.mjs';

/**
 * Maps the Warn variant while leaving Ok/Err untouched.
 *
 * @example
 *
 * ```ts
 * const warnValue = TernaryResult.warn(2, 'slow');
 *
 * const mappedWarn = TernaryResult.mapWarn(
 *   warnValue,
 *   (warning) => `${warning}!`,
 * );
 *
 * const okPassthrough = TernaryResult.mapWarn(
 *   TernaryResult.ok(3),
 *   (value: number) => value * 2,
 * );
 *
 * assert.deepStrictEqual(mappedWarn, TernaryResult.warn(2, 'slow!'));
 *
 * assert.deepStrictEqual(okPassthrough, TernaryResult.ok(3));
 * ```
 */
export function mapWarn<R extends UnknownTernaryResult, W2>(
  result: R,
  mapFn: (warning: UnwrapWarn<R>) => W2,
): TernaryResult<UnwrapOk<R>, UnwrapErr<R>, W2>;

// Curried version
export function mapWarn<W, W2>(
  mapFn: (warning: W) => W2,
): <S, E>(result: TernaryResult<S, E, W>) => TernaryResult<S, E, W2>;

export function mapWarn<R extends UnknownTernaryResult, W2>(
  ...args:
    | readonly [result: R, mapFn: (warning: UnwrapWarn<R>) => W2]
    | readonly [mapFn: (warning: UnwrapWarn<R>) => W2]
):
  | TernaryResult<UnwrapOk<R>, UnwrapErr<R>, W2>
  | ((result: R) => TernaryResult<UnwrapOk<R>, UnwrapErr<R>, W2>) {
  switch (args.length) {
    case 2: {
      const [result, mapFn] = args;

      return mapWarnImpl(result, mapFn);
    }

    case 1: {
      const [mapFn] = args;

      return (result: R) => mapWarnImpl(result, mapFn);
    }
  }
}

const mapWarnImpl = <R extends UnknownTernaryResult, W2>(
  result: R,
  mapFn: (warning: UnwrapWarn<R>) => W2,
): TernaryResult<UnwrapOk<R>, UnwrapErr<R>, W2> => {
  if (isWarn(result)) {
    return warn(
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      result.value as UnwrapOk<R>,
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      mapFn(result.warning as UnwrapWarn<R>),
    );
  }

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return result as TernaryResult<UnwrapOk<R>, UnwrapErr<R>, W2>;
};
