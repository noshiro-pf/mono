export const toAbsolutePath = (relativePath: string): string => {
  const mut_element: Mutable<HTMLAnchorElement> = document.createElement('a');

  mut_element.href = relativePath;

  return mut_element.href;
};
