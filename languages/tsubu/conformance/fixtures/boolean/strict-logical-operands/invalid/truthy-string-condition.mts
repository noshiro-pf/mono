export const describeValue = (s: string): string => {
  // @tsubu-expect boolean/strict-logical-operands
  if (s) {
    return 'non-empty';
  }

  return 'empty';
};
