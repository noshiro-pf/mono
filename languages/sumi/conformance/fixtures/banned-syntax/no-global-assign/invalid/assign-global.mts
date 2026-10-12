// `JSON` is declared `const`, so the compiler rejects the assignment too.
// @sumi-expect-error banned-syntax/no-global-assign
// @sumi-expect-error compiler/2588
JSON = JSON;

export const marker = 1;
