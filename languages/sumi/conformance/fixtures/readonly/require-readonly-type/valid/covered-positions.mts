// Positions the codemod leaves alone (D-45): the readonly-ness comes from the
// surrounding construct.
type Head<Ar extends readonly unknown[]> = Ar extends readonly [
  infer E,
  ...unknown[],
]
  ? E
  : never;

type IsOptional<A> = [A] extends [undefined] ? true : false;

type IsNever<A> = A[] extends never[] ? true : false;

type Action<K> = Readonly<{ type: 'delete'; key: K } | { type: 'set'; key: K }>;

type Frozen<T> = Readonly<{ [K in keyof T]: T[K] }>;

// The object of an indexed access needs no `readonly` on its members, but
// the member types themselves still do (the codemod writes it this way).
type Element = { a: readonly number[] }['a'];

type Value<K extends string> = Readonly<Record<K, number>>[K];

type Items = Readonly<Array<number>>;

export type {
  Head,
  IsOptional,
  IsNever,
  Action,
  Frozen,
  Element,
  Value,
  Items,
};
