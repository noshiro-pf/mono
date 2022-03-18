import { IList } from '../../immutable';

/**
 * @description alias of `ar.splice( index, 1 )[0]`;  Delete the element at address `index`
 * @return the deleted element
 */

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
export const removeAt = <T>(mut_array: T[], index: number): T | undefined =>
  !IList.indexIsInRange(mut_array, index)
    ? undefined
    : mut_array.splice(index, 1)[0];
