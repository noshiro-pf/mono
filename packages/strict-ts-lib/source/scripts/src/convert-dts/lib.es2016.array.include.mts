import {
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { NumberType, closeBraceRegexp } from './common.mjs';

export const convertLibEs2016ArrayInclude = (source: string): string =>
  pipe(source)
    .chainMonoTypeFns(
      (['Array', 'ReadonlyArray'] as const).map((typeName) =>
        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: `interface ${typeName}<T> {`,
          endRegexp: closeBraceRegexp,
          mapFn: replaceWithNoMatchCheck(
            // change Array.includes() to accept widen literal types
            'includes(searchElement: T, fromIndex?: number): boolean;',
            `includes(searchElement: T | (WidenLiteral<T> & {}), fromIndex?: ${NumberType.ArraySizeArg}): searchElement is T;`,
          ),
        }),
      ),
    )
    .chainMonoTypeFns(
      (
        [
          ['Int8Array', 'Int8'],
          ['Uint8Array', 'Uint8'],
          ['Uint8ClampedArray', 'Uint8'],
          ['Int16Array', 'Int16'],
          ['Uint16Array', 'Uint16'],
          ['Int32Array', 'Int32'],
          ['Uint32Array', 'Uint32'],
          ['Float32Array', 'Float32'],
          ['Float64Array', 'Float64'],
        ] as const
      ).map(([typeName, elemType]) =>
        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: `interface ${typeName} {`,
          endRegexp: closeBraceRegexp,
          mapFn: replaceWithNoMatchCheck(
            '  includes(searchElement: number, fromIndex?: number): boolean;',
            `  includes(searchElement: ${elemType}, fromIndex?: ${NumberType.TypedArraySizeArg}): boolean;`,
          ),
        }),
      ),
    ).value;
