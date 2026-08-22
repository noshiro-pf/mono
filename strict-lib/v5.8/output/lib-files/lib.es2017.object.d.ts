/// <reference no-default-lib="true"/>

declare namespace StrictLibInternals {
  /**
   * Opens a union of string literals so that it still accepts — and
   * completes to — the literals, without rejecting the excess keys a
   * wider object may carry.
   *
   * Adds nothing when `K` already contains `string`: `string | (string & {})`
   * *is* `string`, so the arm would only leave a confusing artifact in
   * every type computed from it.
   *
   * @internal
   */
  type WithOpenString<K> = string extends K ? K : K | (string & {});

  /** @internal */
  type ToObjectKeys<R extends import('ts-type-forge').UnknownRecord> =
    WithOpenString<ToStr<keyof R>>;

  /** @internal */
  type ToStr<A> = A extends string ? A : A extends number ? `${A}` : never;

  /** @internal */
  type PickByValue<R, V> = Pick<
    R,
    {
      [K in keyof R]: R[K] extends V ? K : never;
    }[keyof R]
  >;

  /** @internal */
  type ToObjectEntries<R extends import('ts-type-forge').UnknownRecord> =
    R extends R
      ? (
          | (string extends ToStr<keyof R>
              ? never
              : readonly [
                  string & {},
                  import('ts-type-forge').WidenLiteral<
                    import('ts-type-forge').ValueOf<R>
                  >,
                ])
          | {
              [K in keyof R]: readonly [
                ToStr<keyof PickByValue<R, R[K]>>,
                R[K],
              ];
              // eslint-disable-next-line @typescript-eslint/no-restricted-types
            }[import('ts-type-forge').RelaxedExclude<keyof R, symbol>]
        )[]
      : never;
}

interface ObjectConstructor {
  /**
   * Returns an array of values of the enumerable own properties of an object
   * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.
   */
  values<T>(o: { readonly [s: string]: T } | ArrayLike<T>): T[];

  /**
   * Returns an array of values of the enumerable own properties of an object
   * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.
   */
  values(o: {}): unknown[];

  /**
   * Returns an array of key/values of the enumerable own properties of an object
   * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.
   *
   * ```ts
   * const obj = {
   *   x: 1,
   *   y: 2,
   *   z: 2,
   *   3: 4,
   * } as const;
   *
   * const entries = Object.entries(obj); // (['3', 4] | ['x', 1] | ['y' | 'z', 2] | [string, unknown])[]
   * ```
   *
   */
  entries<const R extends import('ts-type-forge').UnknownRecord>(
    object: R,
  ): StrictLibInternals.ToObjectEntries<R>;

  /**
   * Returns an array of key/values of the enumerable own properties of an
   * object
   *
   * @param o Object that contains the properties and methods. This can be an
   *   object that you created or an existing Document Object Model (DOM)
   *   object.
   */
  entries<T>(
    o: { readonly [s: string]: T } | ArrayLike<T>,
  ): (readonly [string, T])[];

  /**
   * Returns an array of key/values of the enumerable own properties of an object
   * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.
   */
  entries(o: {}): (readonly [string, unknown])[];

  /**
   * Returns an object containing all own property descriptors of an object
   * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.
   */
  getOwnPropertyDescriptors<T>(o: T): {
    [P in keyof T]: TypedPropertyDescriptor<T[P]>;
  } & {
    [x: string]: PropertyDescriptor;
  };
}
