// Rewriting an element, and the mutators that leave the length alone, are
// what a `mut_` tuple is for.
const mut_pair: [number, number] = [1, 2];

mut_pair[0] = 9;
mut_pair.sort((a, b) => a - b);
mut_pair.reverse();

export const pair = mut_pair;
