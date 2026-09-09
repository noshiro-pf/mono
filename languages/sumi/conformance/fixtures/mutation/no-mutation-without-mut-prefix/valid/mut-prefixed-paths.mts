// The `mut_` prefix is what makes a destructive operation legal, on the root
// binding or on a property along the path (spec/variables-and-mutation.md).
const mut_xs: number[] = [];

mut_xs.push(1);
mut_xs[0] = 2;

const state: { mut_seen: Record<string, number> } = { mut_seen: {} };

state.mut_seen['a'] = 1;

export const result = [mut_xs, state.mut_seen] as const;
