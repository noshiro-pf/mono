import * as path from 'path';

export const appPathResolverMaker = (appDirectory: string) => (
  relativePath: string,
  endsWithSlash: boolean = false
): string =>
  path.resolve(appDirectory, relativePath) + (endsWithSlash ? '/' : '');
