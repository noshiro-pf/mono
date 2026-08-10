import { Result } from '../functional/index.mjs';

/**
 * Creates a Promise that wraps the result in a Result type for type-safe error
 * handling. This function is an alternative to `new Promise(executor)` that
 * provides enhanced type safety by returning a Result type instead of throwing
 * exceptions.
 *
 * @example
 *
 * ```ts
 * // Create a promise that resolves successfully
 * const successPromise = createPromise<number, string>((resolve) => {
 *   setTimeout(() => {
 *     resolve(42);
 *   }, 0);
 * });
 *
 * const successResult = await successPromise;
 *
 * assert.isTrue(Result.isOk(successResult));
 *
 * if (Result.isOk(successResult)) {
 *   assert.isTrue(successResult.value === 42);
 * }
 *
 * // Create a promise that rejects with an error
 * const errorPromise = createPromise<number, string>((_, reject) => {
 *   setTimeout(() => {
 *     reject('Something went wrong');
 *   }, 0);
 * });
 *
 * const errorResult = await errorPromise;
 *
 * assert.isTrue(Result.isErr(errorResult));
 *
 * if (Result.isErr(errorResult)) {
 *   assert.isTrue(errorResult.value === 'Something went wrong');
 * }
 * ```
 *
 * @template S - The type of successful value
 * @template E - The type of error value
 * @param executor - Function that takes resolve and reject callbacks
 * @returns A Promise that resolves to a Result containing either success or
 *   error
 */
export const createPromise = <S, E>(
  executor: (resolve: (value: S) => void, reject: (reason?: E) => void) => void,
): Promise<Result<S, E>> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  Result.fromPromise(new Promise<S>(executor)) satisfies Promise<
    Result<S, unknown>
  > as Promise<Result<S, E>>;
