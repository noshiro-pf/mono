export const toAbsolutePath = (relativePath: string): string => {
  const e = document.createElement('a');
  e.href = relativePath;
  return e.href;
};
