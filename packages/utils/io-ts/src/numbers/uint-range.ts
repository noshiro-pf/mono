import { isNumber, Num } from '@noshiro/ts-utils';
import type { Type } from '../type';

type UintRange<Min extends number, Max extends number> =
  | Max
  | RelaxedExclude<Seq<Max>, Seq<Min>>;

export const uintRange = <
  Max extends Seq<100>,
  Min extends Seq<Max>,
  D extends UintRange<Min, Max>
>(
  min: Min,
  max: Max,
  defaultValue: D
): Type<UintRange<Min, Max>, D> => {
  const is = (a: unknown): a is UintRange<Min, Max> =>
    isNumber(a) && Num.isInt(a) && Num.isInRange(min, max)(a);

  const fill = (value: unknown): UintRange<Min, Max> =>
    is(value) ? value : defaultValue;

  return { defaultValue, is, fill };
};
