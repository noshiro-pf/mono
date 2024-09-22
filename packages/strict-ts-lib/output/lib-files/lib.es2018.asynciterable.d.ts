/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

/// <reference path="./lib.es2015.symbol.d.ts" />
/// <reference path="./lib.es2015.iterable.d.ts" />

interface SymbolConstructor {
  /**
   * A method that returns the default async iterator for an object. Called by
   * the semantics of the for-await-of statement.
   */
  readonly asyncIterator: unique symbol;
}

interface AsyncIterator<T, TReturn = any, TNext = unknown> {
  // NOTE: 'next' is defined using a tuple to ensure we report the correct assignability errors in all places.
  next(
    ...[value]: readonly [] | readonly [TNext]
  ): Promise<IteratorResult<T, TReturn>>;
  return?(
    value?: TReturn | PromiseLike<TReturn>,
  ): Promise<IteratorResult<T, TReturn>>;
  throw?(e?: unknown): Promise<IteratorResult<T, TReturn>>;
}

interface AsyncIterable<T, TReturn = any, TNext = unknown> {
  [Symbol.asyncIterator](): AsyncIterator<T, TReturn, TNext>;
}

/** Describes a user-defined {@link AsyncIterator} that is also async iterable. */
interface AsyncIterableIterator<T, TReturn = any, TNext = unknown>
  extends AsyncIterator<T, TReturn, TNext> {
  [Symbol.asyncIterator](): AsyncIterableIterator<T, TReturn, TNext>;
}

/**
 * Describes an {@link AsyncIterator} produced by the runtime that inherits from
 * the intrinsic `AsyncIterator.prototype`.
 */
interface AsyncIteratorObject<T, TReturn = any, TNext = unknown>
  extends AsyncIterator<T, TReturn, TNext> {
  [Symbol.asyncIterator](): AsyncIteratorObject<T, TReturn, TNext>;
}
