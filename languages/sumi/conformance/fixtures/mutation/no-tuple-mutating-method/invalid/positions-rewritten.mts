// The type says slot 1 is a string. These four move or overwrite elements by
// position, so after any of them it is not.
const mut_pos: [number, string] = [1, 'a'];

// @sumi-expect-error mutation/no-tuple-mutating-method
mut_pos.reverse();

// @sumi-expect-error mutation/no-tuple-mutating-method
mut_pos.fill(0);

// @sumi-expect-error mutation/no-tuple-mutating-method
mut_pos.copyWithin(0, 1);

export const pos = mut_pos;
