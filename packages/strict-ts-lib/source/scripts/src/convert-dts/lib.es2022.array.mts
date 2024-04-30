import {
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { NumberType, closeBraceRegexp } from './common.mjs';

export const convertLibEs2022Array = (source: string): string =>
  pipe(source)
    .chain(
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface Array<T> {',
        endRegexp: closeBraceRegexp,
        mapFn: replaceWithNoMatchCheck(
          'at(index: number): T | undefined;',
          `at(index: ${NumberType.ArraySizeArg}): T | undefined;`,
        ),
      }),
    )
    .chain(
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface ReadonlyArray<T> {',
        endRegexp: closeBraceRegexp,
        mapFn: replaceWithNoMatchCheck(
          'at(index: number): T | undefined;',
          `at(index: ${NumberType.ArraySizeArg}): T | undefined`,
        ),
      }),
    )
    .chainMonoTypeFns(
      (
        [
          ['Int8Array', 'number', 'Int8'],
          ['Uint8Array', 'number', 'Uint8'],
          ['Uint8ClampedArray', 'number', 'Uint8'],
          ['Int16Array', 'number', 'Int16'],
          ['Uint16Array', 'number', 'Uint16'],
          ['Int32Array', 'number', 'Int32'],
          ['Uint32Array', 'number', 'Uint32'],
          ['Float32Array', 'number', 'Float32'],
          ['Float64Array', 'number', 'Float64'],
          ['BigInt64Array', 'bigint', 'BigInt64'],
          ['BigUint64Array', 'bigint', 'BigUint64'],
        ] as const
      ).map(([typeName, returnTypeBefore, returnTypeAfter]) =>
        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: `interface ${typeName} {`,
          endRegexp: closeBraceRegexp,
          mapFn: replaceWithNoMatchCheck(
            `  at(index: number): ${returnTypeBefore} | undefined;`,
            `  at(index: ${NumberType.TypedArraySizeArg}): ${returnTypeAfter} | undefined;`,
          ),
        }),
      ),
    ).value;
