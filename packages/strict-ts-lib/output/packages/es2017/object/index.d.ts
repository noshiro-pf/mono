/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

declare namespace StrictLibInternals {
  /** @internal */
  type ToObjectKeys<R extends UnknownRecord> = ToStr<keyof R> | (string & {});

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
  type ToObjectEntries<R extends UnknownRecord> = R extends R
    ? (
        | readonly [string & {}, WidenLiteral<ValueOf<R>>]
        | {
            [K in keyof R]: readonly [ToStr<keyof PickByValue<R, R[K]>>, R[K]];
            // eslint-disable-next-line @typescript-eslint/no-restricted-types
          }[RelaxedExclude<keyof R, symbol>]
      )[]
    : never;
}

interface ObjectConstructor {
  /**
   * Returns an array of values of the enumerable own properties of an object
   *
   * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.
   */
  values<T>(o: { readonly [s: string]: T } | ArrayLike<T>): T[];

  /**
   * Returns an array of values of the enumerable own properties of an object
   *
   * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.
   */
  values(o: {}): unknown[];

  /**
   * Returns an array of key/values of the enumerable own properties of an object
   *
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
  entries<const R extends UnknownRecord>(
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
   *
   * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.
   */
  entries(o: {}): (readonly [string, unknown])[];

  /**
   * Returns an object containing all own property descriptors of an object
   *
   * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.
   */
  getOwnPropertyDescriptors<T>(o: T): {
    [P in keyof T]: TypedPropertyDescriptor<T[P]>;
  } & {
    [x: string]: PropertyDescriptor;
  };
}
