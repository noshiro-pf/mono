/* eslint-disable no-restricted-globals */
/**
 * The definitions in this file are designed to avoid eslint warnings.
 */

/**
 * Returns true if the values are the same value, false otherwise.
 * @param value1 The first value.
 * @param value2 The second value.
 */
export const objectIs: (value1: unknown, value2: unknown) => boolean =
  Object.is;

export const toBoolean: (value: unknown) => boolean = Boolean;

export class MutableMap<K, V> extends Map<K, V> {}

export class MutableSet<K> extends Set<K> {}
