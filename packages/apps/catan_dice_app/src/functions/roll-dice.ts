import { Num } from '@noshiro/ts-utils';

export const rollTwoDices = (): [number, number] => [
  Num.randInt(1, 6),
  Num.randInt(1, 6),
];
