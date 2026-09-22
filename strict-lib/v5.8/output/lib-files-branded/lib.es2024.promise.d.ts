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
 * Modified from TypeScript's `lib.es2024.promise.d.ts` by strict-ts-lib
 * (https://github.com/noshiro-pf/mono): the declarations are rewritten with
 * stricter types. This is not the original file. See the NOTICE and LICENSE
 * files of the package this ships in.
 */

/// <reference no-default-lib="true"/>

interface PromiseWithResolvers<T> {
  readonly promise: Promise<T>;
  readonly resolve: (value: T | PromiseLike<T>) => void;
  readonly reject: (reason?: unknown) => void;
}

interface PromiseConstructor {
  /**
   * Creates a new Promise and returns it in an object, along with its resolve and reject functions.
   * @returns An object with the properties `promise`, `resolve`, and `reject`.
   *
   * ```ts
   * const { promise, resolve, reject } = Promise.withResolvers<T>();
   * ```
   */
  withResolvers<T>(): PromiseWithResolvers<T>;
}
