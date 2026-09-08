export const describeValue = (s: string): string => {
  // @sumi-expect-error boolean/strict-logical-operands
  if (s) {
    return 'non-empty';
  }

  return 'empty';
};
