/* eslint-disable ts-data-forge/prefer-arr-is-array-of-length */
/* eslint-disable ts-data-forge/prefer-arr-is-array */

import { isMap, isRegExp, isSet, isTypedArray } from '@sindresorhus/is';
import { hasKey, isRecord } from '../guard/index.mjs';

/**
 * The fastest deep equal with ES6 Map, Set and Typed arrays support.
 * Checks equality of Date and RegExp objects by value.
 *
 * Forked from https://github.com/epoberezkin/fast-deep-equal/blob/v3.1.3/src/index.jst
 */
export const fastDeepEqual = <T,>(a: T, b: T): boolean => {
  if (a === b) {
    return true;
  }

  if (typeof a !== typeof b) {
    return false;
  }

  if (isRecord(a)) {
    if (!isRecord(b)) {
      return false;
    }

    if (a.constructor !== b.constructor) {
      return false;
    }

    if (Array.isArray(a)) {
      return (
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((ai, index) => fastDeepEqual(ai, b[index]))
      );
    }

    if (isMap(a)) {
      return (
        isMap(b) &&
        a.size === b.size &&
        Array.from(a.entries()).every(
          ([key, value]) => b.has(key) && fastDeepEqual(value, b.get(key)),
        )
      );
    }

    if (isSet(a)) {
      return (
        isSet(b) &&
        a.size === b.size &&
        Array.from(a.entries()).every(([value]) => b.has(value))
      );
    }

    if (isTypedArray(a)) {
      return (
        isTypedArray(b) &&
        a.length === b.length &&
        a.every((value, index) => value === b[index])
      );
    }

    if (isRegExp(a)) {
      return isRegExp(b) && a.source === b.source && a.flags === b.flags;
    }

    if (a.valueOf !== Object.prototype.valueOf) {
      return a.valueOf() === b.valueOf();
    }

    if (a.toString !== Object.prototype.toString) {
      return a.toString() === b.toString();
    }

    const aKeys: readonly string[] = Object.keys(a);

    const bKeys: readonly string[] = Object.keys(b);

    return (
      aKeys.length === bKeys.length &&
      aKeys.every(
        (key) =>
          hasKey(b, key) &&
          // React-specific: avoid traversing React elements' _owner.
          //  _owner contains circular references
          // and is not needed when comparing the actual elements (and not their owners)
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          !(key === '_owner' && a['$$typeof']) &&
          fastDeepEqual(a[key], b[key]),
      )
    );
  }

  // true if both NaN, false otherwise
  return Number.isNaN(a) && Number.isNaN(b);
};
