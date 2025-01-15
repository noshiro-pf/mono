import {
  eslintArrayFuncRules,
  eslintFunctionalRules,
  eslintImportsRules,
  eslintPromiseRules,
  eslintRules,
  eslintSecurityRules,
  eslintTotalFunctionsRules,
  eslintTreeShakableRules,
  eslintUnicornRules,
  typescriptEslintRules,
} from '../rules/index.mjs';
import { type EslintImportsRules, type FlatConfig } from '../types/index.mjs';
import { eslintFlatConfigForTypeScriptWithoutRules } from './typescript-without-rules.mjs';

export const eslintFlatConfigForTypeScript = ({
  tsconfigFileName,
  tsconfigRootDir,
  packageDirs,
}: Readonly<{
  tsconfigFileName: string;
  tsconfigRootDir: string;
  packageDirs: readonly string[];
}>): readonly FlatConfig[] => [
  ...eslintFlatConfigForTypeScriptWithoutRules({
    tsconfigFileName,
    tsconfigRootDir,
  }),
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    rules: {
      ...eslintArrayFuncRules,
      ...eslintFunctionalRules,
      ...eslintTotalFunctionsRules,
      ...eslintImportsRules,
      ...eslintPromiseRules,
      ...eslintRules,
      ...eslintSecurityRules,
      ...eslintUnicornRules,
      ...typescriptEslintRules,
      ...eslintTreeShakableRules,

      'import/no-extraneous-dependencies': [
        'error',
        {
          packageDir: packageDirs,
        },
      ] satisfies EslintImportsRules['import/no-extraneous-dependencies'],
    },
  } satisfies FlatConfig,
  {
    files: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      'import/no-internal-modules': 'off',
    },
  } satisfies FlatConfig,
  {
    files: ['**/*.d.ts', '**/*.d.mts', '**/*.d.cts'],
    rules: {
      'import/unambiguous': 'off',
    },
  } satisfies FlatConfig,
  {
    files: [
      '**/eslint.config.js',
      '**/eslint.config.*.mjs',
      '**/vite.config.ts',
      '**/vite.config.mts',
      '**/vitest.config.ts',
      '**/vitest.config.mts',
      '**/jest.config.js',
      '**/jest.config.mjs',
      '**/jest.config*.mjs',
      '**/cypress.config.ts',
      '**/cypress.config.mts',
      '**/playwright.config.ts',
      '**/playwright.config.mts',
    ],
    rules: {
      '@typescript-eslint/no-restricted-imports': 'off',
      'import/no-default-export': 'off',
      'import/no-internal-modules': 'off',
      'import/no-named-as-default': 'off',
      'import/namespace': 'off',
    },
  } satisfies FlatConfig,
];
