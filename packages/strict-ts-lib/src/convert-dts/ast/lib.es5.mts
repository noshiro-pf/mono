import { Lang, parse } from '@ast-grep/napi';
import { type Result } from '@noshiro/mono-utils';
import { type ConverterOptions } from '../common.mjs';
import { composeReplaceOperations } from './utils/index.mjs';

export const convertAstLibEs5 = (
  src: string,
  options: ConverterOptions,
): Result<string, string> => {
  const ast = parse(Lang.TypeScript, src);
  const root = ast.root();

  return composeReplaceOperations(root, [
    [
      'declare function parseInt(string: string, radix?: number): number;',
      `declare function parseInt(string: string, radix?: UintRange<2, 37>): ${options.config.numberType === 'normal' ? 'number' : `${options.brandedNumber.Int} | ${options.brandedNumber.NaNType}`};`,
    ],
    options.config.numberType === 'normal'
      ? undefined
      : [
          'declare function parseFloat(string: string): number;',
          `declare function parseFloat(string: string): number | ${options.brandedNumber.NaNType};`,
        ],
    // [
    //   'declare const NaN: number;',
    //   `declare const NaN: ${options.brandedNumber.NaNType};`,
    // ],
    // [
    //   'declare const Infinity: number;',
    //   `declare const Infinity: ${options.brandedNumber.POSITIVE_INFINITY};`,
    // ],
  ]);
};
