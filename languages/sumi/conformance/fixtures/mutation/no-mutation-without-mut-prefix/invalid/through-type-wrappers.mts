// Parentheses and `satisfies` say nothing about the value they wrap: the
// target, the callee and the receiver underneath are what is judged.
const target = { a: 1 };

// @sumi-expect-error mutation/no-mutation-without-mut-prefix
(target.a satisfies number) = 2;

const xs = [1];

// @sumi-expect-error mutation/no-mutation-without-mut-prefix
(xs.push)(2);

export const result = [target, xs] as const;
