type Seq<N extends number> = TSTypeUtilsInternals.SeqImpl<
  MakeTuple<unknown, N>
>;

/** @internal */
declare namespace TSTypeUtilsInternals {
  type SeqImpl<T extends readonly unknown[]> = {
    readonly [i in keyof T]: i extends `${number}` ? ToNumber<i> : never;
  };
}
