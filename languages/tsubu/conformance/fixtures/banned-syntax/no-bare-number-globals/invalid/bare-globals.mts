// @tsubu-expect banned-syntax/no-bare-number-globals
export const parsed = parseInt('42', 10);

// @tsubu-expect banned-syntax/no-bare-number-globals
export const notANumber = NaN;

// @tsubu-expect banned-syntax/no-bare-number-globals
export const positiveInfinity = Infinity;
