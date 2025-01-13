import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-utils';
import { type ConverterOptions } from './common.mjs';

export const convertLibEs2019String =
  ({
    config: { commentOutDeprecated },
  }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).chainMonoTypeFns(
      ...(commentOutDeprecated
        ? (
            [
              //
              'trimLeft(): string;',
              'trimRight(): string;',
            ] as const
          ).map((line) =>
            // comment out deprecated functions
            replaceWithNoMatchCheck(
              //
              line,
              `// ${line}`,
            ),
          )
        : []),
    ).value;
