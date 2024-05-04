import {
  eslintArrayFuncRules,
  eslintCypressRules,
  eslintDeprecationRules,
  eslintFunctionalRules,
  eslintImportsRules,
  eslintJestRules,
  eslintPromiseRules,
  eslintRules,
  eslintSecurityRules,
  eslintUnicornRules,
  typescriptEslintRules,
} from '../rules/index.mjs';
import { type FlatConfig } from '../types/flat-config.mjs';
import { type EslintImportsRules } from '../types/rules/eslint-import-rules.mjs';
import {
  type TypeScriptEslintRules,
  type TypeScriptEslintRulesOption,
} from '../types/rules/typescript-eslint-rules.mjs';
import { eslintFlatConfigCommonWithoutRules } from './common-without-rules.mjs';

export const eslintFlatConfigCommon = ({
  tsconfigFileName,
  tsconfigRootDir,
  packageDirs,
  restrictedImports,
}: Readonly<{
  tsconfigFileName: string;
  tsconfigRootDir: string;
  packageDirs: readonly string[];
  restrictedImports?: TypeScriptEslintRulesOption['@typescript-eslint/no-restricted-imports'];
}>): readonly FlatConfig[] => [
  ...eslintFlatConfigCommonWithoutRules({
    tsconfigFileName,
    tsconfigRootDir,
  }),
  {
    rules: {
      ...eslintArrayFuncRules,
      ...eslintCypressRules,
      ...eslintDeprecationRules,
      ...eslintFunctionalRules,
      ...eslintImportsRules,
      ...eslintJestRules,
      ...eslintPromiseRules,
      ...eslintRules,
      ...eslintSecurityRules,
      ...eslintUnicornRules,
      ...typescriptEslintRules,

      'import/no-extraneous-dependencies': [
        'error',
        {
          packageDir: packageDirs,
        },
      ] satisfies EslintImportsRules['import/no-extraneous-dependencies'],
    },
  } satisfies FlatConfig,
  {
    files: ['**/*.{js,ts,mjs,mts,cjs,cts,jsx,tsx}'],
    rules:
      restrictedImports === undefined
        ? {}
        : {
            '@typescript-eslint/no-restricted-imports': [
              'error',
              ...restrictedImports,
            ] satisfies TypeScriptEslintRules['@typescript-eslint/no-restricted-imports'],
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
      '**/vitest.config.ts',
      '**/jest.config*.mjs',
      '**/cypress.config.ts',
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
