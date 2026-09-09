export const first = (xs: readonly number[]): number =>
  // @sumi-expect-error banned-syntax/no-non-null-assertion
  xs[0]!;
