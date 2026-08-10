import { type BoolNot } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Result1 = BoolNot<true>; // false
type Result2 = BoolNot<false>; // true

// Useful in conditional types
type IsDisabled<T> =
  T extends Readonly<{ enabled: infer E }>
    ? E extends boolean
      ? BoolNot<E>
      : never
    : true;

type Test1 = IsDisabled<Readonly<{ enabled: true }>>; // false
type Test2 = IsDisabled<Readonly<{ enabled: false }>>; // true

// embed-sample-code-ignore-below
export type { IsDisabled, Result1, Result2, Test1, Test2 };
