import { type Primitive } from '../src';

export type _DeepReadonly<T> = T extends Primitive
  ? T
  : T extends (...args: readonly never[]) => unknown
    ? T
    : // eslint-disable-next-line @typescript-eslint/ban-types
      T extends object | readonly unknown[]
      ? {
          readonly [K in keyof T]: _DeepReadonly<T[K]>;
        }
      : T;
