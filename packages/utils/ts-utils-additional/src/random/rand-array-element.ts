import { Num } from '@noshiro/ts-utils';

export const randomArrayElement = <T>(array: readonly T[]): T =>
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  array[Num.randInt(0, array.length - 1)]!;
