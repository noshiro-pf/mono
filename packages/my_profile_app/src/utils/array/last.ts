import { at } from './at';

/** @internal */
export const last = <T>(array: readonly T[]): T | undefined =>
  at(array, array.length - 1);
