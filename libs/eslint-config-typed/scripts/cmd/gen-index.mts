import { genIndex } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

const srcDir = path.resolve(projectRootPath, './src');

await genIndex({
  targetDirectory: srcDir,
  indexFileExtension: '.mts',
  exportStatementExtension: '.mjs',
  targetExtensions: ['.mts', '.tsx'],
  exclude: ({ absolutePath, fileName }) =>
    fileName.endsWith('.test.mts') ||
    fileName === 'globals.d.mts' ||
    absolutePath === path.resolve(srcDir, './entry-point.mts') ||
    absolutePath.startsWith(
      path.resolve(srcDir, './plugins/total-functions/rules'),
    ) ||
    absolutePath.startsWith(
      path.resolve(srcDir, './plugins/tree-shakable/rules'),
    ) ||
    absolutePath.startsWith(path.resolve(srcDir, './plugins/custom/rules')),
});
