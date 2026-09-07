const rowHasZero = (row: readonly number[]): boolean => row.includes(0);

export const findPair = (rows: readonly (readonly number[])[]): boolean =>
  rows.some(rowHasZero);
