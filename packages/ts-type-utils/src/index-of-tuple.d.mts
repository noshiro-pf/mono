type IndexOfTuple<T extends readonly unknown[]> = _IndexOfTupleImpl<T, keyof T>;

/** @internal */
type _IndexOfTupleImpl<T extends readonly unknown[], K> =
  IsFixedLengthList<T> extends true
    ? K extends keyof T
      ? K extends `${number}`
        ? ToNumber<K>
        : never
      : never
    : number;

// export type IndexOfTuple<T extends readonly unknown[]> = TypeEq<
//   T,
//   readonly []
// > extends true
//   ? never
//   : TypeEq<T, []> extends true
//   ? never
//   : IsFixedLengthList<T> extends true
//   ? Exclude<Partial<ListType.ButLast<T>>['length'], undefined>
//   : SafeUint;
