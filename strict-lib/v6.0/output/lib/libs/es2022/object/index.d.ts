/// <reference lib="es5" />
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABILITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

/*
 * Modified from TypeScript's `lib.es2022.object.d.ts` by strict-ts-lib
 * (https://github.com/noshiro-pf/mono): the declarations are rewritten with
 * stricter types. This is not the original file. See the NOTICE and LICENSE
 * files of the package this ships in.
 */

/**
 * @internal
 * R が union 型（要素数1の場合も含む）のとき、 union の要素の中に K をキーとして含むものが一つでもあれば、
 * union 型を K をキーとして含むもののみに絞った型を返す。
 * union の要素の中に K をキーとして含むものが一つも無ければ、`MutableRecord<K, unknown>` を返す。
 * 結果には Readonly を付ける。
 */
declare namespace StrictLibInternals {
  export type HasOwnReturnType<
    R extends import('ts-type-forge').UnknownRecord,
    K extends PropertyKey,
  > = R extends R // union distribution
    ? K extends keyof R
      ? string extends keyof R
        ? import('ts-type-forge').MutableRecord<K, R[keyof R]> & R
        : number extends keyof R
          ? import('ts-type-forge').MutableRecord<K, R[keyof R]> & R
          : symbol extends keyof R
            ? import('ts-type-forge').MutableRecord<K, R[keyof R]> & R
            : R
      : never // omit union member that does not have key K
    : never; // dummy case for union distribution
}

interface ObjectConstructor {
  /**
   * Determines whether an object has a property with the specified name.
   * @param obj An object.
   * @param key A property name.
   */
  hasOwn<
    R extends import('ts-type-forge').UnknownRecord,
    K extends PropertyKey,
  >(
    obj: R,
    key: K,
  ): obj is StrictLibInternals.HasOwnReturnType<R, K>;
}
