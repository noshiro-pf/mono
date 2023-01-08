import { Arr } from '@noshiro/ts-utils';

export const swap = <T>(
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  mut_array: T[],
  index1: number,
  index2: number
): void => {
  if (
    Arr.indexIsInRange(mut_array, index1) &&
    Arr.indexIsInRange(mut_array, index2)
  ) {
    [mut_array[index1], mut_array[index2]] = [
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      mut_array[index2]!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      mut_array[index1]!,
    ];
  }
};
