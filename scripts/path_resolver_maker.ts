import * as path from 'path';

export const pathResolverMaker = (rootDir: string) => (
  relativePath: string,
  endsWithSlash: boolean = false
): string => path.resolve(rootDir, relativePath) + (endsWithSlash ? '/' : '');
