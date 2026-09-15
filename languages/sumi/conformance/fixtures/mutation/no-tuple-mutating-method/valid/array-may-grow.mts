// An array states no length, so changing it is not a contradiction.
const mut_xs: number[] = [1, 2];

mut_xs.push(3);
mut_xs.pop();

export const xs = mut_xs;
