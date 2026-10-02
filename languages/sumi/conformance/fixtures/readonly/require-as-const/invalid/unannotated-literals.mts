// A non-mut_ `const` with no annotation takes its type from the literal, and
// an array or object literal infers a mutable one.
// @sumi-expect-error readonly/require-as-const
export const point = { x: 1, y: 2 };

// @sumi-expect-error readonly/require-as-const
export const names = ['a', 'b'];

// `satisfies` checks the literal against a type but does not change what is
// inferred.
// @sumi-expect-error readonly/require-as-const
export const origin = { x: 0, y: 0 } satisfies Readonly<{ x: number; y: number }>;
