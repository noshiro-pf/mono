import { eslintConfigName } from './constants.mjs';
import { workspaceConfig } from './workspace-config.mjs';
import { writeDirAndFileAndPrintDone } from './write-dir-and-file-and-print-done.mjs';

export const generateEsLintConfig = async (
  workspaceLocation: string,
  packageName: string,
): Promise<void> => {
  const cfg = workspaceConfig[packageName];

  if (cfg === undefined) {
    throw new Error(`workspaceConfig for package "${packageName}" not found.`);
  }

  if (!cfg.gen.lint || cfg.tsType === undefined) return;

  const depth = workspaceLocation.split('/').length;

  const pathPrefixToRoot = Array.from({ length: depth }, () => '..').join('/');

  const baseConfigName = {
    preact: 'eslintFlatConfigForPreact',
    react: 'eslintFlatConfigForReact',
    'react-emotion': 'eslintFlatConfigForReact',
    mts: 'eslintFlatConfigCommon',
    dom: 'eslintFlatConfigCommon',
  }[cfg.tsType];

  const content = [
    "/** @typedef { import('@noshiro/eslint-utils').FlatConfig } FlatConfig */",
    '',
    'import {',
    `  ${baseConfigName},`,
    '  genEsLintRestrictedImportsDefFromDevDependencies,',
    "} from '@noshiro/eslint-utils';",
    "import { toThisDir } from '@noshiro/mono-scripts",
    "import * as nodePath from 'node:path';",
    "import packageJson from './package.json' assert { type: 'json' };",
    '',
    'const thisDir = toThisDir(import.meta.url);',
    '',
    '/** @returns {Promise<readonly FlatConfig[]>} */',
    'const defineConfig = async () => {',
    '  const restrictedImports =',
    '    await genEsLintRestrictedImportsDefFromDevDependencies(',
    '      packageJson.devDependencies,',
    '    );',
    '',
    '  /** @type {readonly FlatConfig[]} */',
    `  const configs = ${baseConfigName}({`,
    '    tsconfigRootDir: thisDir,',
    "    tsconfigFileName: './tsconfig.json',",
    `    packageDirs: [nodePath.resolve(thisDir, '${pathPrefixToRoot}'), thisDir],`,
    '    restrictedImports,',
    cfg.useVite === true ? '    isViteProject: true,' : '',
    '  });',
    '',
    packageName === 'annotation-tool'
      ? "  return [...configs, { rules: { '@typescript-eslint/prefer-readonly-parameter-types': 'off' } }]"
      : packageName === 'blueprintjs-playground'
        ? "  return [...configs, { rules: { 'import/no-internal-modules': 'off' } }]"
        : '  return configs;',
    '};',
    '',
    'export default defineConfig();',
  ].join('\n');

  await writeDirAndFileAndPrintDone(
    workspaceLocation,
    eslintConfigName,
    content,
    packageName,
  );
};
