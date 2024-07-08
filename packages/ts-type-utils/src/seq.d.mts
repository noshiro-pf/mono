type Seq<N extends number> = _SeqImpl<MakeTuple<unknown, N>>;

/** @internal */
type _SeqImpl<T extends readonly unknown[]> = {
  readonly [i in keyof T]: i extends `${number}` ? ToNumber<i> : never;
};
