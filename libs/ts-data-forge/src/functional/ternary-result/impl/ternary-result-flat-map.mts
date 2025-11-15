import { isOk } from './ternary-result-is-ok.mjs';
import { isWarn } from './ternary-result-is-warn.mjs';
import { warn } from './ternary-result-warn.mjs';
import { type UnwrapErr, type UnwrapOk, type UnwrapWarn } from './types.mjs';

/**
 * Applies a function returning a `TernaryResult` to the Ok variant.
 *
 * @example
 *
 * ```ts
 * const parse = (value: string): TernaryResult<number, string, string> =>
 *   Number.isNaN(Number(value))
 *     ? TernaryResult.err('NaN')
 *     : TernaryResult.ok(Number(value));
 *
 * const doubled = TernaryResult.flatMap(TernaryResult.ok('3'), (text) =>
 *   TernaryResult.map(parse(text), (num) => num * 2),
 * );
 *
 * const warnPassthrough = TernaryResult.flatMap(
 *   TernaryResult.warn('3', 'retry'),
 *   parse,
 * );
 *
 * const errPassthrough = TernaryResult.flatMap(TernaryResult.err('oops'), parse);
 *
 * assert.deepStrictEqual(doubled, TernaryResult.ok(6));
 *
 * assert.deepStrictEqual(warnPassthrough, TernaryResult.warn(3, 'retry'));
 *
 * assert.deepStrictEqual(errPassthrough, TernaryResult.err('oops'));
 * ```
 */
export function flatMap<R extends UnknownTernaryResult, S2, W2, E2>(
  result: R,
  flatMapFn: (value: UnwrapOk<R>) => TernaryResult<S2, E2, W2>,
): TernaryResult<S2, E2 | UnwrapErr<R>, W2 | UnwrapWarn<R>>;

// Curried version
export function flatMap<S, S2, W2, E2>(
  flatMapFn: (value: S) => TernaryResult<S2, E2, W2>,
): <W, E>(result: TernaryResult<S, E, W>) => TernaryResult<S2, E | E2, W | W2>;

export function flatMap<R extends UnknownTernaryResult, S2, W2, E2>(
  ...args:
    | readonly [
        result: R,
        flatMapFn: (value: UnwrapOk<R>) => TernaryResult<S2, E2, W2>,
      ]
    | readonly [flatMapFn: (value: UnwrapOk<R>) => TernaryResult<S2, E2, W2>]
):
  | TernaryResult<S2, E2 | UnwrapErr<R>, W2 | UnwrapWarn<R>>
  | ((result: R) => TernaryResult<S2, UnwrapErr<R> | E2, UnwrapWarn<R> | W2>) {
  switch (args.length) {
    case 2: {
      const [result, flatMapFn] = args;

      return flatMapImpl(result, flatMapFn);
    }

    case 1: {
      const [flatMapFn] = args;

      return (result: R) => flatMapImpl(result, flatMapFn);
    }
  }
}

const flatMapImpl = <R extends UnknownTernaryResult, S2, W2, E2>(
  result: R,
  flatMapFn: (value: UnwrapOk<R>) => TernaryResult<S2, E2, W2>,
): TernaryResult<S2, E2 | UnwrapErr<R>, W2 | UnwrapWarn<R>> => {
  if (isOk(result)) {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return flatMapFn(result.value as UnwrapOk<R>);
  }

  if (isWarn(result)) {
    const next = flatMapFn(
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      result.value as UnwrapOk<R>,
    );

    if (isOk(next)) {
      return warn(
        next.value,
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        result.warning as UnwrapWarn<R>,
      );
    }

    if (isWarn(next)) {
      return warn(next.value, next.warning satisfies W2 | UnwrapWarn<R>);
    }

    return next;
  }

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return result as TernaryErr<E2 | UnwrapErr<R>>;
};
