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

/*
 * Modified from TypeScript's `lib.es2022.object.d.ts` by strict-ts-lib
 * (https://github.com/noshiro-pf/mono): the declarations are rewritten with
 * stricter types. This is not the original file. See the NOTICE and LICENSE
 * files of the package this ships in.
 */

/// <reference no-default-lib="true"/>
/// <reference lib="es5" />

declare namespace StrictLibInternals {
  /**
   * @internal
   * The key with which `Object.hasOwn(obj, key)` narrows an `obj` of type `R`
   * where it returns `true`, or `never` where it narrows nothing.
   *
   * A type predicate narrows both ways, but `Object.hasOwn` returning `false`
   * says only that `obj` has no *own* property `key`: a type does not tell an
   * own property from an inherited one (a class's getter), and a value may
   * have properties its type does not name. So no member of `R` may be
   * removed where it returns `false`, which holds when no member of `R` is
   * assignable to the narrowed type: `K` must be one literal key (not a union,
   * not `string`, `number`, `symbol` or a template literal pattern) that no
   * member of `R` declares as required.
   */
  export type HasOwnNarrowableKey<
    R,
    K extends PropertyKey,
  > = import('ts-type-forge').IsUnion<K> extends true
    ? never
    : // A property is optional in the first and required in the second only
      // where `K` is a literal. Where `K` is `string`, `number`, `symbol`, a
      // template literal pattern or `never`, both are the same index signature,
      // or no property at all.
      Partial<{ [P in K]: unknown }> extends { [P in K]: unknown }
      ? never
      : true extends (R extends { readonly [P in K]: unknown } ? true : false)
        ? never
        : K;

  /**
   * @internal
   * What `Object.hasOwn(obj, key)` narrows an `obj` of type `R` to where it
   * returns `true`: each member of `R` with the property `K`, typed as that
   * member declares it, or `unknown`.
   */
  export type HasOwnReturnType<R, K extends PropertyKey> = R extends unknown // union distribution
    ? R & { readonly [P in K]: P extends keyof R ? R[P] : unknown }
    : never;
}

interface ObjectConstructor {
  /**
   * Determines whether an object has a property with the specified name.
   * @param obj An object.
   * @param key A property name.
   */
  hasOwn<R extends object, K extends PropertyKey>(
    obj: R,
    key: K & StrictLibInternals.HasOwnNarrowableKey<R, K>,
  ): obj is StrictLibInternals.HasOwnReturnType<R, K>;

  /**
   * Determines whether an object has a property with the specified name.
   * @param obj An object.
   * @param key A property name.
   */
  hasOwn(obj: object, key: PropertyKey): boolean;
}
