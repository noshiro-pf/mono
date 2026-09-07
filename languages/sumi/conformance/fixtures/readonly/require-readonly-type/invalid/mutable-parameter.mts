// A mutable parameter type is reported by both the annotation rule and the
// type-aware parameter rule (D-45 has both legs).
// @sumi-expect readonly/require-readonly-type
// @sumi-expect readonly/require-readonly-parameter
export const total = (xs: number[]): number => xs.length;
