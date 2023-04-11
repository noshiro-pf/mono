/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-restricted-globals */

export type RawDateMutType = Date;

export type RawDateType = Readonly<RawDateMutType>;

export type MutableSet<K> = Set<K>;

export type MutableMap<K, V> = Map<K, V>;
