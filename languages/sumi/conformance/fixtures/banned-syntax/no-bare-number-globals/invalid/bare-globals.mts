// @sumi-expect-error banned-syntax/no-bare-number-globals
export const parsed = parseInt('42', 10);

// @sumi-expect-error banned-syntax/no-bare-number-globals
export const notANumber = NaN;

// @sumi-expect-error banned-syntax/no-bare-number-globals
export const positiveInfinity = Infinity;
