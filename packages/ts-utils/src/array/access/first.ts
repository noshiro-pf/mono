import { at } from './at';

/** @internal */
export const first = <T>(array: readonly T[]): T | undefined => at(array, 0);
