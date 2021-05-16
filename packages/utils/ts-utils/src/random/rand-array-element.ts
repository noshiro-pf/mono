import type { uint32 } from '../types';
import { randInt } from './rand-int';

export const randomArrayElement = <T>(array: readonly T[]): T =>
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  array[randInt(0 as uint32, (array.length - 1) as uint32)]!;
