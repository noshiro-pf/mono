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
/// <reference path="./lib.es5.d.ts" />

/**
 * @internal
 * O が union 型（要素数1の場合も含む）のとき、 union の要素の中に K をキーとして含むものが一つでもあれば、
 * union 型を K をキーとして含むもののみに絞った型を返す。
 * union の要素の中に K をキーとして含むものが一つも無ければ、`Record<K, unknown>` を返す。
 * 結果には Readonly を付ける。
 */
type _HasOwnReturnType<
  R extends RecordBase,
  K extends PropertyKey,
> = R extends R // union distribution
  ? K extends keyof R
    ? string extends keyof R
      ? Record<K, R[keyof R]> & R
      : number extends keyof R
        ? Record<K, R[keyof R]> & R
        : symbol extends keyof R
          ? Record<K, R[keyof R]> & R
          : R
    : never // omit union member that does not have key K
  : never; // dummy case for union distribution

interface ObjectConstructor {
  /**
   * Determines whether an object has a property with the specified name.
   *
   * @param obj An object.
   * @param key A property name.
   */
  hasOwn<R extends RecordBase, K extends PropertyKey>(
    obj: R,
    key: K,
  ): obj is _HasOwnReturnType<R, K>;
}
