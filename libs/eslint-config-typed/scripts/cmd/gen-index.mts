import mm from 'micromatch';
import { genIndex } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

const srcDir = path.resolve(projectRootPath, './src');

const scriptsDir = path.resolve(projectRootPath, './scripts/gen-eslint-rules');

await genIndex({
  targetDirectory: [srcDir, scriptsDir],
  indexFileExtension: '.mts',
  exportStatementExtension: '.mjs',
  targetExtensions: ['.mts', '.tsx'],
  exclude: ({ absolutePath, fileName }) =>
    fileName.endsWith('.test.mts') ||
    fileName === 'react-base.mts' ||
    fileName === 'globals.d.mts' ||
    fileName === 'eslint.config.gen.mts' ||
    absolutePath === path.resolve(srcDir, './entry-point.mts') ||
    mm.isMatch(absolutePath, path.resolve(srcDir, './constants/**')) ||
    mm.isMatch(absolutePath, path.resolve(srcDir, './plugins/*/rules')),
});
