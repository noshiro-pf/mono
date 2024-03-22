/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils-no-stdlib" />

/** @internal */
type ToObjectKeysValue<A> = A extends string
  ? A
  : A extends number
    ? `${A}`
    : never;

/** @internal */
type PickByValue<R, V> = Pick<
  R,
  {
    [K in keyof R]: R[K] extends V ? K : never;
  }[keyof R]
>;

/** @internal */
type _RecordUtilsEntries<R extends RecordBase> = R extends R
  ? readonly {
      readonly [K in keyof R]: readonly [
        ToObjectKeysValue<keyof PickByValue<R, R[K]>>,
        R[K],
      ];
      // eslint-disable-next-line @typescript-eslint/ban-types
    }[RelaxedExclude<keyof R, symbol>][]
  : never;

interface ObjectConstructor {
  /**
   * Returns an array of values of the enumerable properties of an object
   *
   * @param o Object that contains the properties and methods. This can be an
   *   object that you created or an existing Document Object Model (DOM)
   *   object.
   */
  values<T>(o: { readonly [s: string]: T } | ArrayLike<T>): readonly T[];

  /**
   * Returns an array of values of the enumerable properties of an object
   *
   * @param o Object that contains the properties and methods. This can be an
   *   object that you created or an existing Document Object Model (DOM)
   *   object.
   */
  values(o: {}): readonly unknown[];

  /**
   * Returns an array of key/values of the enumerable properties of an object
   *
   * ```ts
   * const obj = {
   *   x: 1,
   *   y: 2,
   *   z: 2,
   *   3: 4,
   * } as const;
   *
   * const entries = Object.entries(obj); // (['3', 4] | ['x', 1] | ['y' | 'z', 2])[]
   * ```
   *
   * @param o Object that contains the properties and methods. This can be an
   *   object that you created or an existing Document Object Model (DOM)
   *   object.
   */
  entries<R extends RecordBase>(object: R): _RecordUtilsEntries<R>;

  /**
   * Returns an array of key/values of the enumerable properties of an object
   *
   * @param o Object that contains the properties and methods. This can be an
   *   object that you created or an existing Document Object Model (DOM)
   *   object.
   */
  entries(o: {}): readonly (readonly [string, unknown])[];

  /**
   * Returns an object containing all own property descriptors of an object
   *
   * @param o Object that contains the properties and methods. This can be an
   *   object that you created or an existing Document Object Model (DOM)
   *   object.
   */
  getOwnPropertyDescriptors<T>(o: T): {
    readonly [P in keyof T]: TypedPropertyDescriptor<T[P]>;
  } & {
    readonly [x: string]: PropertyDescriptor;
  };
}
