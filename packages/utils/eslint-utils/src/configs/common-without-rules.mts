import typescriptEslintParser from '@typescript-eslint/parser';
import { type FlatConfig } from '../types/flat-config.mjs';
import { plugins } from './plugins.mjs';

export const eslintFlatConfigCommonWithoutRules = ({
  tsconfigFileName,
  tsconfigRootDir,
}: Readonly<{
  tsconfigFileName: string;
  tsconfigRootDir: string;
}>): readonly FlatConfig[] => [
  {
    ignores: [
      'esm',
      'cjs',
      'dist',
      'build',
      'lib',
      '.wireit',
      '*_bs.ts',
      '*.d.ts',
      '*.d.mts',
      '*.d.cts',
      'eslint.config.js',
      'eslint.config.*.mjs',
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

      // https://github.com/sindresorhus/globals/blob/main/globals.json
      // globals: {
      //   es2021: true,
      // },
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
          '.mts',
          '.cts',
          '.ts',
          '.tsx',
          '.mjs',
          '.cjs',
          '.js',
          '.jsx',
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
            '.mts',
            '.cts',
            '.ts',
            '.tsx',
            '.mjs',
            '.cjs',
            '.js',
            '.jsx',
          ],
        },
      },
      // copied from default config
      'import/extensions': [
        '.mts',
        '.cts',
        '.ts',
        '.tsx',
        '.mjs',
        '.cjs',
        '.js',
        '.jsx',
      ],
      'import/external-module-folders': ['node_modules', 'node_modules/@types'],
    },
  } as const,
];
