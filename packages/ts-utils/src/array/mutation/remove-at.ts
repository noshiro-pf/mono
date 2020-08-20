import { indexIsInRange } from '../is-in-range';

/**
 * @description alias of `ar.splice( index, 1 )[0]`;  Delete the element at address `index`
 * @return the deleted element
 */
export const removeAt = <T>(array: T[], index: number): T | undefined =>
  !indexIsInRange(index)(array) ? undefined : array.splice(index, 1)[0];
