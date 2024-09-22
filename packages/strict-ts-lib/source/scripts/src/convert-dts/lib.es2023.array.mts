import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { closeBraceRegexp, type ConverterOptions } from './common.mjs';
import {
  typedArrayElemTypes,
  typedArrayTypeToElemBaseType,
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
            `findLast<S extends T>(predicate: (value: T, index: number, array: readonly T[]) => value is S, thisArg?: unknown): S | undefined;`,
            `findLast<S extends T>(predicate: (value: T, index: ${brandedNumber.ArraySize}, array: readonly T[]) => value is S, thisArg?: unknown): S | undefined;`,
          ),
          replaceWithNoMatchCheck(
            `findLast(predicate: (value: T, index: number, array: readonly T[]) => unknown, thisArg?: unknown): T | undefined;`,
            `findLast(predicate: (value: T, index: ${brandedNumber.ArraySize}, array: readonly T[]) => boolean, thisArg?: unknown): T | undefined;`,
          ),
          replaceWithNoMatchCheck(
            'findLastIndex(predicate: (value: T, index: number, array: readonly T[]) => unknown, thisArg?: unknown): number;',
            `findLastIndex(predicate: (value: T, index: ${brandedNumber.ArraySize}, array: readonly T[]) => boolean, thisArg?: unknown): ${brandedNumber.ArraySearchResult};`,
          ),
          replaceWithNoMatchCheck(
            'toSpliced(start: number, deleteCount: number, ...items: readonly T[]): readonly T[];',
            `toSpliced(start: ${brandedNumber.ArraySizeArg}, deleteCount: ${brandedNumber.ArraySizeArg}, ...items: readonly T[]): readonly T[];`,
          ),
          replaceWithNoMatchCheck(
            'toSpliced(start: number, deleteCount?: number): readonly T[];',
            `toSpliced(start: ${brandedNumber.ArraySizeArg}, deleteCount?: ${brandedNumber.ArraySizeArg}): readonly T[];`,
          ),
          replaceWithNoMatchCheck(
            `with(index: number, value: T): readonly T[];`,
            `with(index: ${brandedNumber.ArraySizeArg}, value: T): readonly T[];`,
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
            `   * Copies the array and inserts the given ${typedArrayTypeToElemBaseType(elemType)} at the provided index.`,
            [
              '   * Copies an array, then overwrites the value at the provided index with the',
              '   * given value. If the index is negative, then it replaces from the end',
              '   * of the array.',
            ].join('\n'),
          ),
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
          replaceWithNoMatchCheck(
            `findLast<S extends ${typedArrayTypeToElemBaseType(elemType)}>(predicate: (value: ${typedArrayTypeToElemBaseType(elemType)}, index: number, array: ${elemType}Array) => value is S, thisArg?: unknown): S | undefined;`,
            `findLast<S extends ${typedArrayTypeToElemType(elemType, useBrandedNumber)}>(predicate: (value: ${typedArrayTypeToElemType(elemType, useBrandedNumber)}, index: ${brandedNumber.TypedArraySize}, array: ${elemType}Array) => value is S, thisArg?: unknown): S | undefined;`,
          ),
          replaceWithNoMatchCheck(
            `findLast(predicate: (value: ${typedArrayTypeToElemBaseType(elemType)}, index: number, array: ${elemType}Array) => unknown, thisArg?: unknown): ${typedArrayTypeToElemBaseType(elemType)} | undefined;`,
            `findLast(predicate: (value: ${typedArrayTypeToElemType(elemType, useBrandedNumber)}, index: ${brandedNumber.TypedArraySize}, array: ${elemType}Array) => boolean, thisArg?: unknown): ${typedArrayTypeToElemType(elemType, useBrandedNumber)} | undefined;`,
          ),
          replaceWithNoMatchCheck(
            `findLastIndex(predicate: (value: ${typedArrayTypeToElemBaseType(elemType)}, index: number, array: ${elemType}Array) => unknown, thisArg?: unknown): number;`,
            `findLastIndex(predicate: (value: ${typedArrayTypeToElemType(elemType, useBrandedNumber)}, index: ${brandedNumber.TypedArraySize}, array: ${elemType}Array) => boolean, thisArg?: unknown): ${brandedNumber.TypedArraySearchResult};`,
          ),
          replaceWithNoMatchCheck(
            `toSorted(compareFn?: (a: ${typedArrayTypeToElemBaseType(elemType)}, b: ${typedArrayTypeToElemBaseType(elemType)}) => number)`,
            `toSorted(compareFn?: (a: ${typedArrayTypeToElemType(elemType, useBrandedNumber)}, b: ${typedArrayTypeToElemType(elemType, useBrandedNumber)}) => number)`,
          ),
          replaceWithNoMatchCheck(
            `with(index: number, value: ${typedArrayTypeToElemBaseType(elemType)})`,
            `with(index: ${brandedNumber.TypedArraySizeArg}, value: ${typedArrayTypeToElemType(elemType, useBrandedNumber)})`,
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
