import { Num } from '@noshiro/ts-utils';

export const hexStrToNumber = (hexStr: string): number | undefined =>
  // '#ffffff' -> 0xffffff
  Num.parseInt(`0x${hexStr.slice(1)}`, 16);
