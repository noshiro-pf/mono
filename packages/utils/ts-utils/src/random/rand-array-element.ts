import { randInt } from './rand-int';

export const randomArrayElement = <T>(array: T[]): T =>
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  array[randInt(0, array.length - 1)]!;
