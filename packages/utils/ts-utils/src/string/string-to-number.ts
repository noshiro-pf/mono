export const stringToNumber = (numberLike: string): number | undefined => {
  const result = parseFloat(numberLike);
  return Number.isNaN(result) ? undefined : result;
};
