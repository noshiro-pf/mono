// A property of the global object is the same constructor as the bare name.
// The strict standard library declares the constructors with `const`, which
// does not make them properties of `globalThis`, so the compiler rejects the
// access as well.
// @sumi-expect-error banned-syntax/no-constructor-call
// @sumi-expect-error compiler/2339
export const parsed = globalThis.Number('1');

// @sumi-expect-error banned-syntax/no-constructor-call
// @sumi-expect-error compiler/2339
export const text = globalThis['String'](42);

// @sumi-expect-error banned-syntax/no-constructor-call
// @sumi-expect-error compiler/2339
export const truthy = (globalThis satisfies typeof globalThis).Boolean(1);
