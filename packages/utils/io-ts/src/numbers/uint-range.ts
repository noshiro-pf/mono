import { isNumber, Num } from '@noshiro/ts-utils';
import type { Type } from '../type';

export const uintRange = <Max extends Seq<100>, Min extends Seq<Max>>(
  min: Min,
  max: Max,
  defaultValue: UintRange<Min, Max>
): Type<UintRange<Min, Max>> => {
  const is = (a: unknown): a is UintRange<Min, Max> =>
    isNumber(a) && Num.isInt(a) && Num.isInRange(min, max)(a);

  const fill = (value: unknown): UintRange<Min, Max> =>
    is(value) ? value : defaultValue;

  return { defaultValue, is, fill };
};
