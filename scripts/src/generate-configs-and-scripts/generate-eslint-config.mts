import { eslintConfigName, workspaceE2eDirName } from './constants.mjs';
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

  const srcDirStr =
    cfg.srcDirs.length >= 2 ? `{${cfg.srcDirs.join(',')}}` : cfg.srcDirs[0];

  const content = [
    "/** @typedef {import('@noshiro/eslint-configs').FlatConfig} FlatConfig */",
    '',
    'import {',
    '  eslintFlatConfigForTypeScript,',
    '  eslintFlatConfigForVitest,',
    '  eslintFlatConfigForPreact,', // maybe removed by prettier
    '  eslintFlatConfigForReact,', // maybe removed by prettier
    '  eslintFlatConfigForPlaywright,', // maybe removed by prettier
    '  genEsLintRestrictedImportsDefFromDevDependencies,',
    "} from '@noshiro/eslint-configs';",
    "import { toThisDir } from '@noshiro/mono-utils';",
    "import * as path from 'node:path';",
    "import packageJson from './package.json' with { type: 'json' };",
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
    `      packageDirs: [path.resolve(thisDir, '${pathPrefixToRoot}'), thisDir],`,
    '    }),',
    `    eslintFlatConfigForVitest(['${srcDirStr}/**/*']),`,
    cfg.tsType === 'preact'
      ? `...eslintFlatConfigForPreact(['${srcDirStr}/**/*']),`
      : cfg.tsType === 'react' || cfg.tsType === 'react-emotion'
        ? `...eslintFlatConfigForReact(['${srcDirStr}/**/*']),`
        : '',
    cfg.packageJson.scripts.e2e === 'playwright'
      ? `eslintFlatConfigForPlaywright(['${workspaceE2eDirName}/**/*']),`
      : '',

    '',

    '    {',
    '      rules: {',
    "        '@typescript-eslint/no-restricted-imports': [",
    "          'error',",
    '          ...restrictedImports,',
    '        ],',
    packageName === 'syncflow'
      ? "        'functional/no-class-inheritance': 'off',"
      : '',
    '      },',
    '    },',

    '  ];',
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
