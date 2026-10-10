// A type wrapper around the callee changes its type, not what is called.
// @sumi-expect-error banned-syntax/no-constructor-call
export const parsed = (Number satisfies NumberConstructor)('1');

// @sumi-expect-error banned-syntax/no-constructor-call
export const truthy = (Boolean as BooleanConstructor)(1);
