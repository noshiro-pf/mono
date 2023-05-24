import { Num } from '@noshiro/ts-utils';

export const isPositiveSafeInteger = (
  n: number
): n is IntersectBrand<NonZeroSafeIntBrand, SafeUintBrand> =>
  Number.isSafeInteger(n) && Num.isNonNegative(n) && Num.isNonZero(n);
