/** Extract from T those types that are assignable to U */
type StrictExtract<T, U extends T> = T extends U ? T : never;

/** Extract from T those types that are assignable to U */
type RelaxedExtract<T, U> = T extends U ? T : never;

/** From T, pick a set of properties whose keys are in the union K */
type StrictPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

/** From T, pick a set of properties whose keys are in the union K */
type RelaxedPick<T, K> = Pick<T, RelaxedExtract<keyof T, K>>;

/** Exclude from T those types that are assignable to U */
type StrictExclude<T, U extends T> = T extends U ? never : T;

/** Exclude from T those types that are assignable to U */
type RelaxedExclude<T, U> = T extends U ? never : T;

/** Construct a type with the properties of T except for those in type K. */
type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/** Construct a type with the properties of T except for those in type K. */
type RelaxedOmit<T, K> = Pick<T, RelaxedExclude<keyof T, K>>;

/** Construct a type with a set of properties K of type T */
// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
type ReadonlyRecord<K extends PropertyKey, T> = {
  readonly [P in K]: T;
};

/** Construct a type with a set of properties K of type T */
// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
type MutableRecord<K extends PropertyKey, T> = {
  [P in K]: T;
};
