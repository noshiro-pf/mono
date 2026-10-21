// A property of the global object is the same constructor as the bare name.
// The strict standard library declares `Array` with `const`, which does not
// make it a property of `globalThis`, so the compiler rejects the access as
// well.
// @sumi-expect-error banned-syntax/no-new-array
// @sumi-expect-error compiler/2339
export const holes = new globalThis.Array(3);

// @sumi-expect-error banned-syntax/no-new-array
// @sumi-expect-error compiler/2339
export const pair = new globalThis['Array'](1, 2);
