// Parentheses around the callee keep the receiver: these still call the
// method on the tuple.
const mut_pair: [number, string] = [1, 'a'];

// @sumi-expect-error mutation/no-tuple-mutating-method
(mut_pair.push)(3);

// @sumi-expect-error mutation/no-tuple-mutating-method
(mut_pair.reverse)();

export const pair = mut_pair;
