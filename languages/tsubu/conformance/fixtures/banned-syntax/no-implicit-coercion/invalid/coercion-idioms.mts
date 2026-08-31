export const toNumber = (s: string): number =>
  // @tsubu-expect banned-syntax/no-implicit-coercion
  +s;

export const toBool = (n: number): boolean =>
  // @tsubu-expect banned-syntax/no-implicit-coercion
  !!n;
