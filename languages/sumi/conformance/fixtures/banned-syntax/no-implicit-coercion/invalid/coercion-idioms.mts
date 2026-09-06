export const toNumber = (s: string): number =>
  // @sumi-expect banned-syntax/no-implicit-coercion
  +s;

// `!!` on a boolean operand, so that only the coercion idiom fires (a
// non-boolean operand would also violate boolean/strict-logical-operands).
export const toBool = (b: boolean): boolean =>
  // @sumi-expect banned-syntax/no-implicit-coercion
  !!b;
