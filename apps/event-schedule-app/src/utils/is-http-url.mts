export const isHttpUrl = (str: string): boolean => {
  const protocol = URL.parse(str)?.protocol;

  return protocol === 'http:' || protocol === 'https:';
};
