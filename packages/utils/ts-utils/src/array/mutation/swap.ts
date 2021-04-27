import { uint32 } from '../../types';
import { indexIsInRange } from '../is-in-range';

export const swap = <T>(array: T[], index1: uint32, index2: uint32): void => {
  if (indexIsInRange(array)(index1) && indexIsInRange(array)(index2)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    [array[index1], array[index2]] = [array[index2]!, array[index1]!];
  }
};
