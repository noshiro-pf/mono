/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

interface ArrayConstructor {
  /**
   * Creates an array from an async iterator or iterable object.
   *
   * @param iterableOrArrayLike An async iterator or array-like object to convert to an array.
   */
  fromAsync<T>(
    iterableOrArrayLike:
      | AsyncIterable<T>
      | Iterable<T | PromiseLike<T>>
      | ArrayLike<T | PromiseLike<T>>,
  ): Promise<readonly T[]>;

  /**
   * Creates an array from an async iterator or iterable object.
   *
   * @param iterableOrArrayLike An async iterator or array-like object to convert to an array.
   * @param mapfn A mapping function to call on every element of itarableOrArrayLike. Each return value is awaited before being added to result array.
   * @param thisArg Value of 'this' used when executing mapfn.
   */
  fromAsync<T, U>(
    iterableOrArrayLike: AsyncIterable<T> | Iterable<T> | ArrayLike<T>,
    mapFn: (value: Awaited<T>, index: NumberType.ArraySize) => U,
    thisArg?: unknown,
  ): Promise<readonly Awaited<U>[]>;
}
