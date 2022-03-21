import type { Primitive } from './utils';

export type DeepReadonly<T> = T extends Primitive
  ? T
  : // eslint-disable-next-line @typescript-eslint/ban-types
  T extends Function
  ? T
  : T extends Map<infer K, infer V>
  ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
  : T extends Set<infer V>
  ? ReadonlySet<DeepReadonly<V>>
  : // eslint-disable-next-line @typescript-eslint/ban-types
  T extends object | readonly unknown[]
  ? {
      readonly [K in keyof T]: DeepReadonly<T[K]>;
    }
  : T;

export type DeepWritable<T> = T extends Primitive
  ? T
  : // eslint-disable-next-line @typescript-eslint/ban-types
  T extends Function
  ? T
  : T extends Map<infer K, infer V>
  ? Map<DeepWritable<K>, DeepWritable<V>>
  : T extends Set<infer V>
  ? Set<DeepWritable<V>>
  : // eslint-disable-next-line @typescript-eslint/ban-types
  T extends object | readonly unknown[]
  ? {
      -readonly [K in keyof T]: DeepWritable<T[K]>;
    }
  : T;

export type DeepPartial<T> = T extends Primitive
  ? T
  : // eslint-disable-next-line @typescript-eslint/ban-types
  T extends Function
  ? T
  : T extends Map<infer K, infer V>
  ? ReadonlyMap<DeepPartial<K>, DeepPartial<V>>
  : T extends Set<infer V>
  ? ReadonlySet<DeepPartial<V>>
  : // eslint-disable-next-line @typescript-eslint/ban-types
  T extends object | readonly unknown[]
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : T;
