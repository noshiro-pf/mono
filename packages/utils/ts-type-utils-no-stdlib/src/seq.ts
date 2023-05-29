import { type MakeTuple } from './make-tuple';
import { type ToNumber } from './to-number';

export type Seq<N extends number> = _SeqImpl<N>;

/** @internal */
type _SeqImpl<
  N extends number,
  T extends readonly unknown[] = MakeTuple<unknown, N>
> = {
  readonly [i in keyof T]: i extends `${number}` ? ToNumber<i> : never;
};
