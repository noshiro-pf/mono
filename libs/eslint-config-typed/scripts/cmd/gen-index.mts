import mm from 'micromatch';
import * as path from 'node:path';
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
    fileName === 'eslint.config.gen.mts' ||
    absolutePath === path.resolve(srcDir, './entry-point.mts') ||
    mm.isMatch(absolutePath, path.resolve(srcDir, './constants/**')) ||
    mm.isMatch(absolutePath, path.resolve(srcDir, './plugins/*/rules')) ||
    // Helpers the plugins share, kept out of the public exports; its
    // index.mts is hand-written.
    mm.isMatch(absolutePath, path.resolve(srcDir, './plugins/ast-utils')),
});
