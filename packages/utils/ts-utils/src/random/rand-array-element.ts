import { randInt } from './rand-int';

export const randomArrayElement = <T>(array: T[]): T =>
  array[randInt(0, array.length - 1)] as T;
