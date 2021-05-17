import type { uint32 } from '../../types';
import { indexIsInRange } from '../is-in-range';

/**
 * @description alias of `ar.splice( index, 1 )[0]`;  Delete the element at address `index`
 * @return the deleted element
 */
export const removeAt = <T>(array: T[], index: uint32): T | undefined =>
  !indexIsInRange(array)(index) ? undefined : array.splice(index, 1)[0];
