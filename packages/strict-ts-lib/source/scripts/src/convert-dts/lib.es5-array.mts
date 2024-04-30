import {
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { NumberType, closeBraceRegexp } from './common.mjs';

const markers = {
  ReadonlyArray: 'interface ReadonlyArray<T> {',
  Array: 'interface Array<T> {',
  ArrayConstructor: 'interface ArrayConstructor {',
  ConcatArray: 'interface ConcatArray<T> {',
  ArrayLike: 'interface ArrayLike<T> {',
};

export const convertLibEs5_Array = (
  source: string,
  commentOutDeprecated: boolean,
): string =>
  pipe(source)
    .chainMonoTypeFns(
      (['ReadonlyArray', 'Array'] as const).map((key) =>
        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: markers[key],
          endRegexp: closeBraceRegexp,
          mapFn: (slice) =>
            pipe(slice)
              .chain(
                // require predicate function to return boolean
                replaceWithNoMatchCheck(
                  'predicate: (value: T, index: number, array: readonly T[]) => unknown',
                  'predicate: (value: T, index: number, array: readonly T[]) => boolean',
                ),
              )
              .chain(
                replaceWithNoMatchCheck(
                  'index: number',
                  `index: ${NumberType.ArraySize}`,
                ),
              )
              .chain(
                replaceWithNoMatchCheck(
                  'searchElement: T, fromIndex?: number): number;',
                  `searchElement: T, fromIndex?: ${NumberType.ArraySizeArg}): ${NumberType.ArraySearchResult};`,
                ),
              )
              .chain(
                replaceWithNoMatchCheck(
                  'currentIndex: number',
                  `currentIndex: ${NumberType.ArraySize}`,
                ),
              ).value,
        }),
      ),
    )
    .chainMonoTypeFns(
      (['ReadonlyArray', 'ConcatArray', 'Array'] as const).map((key) =>
        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: markers[key],
          endRegexp: closeBraceRegexp,
          mapFn: (slice) =>
            pipe(slice).chain(
              replaceWithNoMatchCheck(
                'slice(start?: number, end?: number)',
                `slice(start?: ${NumberType.ArraySizeArg}, end?: ${NumberType.ArraySizeArg})`,
              ),
            ).value,
        }),
      ),
    )
    .chain(
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: markers.Array,
        endRegexp: closeBraceRegexp,
        mapFn: (slice) =>
          pipe(slice)
            .chain(
              replaceWithNoMatchCheck(
                //
                `start: number`,
                `start: ${NumberType.ArraySizeArg}`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                `deleteCount?: number`,
                `deleteCount?: ${NumberType.ArraySizeArgNonNegative}`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                `deleteCount: number`,
                `deleteCount: ${NumberType.ArraySizeArgNonNegative}`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                `unshift(...items: readonly T[]): number;`,
                `unshift(...items: readonly T[]): ${NumberType.ArraySize};`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                'push(...items: readonly T[]): number;',
                `push(...items: readonly T[]): ${NumberType.ArraySize};`,
              ),
            )
            .chain(
              // remove readonly from Array index signature
              replaceWithNoMatchCheck(
                //
                'readonly [n: number]',
                '[n: number]',
              ),
            )
            .chain(
              // revert eslint fix
              replaceWithNoMatchCheck(
                //
                'this is readonly S[]',
                'this is S[]',
              ),
            ).value,
      }),
    )
    .chain(
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: markers.ArrayConstructor,
        endRegexp: closeBraceRegexp,
        mapFn: (slice) =>
          pipe(slice)
            .chain(
              replaceWithNoMatchCheck(
                `  new (arrayLength?: number): readonly unknown[];`,
                [
                  '/** @deprecated use `Array.from({ length })` instead */\n',
                  commentOutDeprecated ? '// ' : '',
                  `new (arrayLength?: ${NumberType.NewArrayMaxSize}): unknown[];`,
                ].join(''),
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                `  new <T>(arrayLength: number): readonly T[];`,
                [
                  '/** @deprecated use `Array.from({ length })` instead */\n',
                  commentOutDeprecated ? '// ' : '',
                  `new <T>(arrayLength: ${NumberType.NewArrayMaxSize}): T[];`,
                ].join(''),
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                `  new <T>(...items: readonly T[]): readonly T[];`,
                [
                  '/** @deprecated use `[...items]` instead */\n',
                  commentOutDeprecated ? '// ' : '',
                  `new <T>(...items: readonly T[]): T[];`,
                ].join(''),
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                `  (arrayLength?: number): readonly unknown[];`,
                [
                  '/** @deprecated use `Array.from({ length })` instead */\n',
                  commentOutDeprecated ? '// ' : '',
                  `(arrayLength?: ${NumberType.NewArrayMaxSize}): unknown[];`,
                ].join(''),
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                `  <T>(arrayLength: number): readonly T[];`,
                [
                  '/** @deprecated use `Array.from({ length })` instead */\n',
                  commentOutDeprecated ? '// ' : '',
                  `<T>(arrayLength: ${NumberType.NewArrayMaxSize}): T[];`,
                ].join(''),
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                `  <T>(...items: readonly T[]): readonly T[];`,
                [
                  '/** @deprecated use `[...items]` instead */\n',
                  commentOutDeprecated ? '// ' : '',
                  `<T>(...items: readonly T[]): T[];`,
                ].join(''),
              ),
            ).value,
      }),
    ).value;
