import { Arr } from '@noshiro/ts-utils';

type SmallUint = Uint9;

/**
 * @description alias of `ar.splice( index, 1 )[0]`;  Delete the element at address `index`
 * @return the deleted element
 */
export const removeAt = <T>(
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  mut_array: T[],
  index: SmallUint | Uint32
): T | undefined =>
  !Arr.indexIsInRange(mut_array, index)
    ? undefined
    : mut_array.splice(index, 1)[0];
