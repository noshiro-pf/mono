export const splitToPathSegments = (pathname: string): readonly string[] =>
  pathname.split('/').filter((s) => s.length > 0);
