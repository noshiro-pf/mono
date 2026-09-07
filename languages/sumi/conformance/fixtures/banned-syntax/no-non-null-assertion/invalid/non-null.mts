export const first = (xs: readonly number[]): number =>
  // @sumi-expect banned-syntax/no-non-null-assertion
  xs[0]!;
