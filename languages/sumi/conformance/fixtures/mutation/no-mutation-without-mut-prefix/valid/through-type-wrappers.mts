// `satisfies` hides neither the `mut_` prefix nor a value made on the spot.
const mut_xs = [1];

(mut_xs satisfies readonly number[]).push(2);

export const pushed = mut_xs;

export const sortedFresh = ([3, 1, 2] satisfies readonly number[]).sort(
  (a, b) => a - b,
);
