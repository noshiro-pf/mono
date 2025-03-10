import type * as prettier from 'prettier';

export const ignoreFormatting = (absoluteFilePath: string): boolean =>
  absoluteFilePath.includes('/temp/eslint-fixed/') ||
  absoluteFilePath.includes('/diff/');

export const formatWithPrintWidth320 = (absoluteFilePath: string): boolean =>
  absoluteFilePath.includes('/temp/copied/');

const formatterOptionsCommon = {
  semi: true,
  endOfLine: 'lf',
  singleQuote: true,
  jsxSingleQuote: true,
  parser: 'typescript',
} as const satisfies prettier.Options;

export const formatterOptionsDefault = {
  ...formatterOptionsCommon,
  plugins: [
    'prettier-plugin-organize-imports',
    'prettier-plugin-packagejson',
    'prettier-plugin-jsdoc',
  ],
  printWidth: 80,
} as const satisfies prettier.Options;

export const formatterOptionsForCopied = {
  ...formatterOptionsCommon,
  plugins: ['prettier-plugin-jsdoc'],
  printWidth: 320,
} as const satisfies prettier.Options;
