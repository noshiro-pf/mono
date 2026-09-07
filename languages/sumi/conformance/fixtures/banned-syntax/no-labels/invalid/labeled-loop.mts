export const findPair = (rows: readonly (readonly number[])[]): boolean => {
  // @sumi-expect banned-syntax/no-labels
  outer: for (const row of rows) {
    for (const cell of row) {
      if (cell === 0) {
        // @sumi-expect banned-syntax/no-labels
        break outer;
      }
    }
  }

  return false;
};
