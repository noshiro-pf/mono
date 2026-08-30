const first = (): number => 1;

const second = (): number => 2;

// @tsubu-expect banned-syntax/no-comma-operator
export const result = (first(), second());
