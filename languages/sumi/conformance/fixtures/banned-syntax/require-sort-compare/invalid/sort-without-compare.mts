export const sortNumbers = (xs: readonly number[]): readonly number[] =>
  // @sumi-expect-error banned-syntax/require-sort-compare
  xs.toSorted();
