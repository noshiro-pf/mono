import { resolve } from 'path';

export const pathResolverMaker =
  (rootDir: string) =>
  (relativePath: string, endsWithSlash: boolean = false): string =>
    resolve(rootDir, relativePath) + (endsWithSlash ? '/' : '');
