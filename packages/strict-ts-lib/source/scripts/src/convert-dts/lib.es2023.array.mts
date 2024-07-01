import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { closeBraceRegexp, type ConverterOptions } from './common.mjs';
import {
  typedArrayBigIntElemTypes,
  typedArrayElemTypes,
  typedArrayTypeToElemType,
} from './lib.typed-array-common.mjs';

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

const arrayTypes = ['Array', 'ReadonlyArray'] as const satisfies readonly (
  | 'Array'
  | 'ReadonlyArray'
)[];

export const convertLibEs2023Array = ({
  brandedNumber,
  config: { useBrandedNumber },
}: ConverterOptions): MonoTypeFunction<string> =>
  composeMonoTypeFns(
    ...arrayTypes.map((type) =>
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: markers[type],
        endRegexp: closeBraceRegexp,
        mapFn: composeMonoTypeFns(
          replaceWithNoMatchCheck(
            `index: number`,
            `index: ${brandedNumber.ArraySize}`,
          ),
          replaceWithNoMatchCheck(
            //
            `): number;`,
            `): ${brandedNumber.ArraySearchResult};`,
          ),
          replaceWithNoMatchCheck(
            `start: number`,
            `start: ${brandedNumber.ArraySizeArg}`,
          ),
          replaceWithNoMatchCheck(
            `deleteCount: number`,
            `deleteCount: ${brandedNumber.ArraySizeArg}`,
          ),
          replaceWithNoMatchCheck(
            `deleteCount?: number`,
            `deleteCount?: ${brandedNumber.ArraySizeArg}`,
          ),
        ),
      }),
    ),
    replaceWithNoMatchCheckBetweenRegexp({
      startRegexp: markers.Array,
      endRegexp: closeBraceRegexp,
      mapFn: composeMonoTypeFns(
        replaceWithNoMatchCheck(
          // TODO: remove if fixed
          'Copies an array and removes elements and, if necessary, inserts new elements in their place. Returns the copied array.',
          'Copies an array and removes elements while, if necessary, inserting new elements in their place, returning the remaining elements.',
        ),
        replaceWithNoMatchCheck(
          // TODO: remove if fixed
          '@returns The copied array.',
          '@returns A copy of the original array with the remaining elements.',
        ),
      ),
    }),

    replaceWithNoMatchCheckBetweenRegexp({
      startRegexp: markers.ReadonlyArray,
      endRegexp: closeBraceRegexp,
      mapFn: composeMonoTypeFns(
        replaceWithNoMatchCheck(
          // TODO: remove if fixed
          'Copies the array and returns the copied array with all of its elements reversed',
          'Returns a copy of an array with its elements reversed',
        ),
        replaceWithNoMatchCheck(
          // TODO: remove if fixed
          '@param value The value to insert into the copied array.',
          '@param value The value to write into the copied array.',
        ),
        replaceWithNoMatchCheck(
          // TODO: remove if fixed
          '@returns A copy of the original array with the inserted value.',
          '@returns The copied array with the updated value.',
        ),
      ),
    }),

    ...typedArrayElemTypes.map((elemType) =>
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: markers[elemType],
        endRegexp: closeBraceRegexp,
        mapFn: composeMonoTypeFns(
          replaceWithNoMatchCheck(
            // TODO: remove if fixed
            `   * Copies the array and inserts the given number at the provided index.`,
            [
              '   * Copies an array, then overwrites the value at the provided index with the',
              '   * given value. If the index is negative, then it replaces from the end',
              '   * of the array.',
            ].join('\n'),
          ),
          replaceWithNoMatchCheck(
            'findLast<S extends number>',
            `findLast<S extends ${typedArrayTypeToElemType(elemType, useBrandedNumber)}>`,
          ),
          replaceWithNoMatchCheck(
            'toSorted(compareFn?: (a: number, b: number) => number)',
            `toSorted(compareFn?: (a: ${typedArrayTypeToElemType(elemType, useBrandedNumber)}, b: ${typedArrayTypeToElemType(elemType, useBrandedNumber)}) => number)`,
          ),
          replaceWithNoMatchCheck(
            'with(index: number, value: number)',
            `with(index: ${brandedNumber.TypedArraySize}, value: ${typedArrayTypeToElemType(elemType, useBrandedNumber)})`,
          ),
          replaceWithNoMatchCheck(
            'value: number,',
            `value: ${typedArrayTypeToElemType(elemType, useBrandedNumber)},`,
          ),
          replaceWithNoMatchCheck(
            `index: number`,
            `index: ${brandedNumber.TypedArraySize}`,
          ),
          replaceWithNoMatchCheck(
            '): number | undefined;',
            `): ${typedArrayTypeToElemType(elemType, useBrandedNumber)} | undefined;`,
          ),
          replaceWithNoMatchCheck(
            //
            `): number;`,
            `): ${brandedNumber.TypedArraySearchResult};`,
          ),
        ),
      }),
    ),

    ...typedArrayBigIntElemTypes.map((elemType) =>
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: markers[elemType],
        endRegexp: closeBraceRegexp,
        mapFn: composeMonoTypeFns(
          replaceWithNoMatchCheck(
            `index: number`,
            `index: ${brandedNumber.TypedArraySize}`,
          ),
          replaceWithNoMatchCheck(
            `): number;`,
            `): ${brandedNumber.TypedArraySearchResult};`,
          ),
          replaceWithNoMatchCheck(
            // TODO: remove if fixed
            `   * Copies the array and inserts the given bigint at the provided index.`,
            [
              '   * Copies an array, then overwrites the value at the provided index with the',
              '   * given value. If the index is negative, then it replaces from the end',
              '   * of the array.',
            ].join('\n'),
          ),
          replaceWithNoMatchCheck(`bigint`, elemType),
        ),
      }),
    ),

    ...([...typedArrayElemTypes, ...typedArrayBigIntElemTypes] as const).map(
      (elemType) =>
        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: markers[elemType],
          endRegexp: closeBraceRegexp,
          mapFn: composeMonoTypeFns(
            replaceWithNoMatchCheck(
              // TODO: remove if fixed
              'Copies the array and returns the copy with the elements in reverse order.',
              'Returns a copy of an array with its elements reversed.',
            ),
            replaceWithNoMatchCheck(
              // TODO: remove if fixed
              '@param value The value to insert into the copied array.',
              '@param value The value to write into the copied array.',
            ),
            replaceWithNoMatchCheck(
              // TODO: remove if fixed
              '@returns A copy of the original array with the inserted value.',
              '@returns The copied array with the updated value.',
            ),
          ),
        }),
    ),

    replaceWithNoMatchCheck(
      // TODO: remove if fixed
      'Copies and sorts the array.',
      'Returns a copy of an array with its elements sorted.', // use the same description with Array
    ),
  );
