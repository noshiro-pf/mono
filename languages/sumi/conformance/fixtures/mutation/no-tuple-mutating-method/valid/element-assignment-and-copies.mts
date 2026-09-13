// Assigning to an element is checked against that slot's type, so it cannot
// put a value where it does not belong. The copying forms return an array.
const mut_slot: [number, string] = [1, 'a'];

mut_slot[0] = 9;
mut_slot[1] = 'b';

export const copies = [mut_slot.toReversed(), mut_slot.with(0, 5)] as const;

export const slot = mut_slot;
