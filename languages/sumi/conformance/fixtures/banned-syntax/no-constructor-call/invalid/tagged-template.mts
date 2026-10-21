// A tag is called as a function: `String`42`` is `String(['42'])`.
// @sumi-expect-error banned-syntax/no-constructor-call
export const text = String`42`;

// The strict standard library does not make `Number` a property of
// `globalThis`, so the compiler rejects the access as well.
// @sumi-expect-error banned-syntax/no-constructor-call
// @sumi-expect-error compiler/2339
export const parsed = globalThis.Number`1`;
