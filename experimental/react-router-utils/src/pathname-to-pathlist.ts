export const pathnameToPathList = (pathname: string): readonly string[] =>
  pathname.split('/').filter((s) => s !== '');
