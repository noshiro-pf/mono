// A read-only array has no `push` at all, so that is the compiler's to report;
// the rule is for a mutable array held under a name without the prefix.
const mut_values = [1];

const xs = mut_values;

// @sumi-expect-error mutation/no-mutation-without-mut-prefix
xs.push(2);

const byName = new Map<string, number>();

// The binding the mutator is called on is the one that has to be marked, not
// the one the value was made under.
const held = byName;

// @sumi-expect-error mutation/no-mutation-without-mut-prefix
held.set('a', 1);

const assignTarget = { a: 1 } as const;

// `Object.assign` mutates its first argument, so that is what is reported.
// @sumi-expect-error mutation/no-mutation-without-mut-prefix
Object.assign(assignTarget, { a: 2 });

export const result = [xs, held, assignTarget] as const;
