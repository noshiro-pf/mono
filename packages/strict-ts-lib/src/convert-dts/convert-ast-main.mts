import { pipe, Result } from '@noshiro/mono-utils';
import { type ConverterConfig } from '../constants.mjs';
import { convertAstCommonManual } from './ast/index.mjs';
import { createBrandedNumber, type ConverterOptions } from './common.mjs';

export const convertWithAst = (
  src: string,
  filename: string,
  converterConfig: ConverterConfig,
): Result<string, string> => {
  const _options: ConverterOptions = {
    config: converterConfig,
    readonlyModifier:
      converterConfig.returnType === 'mutable' ? '' : 'readonly ',
    brandedNumber: createBrandedNumber(converterConfig.numberType),
  } as const;

  return (
    // .chain((r) => {
    //   if (Result.isErr(r)) return r;
    //   const s = r.value;

    //   switch (filename) {
    //     case 'lib.es5.d.ts':
    //       return convertAstLibEs5(s, options);

    //     default:
    //       return Result.ok(s);
    //   }
    // }).value;
    // .chain((r) => (Result.isErr(r) ? r : convertAstCommon(r.value)))
    pipe(Result.ok(src)).chain((r) =>
      Result.isErr(r) ? r : convertAstCommonManual(r.value),
    ).value
  );
};
