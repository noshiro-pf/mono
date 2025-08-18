import typescriptEslintParser from '@typescript-eslint/parser';
import globals from 'globals';
import { type FlatConfig } from '../types/index.mjs';
import { plugins } from './plugins.mjs';

export const eslintFlatConfigForTypeScriptWithoutRules = ({
  tsconfigFileName,
  tsconfigRootDir,
}: Readonly<{
  tsconfigFileName: string;
  tsconfigRootDir: string;
}>): readonly FlatConfig[] =>
  [
    {
      ignores: ['eslint.config.js', 'eslint.config.*.mjs'],
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
        'import/parsers': {
          '@typescript-eslint/parser': [
            '.test.ts',
            '.js',
            '.ts',
            '.mjs',
            '.mts',
            '.cjs',
            '.cts',
            '.jsx',
            '.tsx',
          ],
        },
        'import/resolver': {
          typescript: {
            alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
            // project: ['packages/**/tsconfig.json', 'config/tsconfig.json'],
            project: ['packages/**/tsconfig.json'],
          },
          // copied from default config
          node: {
            extensions: [
              '.test.ts',
              '.js',
              '.ts',
              '.mjs',
              '.mts',
              '.cjs',
              '.cts',
              '.jsx',
              '.tsx',
            ],
          },
        },
        // copied from default config
        'import/extensions': [
          '.js',
          '.ts',
          '.mjs',
          '.mts',
          '.cjs',
          '.cts',
          '.jsx',
          '.tsx',
        ],
        'import/external-module-folders': [
          'node_modules',
          'node_modules/@types',
        ],
      },
    },
  ] as const;
