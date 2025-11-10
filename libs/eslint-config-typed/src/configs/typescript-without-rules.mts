import typescriptEslintParser from '@typescript-eslint/parser';
import globals from 'globals';
import { type FlatConfig } from '../types/index.mjs';
import { plugins } from './plugins.mjs';

export const eslintConfigForTypeScriptWithoutRules = ({
  tsconfigFileName,
  tsconfigRootDir,
}: Readonly<{
  tsconfigFileName: string;
  tsconfigRootDir: string;
}>): readonly FlatConfig[] =>
  [
    {
      ignores: [
        '**/eslint.config.{js,ts,mjs,mts,cjs,cts}',
        '**/eslint.config.*.{js,ts,mjs,mts,cjs,cts}',
        '**/eslint.*.config.{js,ts,mjs,mts,cjs,cts}',
        '**/node_modules',
        '**/dist',
        '**/build',
        '**/coverage',
      ],
    },
    {
      languageOptions: {
        ecmaVersion: 'latest',
        parser: typescriptEslintParser,
        parserOptions: {
          project: tsconfigFileName,
          tsconfigRootDir,
          ecmaVersion: 'latest',
          ecmaFeatures: {
            modules: true,
            impliedStrict: true,
            jsx: true,
          },
          jsxPragma: null, // for @typescript/eslint-parser
          sourceType: 'module',
        },
        globals: {
          ...globals.es2021,
        },
      },
      linterOptions: {
        noInlineConfig: false,
        reportUnusedDisableDirectives: true,
      },
      plugins,
      settings: {
        ...eslintPluginImportXSettings,
      },
    },
  ] as const;

// Omit `.d.ts` because 1) TypeScript compilation already confirms that
// types are resolved, and 2) it would mask an unresolved
// `.ts`/`.tsx`/`.js`/`.jsx` implementation.
const typeScriptExtensions = ['.ts', '.tsx', '.cts', '.mts'] as const;

const allExtensions = [
  ...typeScriptExtensions,
  '.js',
  '.jsx',
  '.cjs',
  '.mjs',
] as const;

// https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/src/config/typescript.ts

/**
 * This config:
 *
 * 1. Adds `.jsx`, `.ts`, `.cts`, `.mts`, and `.tsx` as an extension
 * 2. Enables JSX/TSX parsing
 */
const eslintPluginImportXSettings = {
  'import-x/extensions': allExtensions,
  'import-x/external-module-folders': ['node_modules', 'node_modules/@types'],
  'import-x/parsers': {
    '@typescript-eslint/parser': typeScriptExtensions,
  },
  'import-x/resolver': {
    typescript: true,
    // typescript: {
    //   alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
    //   project: ['packages/**/tsconfig.json', 'config/tsconfig.json'],
    //   project: ['packages/**/tsconfig.json'],
    // },

    // node: {
    //   extensions: [
    //     '.test.ts',
    //     '.js',
    //     '.ts',
    //     '.mjs',
    //     '.mts',
    //     '.cjs',
    //     '.cts',
    //     '.jsx',
    //     '.tsx',
    //   ],
    // },
  },
} as const;
