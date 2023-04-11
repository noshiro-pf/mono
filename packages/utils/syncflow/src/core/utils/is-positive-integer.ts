import { Num } from '@noshiro/ts-utils';

export const isPositiveSafeInteger = (
  n: number
): n is NonZeroSafeInt & SafeUint =>
  Number.isSafeInteger(n) && Num.isNonNegative(n) && Num.isNonZero(n);
