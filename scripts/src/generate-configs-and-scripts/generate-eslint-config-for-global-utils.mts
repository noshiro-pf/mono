import { eslintConfigName } from './constants.mjs';
import { workspaceConfig } from './workspace-config.mjs';
import { writeDirAndFileAndPrintDone } from './write-dir-and-file-and-print-done.mjs';

export const generateEsLintConfigForGlobalUtils = async (
  workspaceLocation: string,
  packageName: string,
): Promise<void> => {
  const cfg = workspaceConfig[packageName];

  if (cfg === undefined) {
    throw new Error(`workspaceConfig for package "${packageName}" not found.`);
  }

  if (!cfg.gen.lint) return;

  const depth = workspaceLocation.split('/').length;

  const pathPrefixToRoot = Array.from({ length: depth }, () => '..').join('/');

  const content = [
    "/** @typedef {import('@noshiro/eslint-configs').FlatConfig} FlatConfig */",
    '',
    "import { eslintFlatConfigForTypeScript } from '@noshiro/eslint-configs';",
    "import * as path from 'node:path';",
    '',
    'const thisDir = import.meta.dirname;',
    '',
    '/** @type {readonly FlatConfig[]} */',
    'const config = eslintFlatConfigForTypeScript({',
    '  tsconfigRootDir: thisDir,',
    "  tsconfigFileName: './tsconfig.json',",
    `  packageDirs: [path.resolve(thisDir, '${pathPrefixToRoot}'), thisDir],`,
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
