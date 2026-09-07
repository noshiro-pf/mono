export const requirePositive = (n: number): number => {
  if (n <= 0) {
    // @sumi-expect exceptions/no-throw
    throw new Error('must be positive');
  }

  return n;
};
