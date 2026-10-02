// Parentheses and `satisfies` say nothing about the value they wrap: the
// target, the callee and the receiver underneath are what is judged. Both are
// mutable values held under a name without the prefix, as in mutating-calls.
const mut_target = { a: 1 };

const target = mut_target;

// @sumi-expect-error mutation/no-mutation-without-mut-prefix
(target.a satisfies number) = 2;

const mut_values = [1];

const xs = mut_values;

// @sumi-expect-error mutation/no-mutation-without-mut-prefix
(xs.push)(2);

export const result = [target, xs] as const;
