import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-scripts';
import { NumberType, converterOptions } from './common.mjs';

const { returnType } = converterOptions;

export const convertLibEs2019Array = (source: string): string =>
  pipe(source)
    .chain(
      replaceWithNoMatchCheck(
        'readonly readonly readonly readonly readonly readonly readonly readonly readonly readonly',
        '',
      ),
    )
    .chain(
      // use branded number type in index
      replaceWithNoMatchCheck(
        'index: number',
        `index: ${NumberType.ArraySize}`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        [
          '    flat<A, D extends number = 1>(',
          '        this: A,',
          '        depth?: D,',
          `    ): readonly FlatArray<A, D>[];`,
        ].join('\n'),
        [
          `    flat<A, D extends ${NumberType.ArraySizeArgNonNegative} = 1>(`,
          '        this: A,',
          '        depth?: D,',
          `    ): ${returnType === 'readonly' ? 'readonly ' : ''}FlatArray<A, D>[];`,
        ].join('\n'),
      ),
    ).value;
