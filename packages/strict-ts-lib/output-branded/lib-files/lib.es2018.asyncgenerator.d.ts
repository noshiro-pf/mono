/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

/// <reference path="./lib.es2018.asynciterable.d.ts" />

interface AsyncGenerator<T = unknown, TReturn = any, TNext = unknown>
  extends AsyncIterator<T, TReturn, TNext> {
  // NOTE: 'next' is defined using a tuple to ensure we report the correct assignability errors in all places.
  next(
    ...args: readonly [] | readonly [TNext]
  ): Promise<IteratorResult<T, TReturn>>;
  return(
    value: TReturn | PromiseLike<TReturn>,
  ): Promise<IteratorResult<T, TReturn>>;
  throw(e: unknown): Promise<IteratorResult<T, TReturn>>;
  [Symbol.asyncIterator](): AsyncGenerator<T, TReturn, TNext>;
}

interface AsyncGeneratorFunction {
  /**
   * Creates a new AsyncGenerator object.
   *
   * @param args A list of arguments the function accepts.
   */
  new (...args: readonly unknown[]): AsyncGenerator;
  /**
   * Creates a new AsyncGenerator object.
   *
   * @param args A list of arguments the function accepts.
   */
  (...args: readonly unknown[]): AsyncGenerator;
  /** The length of the arguments. */
  readonly length: number;
  /** Returns the name of the function. */
  readonly name: string;
  /** A reference to the prototype. */
  readonly prototype: AsyncGenerator;
}

interface AsyncGeneratorFunctionConstructor {
  /**
   * Creates a new AsyncGenerator function.
   *
   * @param args A list of arguments the function accepts.
   */
  new (...args: readonly string[]): AsyncGeneratorFunction;
  /**
   * Creates a new AsyncGenerator function.
   *
   * @param args A list of arguments the function accepts.
   */
  (...args: readonly string[]): AsyncGeneratorFunction;
  /** The length of the arguments. */
  readonly length: number;
  /** Returns the name of the function. */
  readonly name: string;
  /** A reference to the prototype. */
  readonly prototype: AsyncGeneratorFunction;
}