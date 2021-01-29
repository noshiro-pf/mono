import { indexIsInRange } from '../is-in-range';

export const swap = <T>(array: T[], index1: number, index2: number): void => {
  if (indexIsInRange(index1)(array) && indexIsInRange(index2)(array)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    [array[index1], array[index2]] = [array[index2]!, array[index1]!];
  }
};
