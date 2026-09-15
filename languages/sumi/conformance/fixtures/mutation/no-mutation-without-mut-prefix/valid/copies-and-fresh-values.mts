// A copying method is not a mutation, and a value made on the spot is held by
// nothing else — mutating it is visible to nobody.
const xs: readonly number[] = [3, 1, 2];

export const sorted = xs.toSorted((a, b) => a - b);

export const sortedFresh = [3, 1, 2].sort((a, b) => a - b);

export const fromSlice = [3, 1, 2].slice().sort((a, b) => a - b);
