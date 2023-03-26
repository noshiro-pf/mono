import { Num } from '@noshiro/ts-utils';

export const isPositiveInteger = (n: number): boolean => n >= 1 && Num.isInt(n);
