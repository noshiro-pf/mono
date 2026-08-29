export const isZero = (x: number): boolean =>
  // @tsubu-expect banned-syntax/no-loose-equality
  x == 0;

export const isNonZero = (x: number): boolean =>
  // @tsubu-expect banned-syntax/no-loose-equality
  x != 0;
