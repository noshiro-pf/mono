import { IList } from '../../immutable';

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types,functional/prefer-readonly-type
export const swap = <T>(array: T[], index1: number, index2: number): void => {
  if (
    IList.indexIsInRange(array, index1) &&
    IList.indexIsInRange(array, index2)
  ) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    [array[index1], array[index2]] = [array[index2]!, array[index1]!];
  }
};
