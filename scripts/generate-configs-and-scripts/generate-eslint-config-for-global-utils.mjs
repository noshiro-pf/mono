import { zeros } from '../ts-utils/utils.mjs';
import { eslintConfigName } from './constants.mjs';
import { workspaceConfig } from './workspace-config.mjs';
import { writeDirAndFileAndPrintDone } from './write-dir-and-file-and-print-done.mjs';

/**
 * @param {string} workspaceLocation
 * @param {string} packageName
 */
export const generateEsLintConfigForGlobalUtils = async (
  workspaceLocation,
  packageName,
) => {
  const cfg = workspaceConfig[packageName];

  if (cfg === undefined) {
    throw new Error(`workspaceConfig for package "${packageName}" not found.`);
  }

  if (!cfg.gen.lint) return;

  const depth = workspaceLocation.split('/').length;

  const pathPrefixToRoot = zeros(depth)
    .map(() => '..')
    .join('/');

  const content = [
    "/** @typedef { import('@noshiro/eslint-utils').FlatConfig } FlatConfig */",
    '',
    "import { eslintFlatConfigCommon } from '@noshiro/eslint-utils';",
    "import { toThisDir } from '@noshiro/mono-scripts/node-utils/path-utils.mjs",
    "import * as nodePath from 'node:path';",
    '',
    'const thisDir = toThisDir(import.meta.url);',
    '',
    '/** @type {readonly FlatConfig[]} */',
    'const config = eslintFlatConfigCommon({',
    '  tsconfigRootDir: thisDir,',
    "  tsconfigFileName: './tsconfig.json',",
    `  packageDirs: [nodePath.resolve(thisDir, '${pathPrefixToRoot}'), thisDir],`,
    '});',

    '',
    'export default config;',
  ].join('\n');

  await writeDirAndFileAndPrintDone(
    workspaceLocation,
    eslintConfigName,
    content,
    packageName,
  );
};
