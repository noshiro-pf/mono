export const describeValue = (s: string): string => {
  if (s !== '') {
    return 'non-empty';
  }

  return 'empty';
};
