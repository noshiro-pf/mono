// A `mut_` binding that is never reassigned should be `const`.
// @sumi-expect-error mutation/prefer-const
let mut_total = 0;

export const total = mut_total;
