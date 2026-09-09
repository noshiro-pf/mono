export const isZero = (x: number): boolean =>
  // @sumi-expect-error banned-syntax/no-loose-equality
  x == 0;

export const isNonZero = (x: number): boolean =>
  // @sumi-expect-error banned-syntax/no-loose-equality
  x != 0;
