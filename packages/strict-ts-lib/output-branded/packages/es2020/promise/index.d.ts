/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

interface PromiseFulfilledResult<T> {
  readonly status: 'fulfilled';
  readonly value: T;
}

interface PromiseRejectedResult {
  readonly status: 'rejected';
  readonly reason: unknown;
}

type PromiseSettledResult<T> =
  | PromiseFulfilledResult<T>
  | PromiseRejectedResult;

interface PromiseConstructor {
  /**
   * Creates a Promise that is resolved with an array of results when all of the
   * provided Promises resolve or reject.
   *
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  allSettled<T extends readonly unknown[] | readonly []>(
    values: T,
  ): Promise<{ -readonly [P in keyof T]: PromiseSettledResult<Awaited<T[P]>> }>;

  /**
   * Creates a Promise that is resolved with an array of results when all of the
   * provided Promises resolve or reject.
   *
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  allSettled<T>(
    values: Iterable<T | PromiseLike<T>>,
  ): Promise<readonly PromiseSettledResult<Awaited<T>>[]>;
}
