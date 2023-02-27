type WidenLiteral<T> = T extends string
  ? string
  : T extends number
  ? number
  : T extends boolean
  ? boolean
  : T extends bigint
  ? bigint
  : T extends symbol
  ? symbol
  : T;

type UintRange<Min extends number, Max extends number> = Exclude<
  _UintRangeImpl.SeqPlus1<Max>,
  _UintRangeImpl.Index<Min>
>;

namespace _UintRangeImpl {
  export type SeqPlus1<N extends number> = IndexOfTuple<
    readonly [...MakeTuple<unknown, N>, unknown]
  >;

  export type Index<N extends number> = IndexOfTuple<MakeTuple<unknown, N>>;

  type MakeTuple<T, N extends number> = _MakeTupleInternals.MakeTupleImpl<
    T,
    `${N}`
  >;

  /** @internal */
  namespace _MakeTupleInternals {
    /** @internal */
    type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

    /** @internal */
    type Tail<T extends string> = T extends `${Digit}${infer U}` ? U : never;

    /** @internal */
    type First<T extends string> = T extends `${infer U}${Tail<T>}` ? U : never;

    /** @internal */
    type DigitStr = `${Digit}`;

    /** @internal */
    type Tile<
      T extends readonly unknown[],
      N extends Digit | DigitStr | '10' | 10
    > = readonly [
      readonly [],
      readonly [...T],
      readonly [...T, ...T],
      readonly [...T, ...T, ...T],
      readonly [...T, ...T, ...T, ...T],
      readonly [...T, ...T, ...T, ...T, ...T],
      readonly [...T, ...T, ...T, ...T, ...T, ...T],
      readonly [...T, ...T, ...T, ...T, ...T, ...T, ...T],
      readonly [...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T],
      readonly [...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T],
      readonly [...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T]
    ][N];

    /** @internal */
    export type MakeTupleImpl<
      T,
      N extends string,
      X extends readonly unknown[] = readonly []
    > = string extends N
      ? never
      : N extends ''
      ? X
      : First<N> extends infer U
      ? U extends DigitStr
        ? MakeTupleImpl<
            T,
            Tail<N>,
            readonly [...Tile<readonly [T], U>, ...Tile<X, 10>]
          >
        : never
      : never;
  }

  type ToNumber<S extends `${number}`> = S extends `${infer N extends number}`
    ? N
    : never;

  type IsFixedLengthList<T extends readonly unknown[]> =
    number extends T['length'] ? false : true;

  type IndexOfTuple<
    T extends readonly unknown[],
    K = keyof T
  > = IsFixedLengthList<T> extends true
    ? K extends keyof T
      ? K extends `${number}`
        ? ToNumber<K>
        : never
      : never
    : number;
}
