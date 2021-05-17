import type { uint32 } from '@noshiro/ts-utils';
import { randInt } from '@noshiro/ts-utils';

export const rollTwoDices = (): [number, number] => [
  randInt(1 as uint32, 6 as uint32),
  randInt(1 as uint32, 6 as uint32),
];
