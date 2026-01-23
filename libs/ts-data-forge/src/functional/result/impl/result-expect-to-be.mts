import { isOk } from './result-is-ok.mjs';
import { unwrapOk } from './result-unwrap-ok.mjs';
import { type UnwrapOk } from './types.mjs';

/**
 * Unwraps a `Result`, returning the success value or throwing an error with
 * the provided message.
 *
 * @example
 *
 * ```ts
 * const okValue = Result.ok('data');
 *
 * assert.isTrue(Result.expectToBe(okValue, 'should have value') === 'data');
 *
 * const expectResult = Result.expectToBe<string>('missing result');
 *
 * const throwTest = (): void => {
 *   expectResult(Result.err('boom'));
 * };
 *
 * assert.throws(throwTest, /missing result/u);
 *
 * assert.isTrue(expectResult(Result.ok('value')) === 'value');
 * ```
 *
 * @template R The `UnknownResult` type to unwrap.
 * @param result The `Result` to unwrap.
 * @param message The error message to throw if the `Result` is `Result.Err`.
 * @returns The success value if `Result.Ok`.
 * @throws Error with the provided message if the `Result` is `Result.Err`.
 */
export function expectToBe<R extends UnknownResult>(
  result: R,
  message: string,
): UnwrapOk<R>;

// Curried version
export function expectToBe<S>(message: string): <E>(result: Result<S, E>) => S;

export function expectToBe<R extends UnknownResult>(
  ...args: readonly [result: R, message: string] | readonly [message: string]
): UnwrapOk<R> | ((result: R) => UnwrapOk<R>) {
  switch (args.length) {
    case 2: {
      // Direct version: first argument is result
      const [result, message] = args;

      return expectToBeImpl(result, message);
    }

    case 1: {
      // Curried version: first argument is message
      const [message] = args;

      return (result: R): UnwrapOk<R> => expectToBeImpl(result, message);
    }
  }
}

const expectToBeImpl = <R extends UnknownResult>(
  result: R,
  message: string,
): UnwrapOk<R> => {
  if (isOk(result)) {
    return unwrapOk(result);
  }

  throw new Error(message);
};
