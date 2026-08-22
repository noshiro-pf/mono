import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
} from '../functions/utils/node-utils.mjs';
import { type ConverterOptions } from './common.mjs';

export const convertLibEs2019String =
  ({
    config: { commentOutDeprecated },
  }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
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
      ),
    ).value;
