import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
} from '@noshiro/mono-scripts';
import { type ConverterOptions } from './common.mjs';

export const convertLibEs2019String = ({
  config: { commentOutDeprecated },
}: ConverterOptions): MonoTypeFunction<string> =>
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
  );
