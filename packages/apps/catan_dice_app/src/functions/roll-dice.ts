import { randInt } from '@mono/ts-utils';

export const rollTwoDices = (): [number, number] => [
  randInt(1, 6),
  randInt(1, 6),
];
