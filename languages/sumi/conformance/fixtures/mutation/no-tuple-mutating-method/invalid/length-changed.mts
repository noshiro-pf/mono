const mut_len: [number, string] = [1, 'a'];

// @sumi-expect-error mutation/no-tuple-mutating-method
mut_len.push('b');

// @sumi-expect-error mutation/no-tuple-mutating-method
mut_len.splice(0, 1);

export const len = mut_len;
