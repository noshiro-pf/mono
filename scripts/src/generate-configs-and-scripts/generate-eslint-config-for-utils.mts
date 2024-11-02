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

  const content = [
    "/** @typedef { import('@noshiro/eslint-configs').FlatConfig } FlatConfig */",
    '',
    'import {',
    '  eslintFlatConfigForTypeScript,',
    '  eslintFlatConfigForVitest,',
    '  eslintFlatConfigForPreact,', // maybe removed by prettier
    '  eslintFlatConfigForReact,', // maybe removed by prettier
    '  genEsLintRestrictedImportsDefFromDevDependencies,',
    "} from '@noshiro/eslint-configs';",
    "import { toThisDir } from '@noshiro/mono-scripts';",
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
    '  const configs = [',
    '    ...eslintFlatConfigForTypeScript({',
    '      tsconfigRootDir: thisDir,',
    "      tsconfigFileName: './tsconfig.json',",
    `      packageDirs: [nodePath.resolve(thisDir, '${pathPrefixToRoot}'), thisDir],`,
    '    }),',
    '    eslintFlatConfigForVitest(),',
    cfg.tsType === 'preact'
      ? '...eslintFlatConfigForPreact(),'
      : cfg.tsType === 'react' || cfg.tsType === 'react-emotion'
        ? '...eslintFlatConfigForReact(),'
        : '',
    '',

    "{ rules: { '@typescript-eslint/no-restricted-imports': [ 'error', ...restrictedImports ] } },",

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
