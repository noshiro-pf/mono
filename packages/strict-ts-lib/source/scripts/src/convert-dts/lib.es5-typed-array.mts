import {
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { NumberType, closeBraceRegexp } from './common.mjs';
import { convertTypedArrayCommon } from './lib.typed-array-common.mjs';

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

export const convertLibEs5_TypedArray = (source: string): string =>
  pipe(source)
    .chainMonoTypeFns(
      (
        [
          'Int8',
          'Uint8',
          'Uint8Clamped',
          'Int16',
          'Uint16',
          'Int32',
          'Uint32',
          'Float32',
          'Float64',
        ] as const satisfies readonly ElemType[]
      ).flatMap((elemType) => [
        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: `interface ${elemType}Array {`,
          endRegexp: closeBraceRegexp,
          mapFn: (slice) =>
            pipe(slice)
              .chain((s) => convertInterfaceTypedArray(s, elemType))
              .chain(
                replaceWithNoMatchCheck(
                  //
                  'if first',
                  'if the first',
                ),
              )
              .chain(
                replaceWithNoMatchCheck(
                  'than second argument',
                  'than the second argument',
                ),
              )
              .chain(
                replaceWithNoMatchCheck(
                  //
                  'equal and',
                  'equal, and',
                ),
              )
              .chain(
                replaceWithNoMatchCheck(
                  'byteLength: number',
                  `byteLength: ${NumberType.SafeUint}`,
                ),
              )
              .chain(
                replaceWithNoMatchCheck(
                  'byteOffset: number',
                  `byteOffset: ${NumberType.SafeUint}`,
                ),
              ).value,
        }),
        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: `interface ${elemType}ArrayConstructor {`,
          endRegexp: closeBraceRegexp,
          mapFn: (slice) =>
            convertInterfaceTypedArrayConstructor(slice, elemType),
        }),
      ]),
    )
    .chainMonoTypeFns([
      // DataView
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface ArrayBuffer {',
        endRegexp: closeBraceRegexp,
        mapFn: replaceWithNoMatchCheck(
          `slice(begin: number, end?: number)`,
          `slice(begin: ${NumberType.TypedArraySizeArg}, end?: ${NumberType.TypedArraySizeArg})`,
        ),
      }),
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface DataView {',
        endRegexp: closeBraceRegexp,
        mapFn: convertDataView,
      }),
    ]).value;

const convertInterfaceTypedArray = (
  source: string,
  elementTypeArg: ElemType,
): string => {
  const arrayType = `${elementTypeArg}Array`;

  const elementType =
    elementTypeArg === 'Uint8Clamped' ? 'Uint8' : elementTypeArg;

  return pipe(source)
    .chain(convertTypedArrayCommon)
    .chain(
      replaceWithNoMatchCheck(
        `readonly [index: number]: number;`,
        `readonly [index: number]: ${elementType};`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'compareFn?: (a: number, b: number) => number',
        `compareFn?: (a: ${elementType}, b: ${elementType}) => number`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'set(array: ArrayLike<number>',
        `set(array: ArrayLike<${elementType}>`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        `callbackfn: (value: number, index: number, array: ${arrayType}) => number`,
        `callbackfn: (value: ${elementType}, index: ${NumberType.TypedArraySize}, array: ${arrayType}) => ${elementType}`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        `find(predicate: (value: number, index: number, obj: ${arrayType}) => boolean, thisArg?: unknown): number | undefined;`,
        `find(predicate: (value: ${elementType}, index: ${NumberType.TypedArraySize}, obj: ${arrayType}) => boolean, thisArg?: unknown): ${elementType} | undefined;`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        `findIndex(predicate: (value: number, index: number, obj: ${arrayType}) => boolean, thisArg?: unknown): number;`,
        `findIndex(predicate: (value: ${elementType}, index: ${NumberType.TypedArraySize}, obj: ${arrayType}) => boolean, thisArg?: unknown): ${NumberType.TypedArraySearchResult};`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        `predicate: (value: number, index: number, array: ${arrayType}) => unknown`,
        `predicate: (value: ${elementType}, index: ${NumberType.TypedArraySize}, array: ${arrayType}) => boolean`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        `callbackfn: (value: number, index: number, array: ${arrayType}) => void`,
        `callbackfn: (value: ${elementType}, index: ${NumberType.TypedArraySize}, array: ${arrayType}) => void`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        // reduce / reduceRight
        `(callbackfn: (previousValue: number, currentValue: number, currentIndex: ${NumberType.TypedArraySize}, array: ${arrayType}) => number): number`,
        `(callbackfn: (previousValue: ${elementType}, currentValue: ${elementType}, currentIndex: ${NumberType.TypedArraySize}, array: ${arrayType}) => ${elementType}): ${elementType}`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        `callbackfn: (previousValue: number, currentValue: number, currentIndex: ${NumberType.TypedArraySize}, array: ${arrayType}) => number, initialValue: number): number;`,
        `callbackfn: (previousValue: ${elementType}, currentValue: ${elementType}, currentIndex: ${NumberType.TypedArraySize}, array: ${arrayType}) => ${elementType}, initialValue: ${elementType}): ${elementType};`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'currentValue: number',
        `currentValue: ${elementType}`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        `fill(value: number, start?: number, end?: number)`,
        `fill(value: ${elementType}, start?: ${NumberType.TypedArraySizeArg}, end?: ${NumberType.TypedArraySizeArg})`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        `searchElement: number`,
        `searchElement: ${elementType}`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        `fromIndex?: ${NumberType.TypedArraySizeArg}): number;`,
        `fromIndex?: ${NumberType.TypedArraySizeArg}): ${NumberType.TypedArraySearchResult};`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        //
        '/**',
        '\n\n/**',
      ),
    ).value;
};

const Uint8ClampedToUint8 = (s: ElemType): Exclude<ElemType, 'Uint8Clamped'> =>
  s === 'Uint8Clamped' ? 'Uint8' : s;

const convertInterfaceTypedArrayConstructor = (
  source: string,
  elementType: ElemType,
): string =>
  pipe(source)
    .chain(
      replaceWithNoMatchCheck(
        `byteOffset?: number`,
        `byteOffset?: ${NumberType.SafeUint}`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        `readonly BYTES_PER_ELEMENT: number;`,
        `readonly BYTES_PER_ELEMENT: ${BYTES_PER_ELEMENT(elementType)};`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        `new (array: ArrayLike<number>`,
        `new (array: ArrayLike<${Uint8ClampedToUint8(elementType)}>`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        //
        `length: number`,
        `length: ${NumberType.TypedArraySize}`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        //
        `length?: number`,
        `length?: ${NumberType.TypedArraySize}`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        `mapfn: (v: T, k: number) => number,`,
        `mapfn: (v: T, k: ${NumberType.TypedArraySize}) => ${Uint8ClampedToUint8(elementType)},`,
      ),
    )
    .chain(replaceWithNoMatchCheck('number', Uint8ClampedToUint8(elementType)))
    .value;

const BYTES_PER_ELEMENT = (elementType: ElemType): 1 | 2 | 4 | 8 => {
  switch (elementType) {
    case 'Int8':
      return 1;
    case 'Int16':
      return 2;
    case 'Int32':
      return 4;
    case 'Uint8Clamped':
    case 'Uint8':
      return 1;
    case 'Uint16':
      return 2;
    case 'Uint32':
      return 4;
    case 'Float32':
      return 4;
    case 'Float64':
      return 8;
  }
};

const convertDataView = (source: string): string =>
  pipe(source)
    .chainMonoTypeFns(
      (
        [
          ['getInt8', 'Int8'],
          ['getUint8', 'Uint8'],
        ] as const
      ).map(([fn, valueType]) =>
        replaceWithNoMatchCheck(
          `${fn}(byteOffset: number): number;`,
          `${fn}(byteOffset: ${NumberType.SafeUint}): ${valueType};`,
        ),
      ),
    )
    .chainMonoTypeFns(
      (
        [
          ['getInt16', 'Int16'],
          ['getUint16', 'Uint16'],
          ['getInt32', 'Int32'],
          ['getUint32', 'Uint32'],
          ['getFloat32', 'Float32'],
          ['getFloat64', 'Float64'],
        ] as const
      ).map(([fn, valueType]) =>
        replaceWithNoMatchCheck(
          `${fn}(byteOffset: number, littleEndian?: boolean): number;`,
          `${fn}(byteOffset: ${NumberType.SafeUint}, littleEndian?: boolean): ${valueType};`,
        ),
      ),
    )
    .chainMonoTypeFns(
      (
        [
          ['setInt8', 'Int8'],
          ['setUint8', 'Uint8'],
        ] as const
      ).map(([fn, valueType]) =>
        replaceWithNoMatchCheck(
          `${fn}(byteOffset: number, value: number): void;`,
          `${fn}(byteOffset: ${NumberType.SafeUint}, value: ${valueType}): void;`,
        ),
      ),
    )
    .chainMonoTypeFns(
      (
        [
          ['setInt16', 'Int16'],
          ['setUint16', 'Uint16'],
          ['setInt32', 'Int32'],
          ['setUint32', 'Uint32'],
          ['setFloat32', 'Float32'],
          ['setFloat64', 'Float64'],
        ] as const
      ).map(([fn, valueType]) =>
        replaceWithNoMatchCheck(
          `${fn}(byteOffset: number, value: number, littleEndian?: boolean): void;`,
          `${fn}(byteOffset: ${NumberType.SafeUint}, value: ${valueType}, littleEndian?: boolean): void;`,
        ),
      ),
    ).value;
