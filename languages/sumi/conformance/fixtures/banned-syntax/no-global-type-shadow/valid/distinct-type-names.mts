type Items = readonly number[];

interface Deferred<T> {
  readonly value: T;
}

export const wrap = <Value,>(value: Value): Value => value;

export type { Items, Deferred };
