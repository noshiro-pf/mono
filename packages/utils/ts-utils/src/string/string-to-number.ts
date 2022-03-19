export const stringToNumber = (numberLike: string): number | undefined => {
  const result = Number.parseFloat(numberLike);

  return Number.isNaN(result) ? undefined : result;
};
