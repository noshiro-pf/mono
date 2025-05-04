export type DeepReadonly_<T> = T extends Primitive
  ? T
  : T extends (...args: readonly never[]) => unknown
    ? T
    : T extends object | readonly unknown[]
      ? {
          readonly [K in keyof T]: DeepReadonly_<T[K]>;
        }
      : T;
