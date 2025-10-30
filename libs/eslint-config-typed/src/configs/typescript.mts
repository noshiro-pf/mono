import {
  eslintArrayFuncRules,
  eslintFunctionalRules,
  eslintImportsRules,
  eslintPluginSortDestructureKeysRules,
  eslintPreferArrowFunctionRules,
  eslintPromiseRules,
  eslintRules,
  eslintSecurityRules,
  eslintTotalFunctionsRules,
  eslintTreeShakableRules,
  eslintUnicornRules,
  typescriptEslintRules,
} from '../rules/index.mjs';
import { defineKnownRules, type FlatConfig } from '../types/index.mjs';
import { eslintConfigForTypeScriptWithoutRules } from './typescript-without-rules.mjs';

export const eslintConfigForTypeScript = ({
  files,
  packageDirs,
  tsconfigFileName,
  tsconfigRootDir,
  usingStrictTsLib,
}: Readonly<{
  tsconfigFileName: string;
  tsconfigRootDir: string;
  packageDirs: readonly string[];
  files?: readonly string[];
  usingStrictTsLib?: boolean;
}>): readonly FlatConfig[] =>
  [
    ...eslintConfigForTypeScriptWithoutRules({
      tsconfigFileName,
      tsconfigRootDir,
    }),
    {
      files: files ?? ['**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}'],
      rules: defineKnownRules({
        ...eslintArrayFuncRules,
        ...eslintPreferArrowFunctionRules,
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

        'strict-dependencies/strict-dependencies': ['error', []],

        'import/no-extraneous-dependencies': [
          'error',
          {
            packageDir: packageDirs,
          },
        ],
        ...(usingStrictTsLib === true
          ? {
              '@typescript-eslint/prefer-promise-reject-errors': 'off',
              '@typescript-eslint/use-unknown-in-catch-callback-variable':
                'off',
            }
          : {}),
      }),
    },
    {
      files: ['**/*.{js,jsx,mjs,cjs}'],
      rules: defineKnownRules({
        '@typescript-eslint/explicit-function-return-type': 'off',
        'import/no-internal-modules': 'off',
      }),
    },
    {
      files: ['**/*.d.{ts,mts,cts}'],
      rules: defineKnownRules({
        '@typescript-eslint/triple-slash-reference': 'off',
        'import/unambiguous': 'off',
      }),
    },
    {
      files: [
        // e.g.
        // - eslint.config.ts
        // - vitest.config.ts
        // - jest.config.js
        // - cypress.config.ts
        // - playwright.config.ts
        // - rollup.config.ts

        '**/*.config.{js,mjs,cjs,ts,mts,cts}',

        '**/*.config.*.{js,mjs,cjs,ts,mts,cts}',

        '**/.markdownlint-cli2.{jsonc,yaml,cjs,mjs}',
        '**/.markdownlint.{jsonc,json,yaml,yml,cjs,mjs}',
        '.prettierrc.{js,cjs,ts,cts,mjs,mts}',
      ],
      rules: defineKnownRules({
        '@typescript-eslint/no-restricted-imports': 'off',
        'import/no-default-export': 'off',
        'import/no-anonymous-default-export': 'off',
        'import/no-internal-modules': 'off',
        'import/no-named-as-default': 'off',
        'import/namespace': 'off',
      }),
    },
  ] as const;
