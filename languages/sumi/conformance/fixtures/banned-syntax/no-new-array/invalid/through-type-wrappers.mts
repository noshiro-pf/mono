// A type wrapper around the constructor changes its type, not what is called.
// @sumi-expect-error banned-syntax/no-new-array
export const holes = new (Array satisfies ArrayConstructor)(3);

// @sumi-expect-error banned-syntax/no-new-array
export const pair = new (Array as ArrayConstructor)(1, 2);
