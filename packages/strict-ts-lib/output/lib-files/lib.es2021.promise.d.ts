/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

interface AggregateError extends Error {
  readonly errors: readonly unknown[];
}

interface AggregateErrorConstructor {
  new (errors: Iterable<unknown>, message?: string): AggregateError;
  (errors: Iterable<unknown>, message?: string): AggregateError;
  readonly prototype: AggregateError;
}

declare const AggregateError: AggregateErrorConstructor;

/** Represents the completion of an asynchronous operation */
interface PromiseConstructor {
  /**
   * The any function returns a promise that is fulfilled by the first given promise to be fulfilled, or rejected with an AggregateError containing an array of rejection reasons if all of the given promises are rejected. It resolves all elements of the passed iterable to promises as it runs this algorithm.
   *
   * @param values An array or iterable of Promises.
   * @returns A new Promise.
   */
  any<T extends readonly unknown[] | readonly []>(
    values: T,
  ): Promise<Awaited<T[number]>>;

  /**
   * The any function returns a promise that is fulfilled by the first given promise to be fulfilled, or rejected with an AggregateError containing an array of rejection reasons if all of the given promises are rejected. It resolves all elements of the passed iterable to promises as it runs this algorithm.
   *
   * @param values An array or iterable of Promises.
   * @returns A new Promise.
   */
  any<T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>>;
}
