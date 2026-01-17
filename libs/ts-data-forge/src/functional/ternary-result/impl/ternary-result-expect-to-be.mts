import { isOk } from './ternary-result-is-ok.mjs';
import { unwrapOk } from './ternary-result-unwrap-ok.mjs';
import { type UnwrapOk } from './types.mjs';

/**
 * Unwraps the Ok value or throws with the provided message.
 *
 * @example
 *
 * ```ts
 * const okValue = TernaryResult.ok('ready');
 *
 * assert.strictEqual(TernaryResult.expectToBe(okValue, 'missing'), 'ready');
 *
 * const expectResult = TernaryResult.expectToBe<string>('needs value');
 *
 * assert.throws(
 *   () => expectResult(TernaryResult.err('oops')),
 *   /needs value/u,
 * );
 * ```
 */
export function expectToBe<R extends UnknownTernaryResult>(
  result: R,
  message: string,
): UnwrapOk<R>;

// Curried version
export function expectToBe<S>(
  message: string,
): <W, E>(result: TernaryResult<S, E, W>) => S;

export function expectToBe<R extends UnknownTernaryResult>(
  ...args: readonly [result: R, message: string] | readonly [message: string]
): UnwrapOk<R> | ((result: R) => UnwrapOk<R>) {
  switch (args.length) {
    case 2: {
      const [result, message] = args;

      return expectImpl(result, message);
    }

    case 1: {
      const [message] = args;

      return (result: R) => expectImpl(result, message);
    }
  }
}

const expectImpl = <R extends UnknownTernaryResult>(
  result: R,
  message: string,
): UnwrapOk<R> => {
  if (isOk(result)) {
    return unwrapOk(result);
  }

  throw new Error(message);
};
