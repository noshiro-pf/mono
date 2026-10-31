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

  // Arrays are handled before `isRecord`, which excludes them.
  if (Array.isArray(a)) {
    return (
      Array.isArray(b) &&
      a.constructor === b.constructor &&
      a.length === b.length &&
      a.every((ai, index) => fastDeepEqual(ai, b[index]))
    );
  }

  if (isRecord(a)) {
    if (!isRecord(b)) {
      return false;
    }

    if (a.constructor !== b.constructor) {
      return false;
    }

    if (isMap(a)) {
      return (
        isMap(b) &&
        a.size === b.size &&
        a
          .entries()
          .every(
            ([key, value]) => b.has(key) && fastDeepEqual(value, b.get(key)),
          )
      );
    }

    if (isSet(a)) {
      return (
        isSet(b) &&
        a.size === b.size &&
        a.entries().every(([value]) => b.has(value))
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

    // A null-prototype object (`Object.create(null)`, `Object.groupBy`) has
    // neither method, so it falls through to the key comparison.
    if (
      typeof a.valueOf === 'function' &&
      a.valueOf !== Object.prototype.valueOf
    ) {
      return typeof b.valueOf === 'function' && a.valueOf() === b.valueOf();
    }

    if (
      typeof a.toString === 'function' &&
      a.toString !== Object.prototype.toString
    ) {
      return typeof b.toString === 'function' && a.toString() === b.toString();
    }

    const aKeys: readonly string[] = Object.keys(a);

    const bKeys: readonly string[] = Object.keys(b);

    return (
      aKeys.length === bKeys.length &&
      aKeys.every(
        (key) =>
          hasKey(b, key) &&
          // React-specific: a React element (marked by a symbol `$$typeof`)
          // has its _owner skipped, i.e. treated as equal. It holds circular
          // references and is not part of what the element renders.
          ((key === '_owner' && typeof a['$$typeof'] === 'symbol') ||
            fastDeepEqual(a[key], b[key])),
      )
    );
  }

  // true if both NaN, false otherwise. `Number.isNaN` takes a number: called
  // with anything else it is always false, so the check belongs behind a
  // `typeof` guard rather than relying on that.
  return (
    typeof a === 'number' &&
    typeof b === 'number' &&
    Number.isNaN(a) &&
    Number.isNaN(b)
  );
};
