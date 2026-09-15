// A write the type already refuses is the compiler's to report: `as const`
// makes these read-only (readonly/require-as-const, D-60), and the rule does
// not say the same thing a second time.
const target = { a: 1 } as const;

// @sumi-expect-error compiler/2540
target.a = 2;

const cells = [0] as const;

// @sumi-expect-error compiler/2540
cells[0] = 1;

// An assertion hides the read-only target from the compiler, so the rule still
// reports the write.
// @sumi-expect-error mutation/no-mutation-without-mut-prefix
(target.a as number) = 3;

// A mutable value reaches a name without the prefix through an alias; the
// name being written through is the one that has to say so.
const mut_source = { a: 1 };

const alias = mut_source;

// @sumi-expect-error mutation/no-mutation-without-mut-prefix
alias.a = 2;

const mut_row = [0];

const row = mut_row;

// @sumi-expect-error mutation/no-mutation-without-mut-prefix
row[0] = 1;

// A mutable annotation is a violation in its own right; what this pins is the
// second diagnostic, on the operation rather than on the type.
// @sumi-expect-error readonly/require-readonly-type
const bag: { [key: string]: number } = { a: 1 };

// @sumi-expect-error mutation/no-mutation-without-mut-prefix
delete bag['a'];

export const result = [target, cells, alias, row, bag] as const;
