/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-restricted-globals */

export type RelaxedExclude<T, U> = Exclude<T, U>;

export type RelaxedOmit<T, K extends keyof never> = Omit<T, K>;

export type RawDateMutType = Date;

export type RawDateType = Readonly<RawDateMutType>;

export type MutableSet<K> = Set<K>;

export type MutableMap<K, V> = Map<K, V>;
