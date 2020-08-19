export const stringToNumber = (numberlike: string): number | undefined => {
  const result = Number(numberlike);
  return Number.isNaN(result) ? undefined : result;
};
