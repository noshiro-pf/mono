export const quoteIfSpaceIncluded = (str: string): string =>
  /\s/gu.test(str) ? `"${str}"` : str;
