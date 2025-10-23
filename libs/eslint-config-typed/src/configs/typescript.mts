import {
  eslintArrayFuncRules,
  eslintFunctionalRules,
  eslintImportsRules,
  eslintPluginSortDestructureKeysRules,
  eslintPromiseRules,
  eslintRules,
  eslintSecurityRules,
  eslintTotalFunctionsRules,
  eslintTreeShakableRules,
  eslintUnicornRules,
  typescriptEslintRules,
} from '../rules/index.mjs';
import { defineKnownRules, type FlatConfig } from '../types/index.mjs';
import { eslintFlatConfigForTypeScriptWithoutRules } from './typescript-without-rules.mjs';

export const eslintFlatConfigForTypeScript = ({
  files,
  packageDirs,
  tsconfigFileName,
  tsconfigRootDir,
}: Readonly<{
  tsconfigFileName: string;
  tsconfigRootDir: string;
  packageDirs: readonly string[];
  files?: readonly string[];
}>): readonly FlatConfig[] => [
  ...eslintFlatConfigForTypeScriptWithoutRules({
    tsconfigFileName,
    tsconfigRootDir,
  }),
  {
    files: files ?? ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    rules: defineKnownRules({
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
      ...eslintPluginSortDestructureKeysRules,

      'import/no-extraneous-dependencies': [
        'error',
        {
          packageDir: packageDirs,
        },
      ],
    }),
  } satisfies FlatConfig,
  {
    files: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
    rules: defineKnownRules({
      '@typescript-eslint/explicit-function-return-type': 'off',
      'import/no-internal-modules': 'off',
    }),
  } satisfies FlatConfig,
  {
    files: ['**/*.d.ts', '**/*.d.mts', '**/*.d.cts'],
    rules: defineKnownRules({
      '@typescript-eslint/triple-slash-reference': 'off',
      'import/unambiguous': 'off',
    }),
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
    rules: defineKnownRules({
      '@typescript-eslint/no-restricted-imports': 'off',
      'import/no-default-export': 'off',
      'import/no-internal-modules': 'off',
      'import/no-named-as-default': 'off',
      'import/namespace': 'off',
    }),
  } satisfies FlatConfig,
];
