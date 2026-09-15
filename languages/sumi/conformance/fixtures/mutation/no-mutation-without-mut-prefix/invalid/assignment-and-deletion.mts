const target = { a: 1 } as const;

// @sumi-expect-error mutation/no-mutation-without-mut-prefix
// @sumi-expect-error compiler/2540
target.a = 2;

const cells = [0] as const;

// @sumi-expect-error mutation/no-mutation-without-mut-prefix
// @sumi-expect-error compiler/2540
cells[0] = 1;

// A mutable annotation is a violation in its own right; what this pins is the
// second diagnostic, on the operation rather than on the type.
// @sumi-expect-error readonly/require-readonly-type
const bag: { [key: string]: number } = { a: 1 };

// @sumi-expect-error mutation/no-mutation-without-mut-prefix
delete bag['a'];

export const result = [target, cells, bag] as const;
