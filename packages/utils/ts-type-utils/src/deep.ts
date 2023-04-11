import { type MutableMap, type MutableSet } from './aliases';

export type DeepReadonly<T> = T extends Primitive
  ? T
  : // eslint-disable-next-line @typescript-eslint/ban-types,no-restricted-globals
  T extends Function
  ? T
  : T extends MutableMap<infer K, infer V>
  ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
  : T extends MutableSet<infer V>
  ? ReadonlySet<DeepReadonly<V>>
  : // eslint-disable-next-line @typescript-eslint/ban-types
  T extends object | readonly unknown[]
  ? {
      readonly [K in keyof T]: DeepReadonly<T[K]>;
    }
  : T;

export type DeepWritable<T> = T extends Primitive
  ? T
  : // eslint-disable-next-line @typescript-eslint/ban-types,no-restricted-globals
  T extends Function
  ? T
  : T extends ReadonlyMap<infer K, infer V>
  ? MutableMap<DeepWritable<K>, DeepWritable<V>>
  : T extends ReadonlySet<infer V>
  ? MutableSet<DeepWritable<V>>
  : // eslint-disable-next-line @typescript-eslint/ban-types
  T extends object | readonly unknown[]
  ? {
      -readonly [K in keyof T]: DeepWritable<T[K]>;
    }
  : T;

export type DeepPartial<T> = T extends Primitive
  ? T
  : // eslint-disable-next-line @typescript-eslint/ban-types,no-restricted-globals
  T extends Function
  ? T
  : T extends MutableMap<infer K, infer V>
  ? ReadonlyMap<DeepPartial<K>, DeepPartial<V>>
  : T extends MutableSet<infer V>
  ? ReadonlySet<DeepPartial<V>>
  : // eslint-disable-next-line @typescript-eslint/ban-types
  T extends object | readonly unknown[]
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : T;
