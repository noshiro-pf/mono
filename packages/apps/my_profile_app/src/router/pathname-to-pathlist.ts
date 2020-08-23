export const pathnameToPathList = (pathname: string): string[] =>
  pathname.split('/').filter((s) => s !== '');
