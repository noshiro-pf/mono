/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

/// <reference path="./lib.es2015.iterable.d.ts" />

interface Generator<T = unknown, TReturn = any, TNext = unknown>
  extends IteratorObject<T, TReturn, TNext> {
  // NOTE: 'next' is defined using a tuple to ensure we report the correct assignability errors in all places.
  next(...[value]: readonly [] | readonly [TNext]): IteratorResult<T, TReturn>;
  return(value: TReturn): IteratorResult<T, TReturn>;
  throw(e: unknown): IteratorResult<T, TReturn>;
  [Symbol.iterator](): Generator<T, TReturn, TNext>;
}

interface GeneratorFunction {
  /**
   * Creates a new Generator object.
   *
   * @param args A list of arguments the function accepts.
   */
  new (...args: readonly unknown[]): Generator;
  /**
   * Creates a new Generator object.
   *
   * @param args A list of arguments the function accepts.
   */
  (...args: readonly unknown[]): Generator;
  /** The length of the arguments. */
  readonly length: NumberType.ArraySize;
  /** Returns the name of the function. */
  readonly name: string;
  /** A reference to the prototype. */
  readonly prototype: Generator;
}

interface GeneratorFunctionConstructor {
  /**
   * Creates a new Generator function.
   *
   * @param args A list of arguments the function accepts.
   */
  new (...args: readonly string[]): GeneratorFunction;
  /**
   * Creates a new Generator function.
   *
   * @param args A list of arguments the function accepts.
   */
  (...args: readonly string[]): GeneratorFunction;
  /** The length of the arguments. */
  readonly length: NumberType.ArraySize;
  /** Returns the name of the function. */
  readonly name: string;
  /** A reference to the prototype. */
  readonly prototype: GeneratorFunction;
}
