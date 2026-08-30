export const requirePositive = (n: number): number => {
  if (n <= 0) {
    // @tsubu-expect exceptions/no-throw
    throw new Error('must be positive');
  }

  return n;
};
