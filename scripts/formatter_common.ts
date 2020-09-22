import { monoRootAbsolutePath } from './get_mono_root_path';
import { pathResolverMaker } from './path_resolver_maker';

export type FileName = string;

export const isTsFileName = (filename: FileName): boolean =>
  (filename.endsWith('.ts') || filename.endsWith('.tsx')) &&
  !filename.endsWith('.d.ts');

export const toAbsolutePath = (path: string): string =>
  pathResolverMaker(monoRootAbsolutePath)(path);

export const filterTsFiles = (files: FileName[]): FileName[] =>
  files.filter(isTsFileName).map(toAbsolutePath);

export const printTargetFiles = (tsFiles: FileName[]): void => {
  console.log(`target files (${tsFiles.length} files):`);
  tsFiles.forEach((filename) => console.log(`- ${filename}`));
};
