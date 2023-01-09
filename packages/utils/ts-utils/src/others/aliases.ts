/* eslint-disable no-restricted-globals */
/**
 * The definitions in this file are designed to avoid eslint warnings.
 */

export const toBoolean: (value: unknown) => boolean = Boolean;

export class MutableMap<K, V> extends Map<K, V> {}

export class MutableSet<K> extends Set<K> {}
