import type * as prettier from 'prettier';

export const ignoreFormatting = (absoluteFilePath: string): boolean =>
  absoluteFilePath.includes('/diff/');

export const formatWithPrintWidth320 = (absoluteFilePath: string): boolean =>
  absoluteFilePath.includes('/temp/copied/') ||
  absoluteFilePath.includes('/temp/transformed/');

const formatterOptionsCommon = {
  semi: true,
  endOfLine: 'lf',
  singleQuote: true,
  jsxSingleQuote: true,
} as const satisfies prettier.Options;

export const formatterOptionsDefault = {
  ...formatterOptionsCommon,
  plugins: ['prettier-plugin-organize-imports', 'prettier-plugin-packagejson'],
  printWidth: 80,
} as const satisfies prettier.Options;

export const formatterOptionsForCopied = {
  ...formatterOptionsCommon,
  plugins: [],
  printWidth: 320,
} as const satisfies prettier.Options;
