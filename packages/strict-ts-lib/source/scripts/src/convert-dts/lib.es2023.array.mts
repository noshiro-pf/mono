import {
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { NumberType, closeBraceRegexp } from './common.mjs';

const markers = {
  Array: 'interface Array<T> {',
  ReadonlyArray: 'interface ReadonlyArray<T> {',
  Int8: 'interface Int8Array {',
  Uint8: 'interface Uint8Array {',
  Uint8Clamped: 'interface Uint8ClampedArray {',
  Int16: 'interface Int16Array {',
  Uint16: 'interface Uint16Array {',
  Int32: 'interface Int32Array {',
  Uint32: 'interface Uint32Array {',
  Float32: 'interface Float32Array {',
  Float64: 'interface Float64Array {',
  BigInt64: 'interface BigInt64Array {',
  BigUint64: 'interface BigUint64Array {',
} as const;

type ElemType =
  | 'Float32'
  | 'Float64'
  | 'Int8'
  | 'Int16'
  | 'Int32'
  | 'Uint8'
  | 'Uint8Clamped'
  | 'Uint16'
  | 'Uint32';

type BigintElemType = 'BigInt64' | 'BigUint64';

const typedArrayElemTypes: readonly ElemType[] = [
  'Int8',
  'Uint8',
  'Uint8Clamped',
  'Int16',
  'Uint16',
  'Int32',
  'Uint32',
  'Float32',
  'Float64',
];

const bigIntElemTypes = [
  'BigInt64',
  'BigUint64',
] as const satisfies readonly BigintElemType[];

const arrayTypes = ['Array', 'ReadonlyArray'] as const satisfies readonly (
  | 'Array'
  | 'ReadonlyArray'
)[];

export const convertLibEs2023Array = (source: string): string =>
  pipe(source)
    .chainMonoTypeFns(
      arrayTypes.map((type) =>
        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: markers[type],
          endRegexp: closeBraceRegexp,
          mapFn: (slice) =>
            pipe(slice)
              .chain(
                replaceWithNoMatchCheck(
                  `index: number`,
                  `index: ${NumberType.ArraySize}`,
                ),
              )
              .chain(
                replaceWithNoMatchCheck(
                  //
                  `): number;`,
                  `): ${NumberType.ArraySearchResult};`,
                ),
              )
              .chain(replaceWithNoMatchCheck('compareFn?', 'compareFn'))
              .chain(
                replaceWithNoMatchCheck(
                  `start: number`,
                  `start: ${NumberType.ArraySizeArg}`,
                ),
              )
              .chain(
                replaceWithNoMatchCheck(
                  `deleteCount: number`,
                  `deleteCount: ${NumberType.ArraySizeArg}`,
                ),
              )
              .chain(
                replaceWithNoMatchCheck(
                  `deleteCount?: number`,
                  `deleteCount?: ${NumberType.ArraySizeArg}`,
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
                // TODO: remove if fixed
                'Copies an array and removes elements and, if necessary, inserts new elements in their place. Returns the copied array.',
                'Copies an array and removes elements while, if necessary, inserting new elements in their place, returning the remaining elements.',
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                // TODO: remove if fixed
                '@returns The copied array.',
                '@returns A copy of the original array with the remaining elements.',
              ),
            ).value,
      }),
    )
    .chain(
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: markers.ReadonlyArray,
        endRegexp: closeBraceRegexp,
        mapFn: (slice) =>
          pipe(slice)
            .chain(
              replaceWithNoMatchCheck(
                // TODO: remove if fixed
                'Copies the array and returns the copied array with all of its elements reversed',
                'Returns a copy of an array with its elements reversed',
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                // TODO: remove if fixed
                '@param value The value to insert into the copied array.',
                '@param value The value to write into the copied array.',
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                // TODO: remove if fixed
                '@returns A copy of the original array with the inserted value.',
                '@returns The copied array with the updated value.',
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                // TODO: remove if fixed (missing ending ".")
                [
                  '     * Copies an array, then overwrites the value at the provided index with the',
                  '     * given value. If the index is negative, then it replaces from the end',
                  '     * of the array',
                ].join('\n'),
                [
                  '     * Copies an array, then overwrites the value at the provided index with the',
                  '     * given value. If the index is negative, then it replaces from the end',
                  '     * of the array.',
                ].join('\n'),
              ),
            ).value,
      }),
    )
    .chainMonoTypeFns(
      typedArrayElemTypes.map((elemType) =>
        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: markers[elemType],
          endRegexp: closeBraceRegexp,
          mapFn: (slice) =>
            pipe(slice)
              .chain(
                replaceWithNoMatchCheck(
                  `index: number`,
                  `index: ${NumberType.TypedArraySize}`,
                ),
              )
              .chain(
                replaceWithNoMatchCheck(
                  //
                  `): number;`,
                  `): ${NumberType.TypedArraySearchResult};`,
                ),
              )
              .chain(
                replaceWithNoMatchCheck(
                  // TODO: remove if fixed
                  `     * Copies the array and inserts the given number at the provided index.`,
                  [
                    '   * Copies an array, then overwrites the value at the provided index with the',
                    '   * given value. If the index is negative, then it replaces from the end',
                    '   * of the array.',
                  ].join('\n'),
                ),
              )
              .chain(
                replaceWithNoMatchCheck(
                  'number',
                  elemType === 'Uint8Clamped' ? 'Uint8' : elemType,
                ),
              ).value,
        }),
      ),
    )
    .chainMonoTypeFns(
      bigIntElemTypes.map((elemType) =>
        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: markers[elemType],
          endRegexp: closeBraceRegexp,
          mapFn: (slice) =>
            pipe(slice)
              .chain(
                replaceWithNoMatchCheck(
                  // TODO: remove if fixed
                  `   * Copies the array and inserts the given bigint at the provided index.`,
                  [
                    '   * Copies an array, then overwrites the value at the provided index with the',
                    '   * given value. If the index is negative, then it replaces from the end',
                    '   * of the array.',
                  ].join('\n'),
                ),
              )
              .chain(replaceWithNoMatchCheck(`bigint`, elemType)).value,
        }),
      ),
    )
    .chainMonoTypeFns(
      ([...typedArrayElemTypes, ...bigIntElemTypes] as const).map((elemType) =>
        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: markers[elemType],
          endRegexp: closeBraceRegexp,
          mapFn: (slice) =>
            pipe(slice)
              .chain(
                replaceWithNoMatchCheck(
                  // TODO: remove if fixed
                  'Copies the array and returns the copy with the elements in reverse order.',
                  'Returns a copy of an array with its elements reversed.',
                ),
              )
              .chain(
                replaceWithNoMatchCheck(
                  // TODO: remove if fixed
                  '@param value The value to insert into the copied array.',
                  '@param value The value to write into the copied array.',
                ),
              )
              .chain(
                replaceWithNoMatchCheck(
                  // TODO: remove if fixed
                  '@returns A copy of the original array with the inserted value.',
                  '@returns The copied array with the updated value.',
                ),
              ).value,
        }),
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        // TODO: remove if fixed
        'Copies and sorts the array.',
        'Returns a copy of an array with its elements sorted.', // use the same description with Array
      ),
    ).value;
