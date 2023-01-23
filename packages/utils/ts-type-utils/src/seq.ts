import { type MakeTuple } from './make-tuple';
import { type ToNumber } from './to-number';

export type Seq<N extends number> = SeqImpl<N>;

type SeqImpl<
  N extends number,
  T extends readonly unknown[] = MakeTuple<unknown, N>
> = {
  readonly [i in keyof T]: i extends `${number}` ? ToNumber<i> : never;
};
