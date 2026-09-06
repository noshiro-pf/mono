export const describeValue = (s: string): string => {
  // @sumi-expect boolean/strict-logical-operands
  if (s) {
    return 'non-empty';
  }

  return 'empty';
};
