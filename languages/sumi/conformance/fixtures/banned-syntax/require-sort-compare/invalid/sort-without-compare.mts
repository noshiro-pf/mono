export const sortNumbers = (xs: readonly number[]): readonly number[] =>
  // @sumi-expect banned-syntax/require-sort-compare
  xs.toSorted();
