import { Num } from '@noshiro/ts-utils';

export const hexStrToNumber = (hexStr: string): number | undefined =>
  // '#ffffff' -> 0xffffff
  Num.mapNaN2Undefined(Number.parseInt(`0x${hexStr.slice(1)}`, 16));
