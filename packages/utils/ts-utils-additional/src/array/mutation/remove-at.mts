import { Arr } from '@noshiro/ts-utils';

/**
 * Alias of `ar.splice( index, 1 )[0]`; Delete the element at address `index`
 *
 * @returns The deleted element
 */
export const removeAt = <T,>(
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  mut_array: T[],
  index: Uint32WithSmallInt,
): T | undefined =>
  !Arr.indexIsInRange(mut_array, index)
    ? undefined
    : mut_array.splice(index, 1)[0];
