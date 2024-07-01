import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import {
  closeBraceRegexp,
  enumType,
  type ConverterOptions,
} from './common.mjs';
import {
  BYTES_PER_ELEMENT,
  convertTypedArrayCommon,
  typedArrayElemTypes,
  typedArrayTypeToElemType,
  type TypedArrayElemType,
} from './lib.typed-array-common.mjs';

const convertInterfaceTypedArray = (
  options: ConverterOptions,
  elementTypeArg: TypedArrayElemType,
): MonoTypeFunction<string> => {
  const arrayType = `${elementTypeArg}Array`;

  const {
    brandedNumber,
    config: { useBrandedNumber },
  } = options;

  const elementType = typedArrayTypeToElemType(
    elementTypeArg,
    useBrandedNumber,
  );

  return composeMonoTypeFns(
    convertTypedArrayCommon(options),
    replaceWithNoMatchCheck(
      `[index: number]: number;`,
      `[index: number]: ${elementType};`,
    ),
    replaceWithNoMatchCheck(
      'compareFn?: (a: number, b: number) => number',
      `compareFn?: (a: ${elementType}, b: ${elementType}) => number`,
    ),
    replaceWithNoMatchCheck(
      'set(array: ArrayLike<number>',
      `set(array: ArrayLike<${elementType}>`,
    ),
    replaceWithNoMatchCheck(
      `callbackfn: (value: number, index: number, array: ${arrayType}) => number`,
      `callbackfn: (value: ${elementType}, index: ${brandedNumber.TypedArraySize}, array: ${arrayType}) => ${elementType}`,
    ),
    replaceWithNoMatchCheck(
      `find(predicate: (value: number, index: number, obj: ${arrayType}) => boolean, thisArg?: unknown): number | undefined;`,
      `find(predicate: (value: ${elementType}, index: ${brandedNumber.TypedArraySize}, obj: ${arrayType}) => boolean, thisArg?: unknown): ${elementType} | undefined;`,
    ),
    replaceWithNoMatchCheck(
      `findIndex(predicate: (value: number, index: number, obj: ${arrayType}) => boolean, thisArg?: unknown): number;`,
      `findIndex(predicate: (value: ${elementType}, index: ${brandedNumber.TypedArraySize}, obj: ${arrayType}) => boolean, thisArg?: unknown): ${brandedNumber.TypedArraySearchResult};`,
    ),
    replaceWithNoMatchCheck(
      `predicate: (value: number, index: number, array: ${arrayType}) => unknown`,
      `predicate: (value: ${elementType}, index: ${brandedNumber.TypedArraySize}, array: ${arrayType}) => boolean`,
    ),
    replaceWithNoMatchCheck(
      `callbackfn: (value: number, index: number, array: ${arrayType}) => void`,
      `callbackfn: (value: ${elementType}, index: ${brandedNumber.TypedArraySize}, array: ${arrayType}) => void`,
    ),
    replaceWithNoMatchCheck(
      // reduce / reduceRight
      `(callbackfn: (previousValue: number, currentValue: number, currentIndex: ${brandedNumber.TypedArraySize}, array: ${arrayType}) => number): number`,
      `(callbackfn: (previousValue: ${elementType}, currentValue: ${elementType}, currentIndex: ${brandedNumber.TypedArraySize}, array: ${arrayType}) => ${elementType}): ${elementType}`,
    ),
    replaceWithNoMatchCheck(
      `callbackfn: (previousValue: number, currentValue: number, currentIndex: ${brandedNumber.TypedArraySize}, array: ${arrayType}) => number, initialValue: number): number;`,
      `callbackfn: (previousValue: ${elementType}, currentValue: ${elementType}, currentIndex: ${brandedNumber.TypedArraySize}, array: ${arrayType}) => ${elementType}, initialValue: ${elementType}): ${elementType};`,
    ),
    replaceWithNoMatchCheck(
      'currentValue: number',
      `currentValue: ${elementType}`,
    ),
    replaceWithNoMatchCheck(
      `fill(value: number, start?: number, end?: number)`,
      `fill(value: ${elementType}, start?: ${brandedNumber.TypedArraySizeArg}, end?: ${brandedNumber.TypedArraySizeArg})`,
    ),
    replaceWithNoMatchCheck(
      `searchElement: number`,
      `searchElement: ${elementType}`,
    ),
    replaceWithNoMatchCheck(
      `fromIndex?: ${brandedNumber.TypedArraySizeArg}): number;`,
      `fromIndex?: ${brandedNumber.TypedArraySizeArg}): ${brandedNumber.TypedArraySearchResult};`,
    ),
    replaceWithNoMatchCheck(
      //
      '/**',
      '\n\n/**',
    ),
  );
};

export const convertLibEs5_TypedArray = (
  options: ConverterOptions,
): MonoTypeFunction<string> =>
  composeMonoTypeFns(
    ...typedArrayElemTypes.flatMap((elemType) => [
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: `interface ${elemType}Array {`,
        endRegexp: closeBraceRegexp,
        mapFn: composeMonoTypeFns(
          convertInterfaceTypedArray(options, elemType),
          replaceWithNoMatchCheck(
            //
            'if first',
            'if the first',
          ),
          replaceWithNoMatchCheck(
            'than second argument',
            'than the second argument',
          ),
          replaceWithNoMatchCheck(
            //
            'equal and',
            'equal, and',
          ),
          replaceWithNoMatchCheck(
            `BYTES_PER_ELEMENT: number;`,
            `BYTES_PER_ELEMENT: ${BYTES_PER_ELEMENT(elemType)};`,
          ),
          replaceWithNoMatchCheck(
            'byteLength: number',
            `byteLength: ${options.brandedNumber.TypedArraySize}`,
          ),
          replaceWithNoMatchCheck(
            'byteOffset: number',
            `byteOffset: ${options.brandedNumber.TypedArraySize}`,
          ),
        ),
      }),

      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: `interface ${elemType}ArrayConstructor {`,
        endRegexp: closeBraceRegexp,
        mapFn: composeMonoTypeFns(
          replaceWithNoMatchCheck(
            `byteOffset?: number`,
            `byteOffset?: ${options.brandedNumber.TypedArraySize}`,
          ),
          replaceWithNoMatchCheck(
            `BYTES_PER_ELEMENT: number;`,
            `BYTES_PER_ELEMENT: ${BYTES_PER_ELEMENT(elemType)};`,
          ),
          replaceWithNoMatchCheck(
            `new (array: ArrayLike<number>`,
            `new (array: ArrayLike<${typedArrayTypeToElemType(elemType, options.config.useBrandedNumber)}>`,
          ),
          replaceWithNoMatchCheck(
            //
            `length: number`,
            `length: ${options.brandedNumber.TypedArraySize}`,
          ),
          replaceWithNoMatchCheck(
            //
            `length?: number`,
            `length?: ${options.brandedNumber.TypedArraySize}`,
          ),
          replaceWithNoMatchCheck(
            `mapfn: (v: T, k: number) => number,`,
            `mapfn: (v: T, k: ${options.brandedNumber.TypedArraySize}) => ${typedArrayTypeToElemType(elemType, options.config.useBrandedNumber)},`,
          ),
          replaceWithNoMatchCheck(
            `of(...items: readonly number[])`,
            `of(...items: readonly ${typedArrayTypeToElemType(elemType, options.config.useBrandedNumber)}[])`,
          ),
          replaceWithNoMatchCheck(
            `from(arrayLike: ArrayLike<number>)`,
            `from(arrayLike: ArrayLike<${typedArrayTypeToElemType(elemType, options.config.useBrandedNumber)}>)`,
          ),
        ),
      }),
    ]),

    // DataView
    replaceWithNoMatchCheckBetweenRegexp({
      startRegexp: 'interface ArrayBuffer {',
      endRegexp: closeBraceRegexp,
      mapFn: replaceWithNoMatchCheck(
        `slice(begin: number, end?: number)`,
        `slice(begin: ${options.brandedNumber.TypedArraySizeArg}, end?: ${options.brandedNumber.TypedArraySizeArg})`,
      ),
    }),

    replaceWithNoMatchCheckBetweenRegexp({
      startRegexp: 'interface DataView {',
      endRegexp: closeBraceRegexp,
      mapFn: composeMonoTypeFns(
        ...(
          [
            ['getInt8', enumType.Int8],
            ['getUint8', enumType.Uint8],
          ] as const
        ).map(([fn, valueType]) =>
          replaceWithNoMatchCheck(
            `${fn}(byteOffset: number): number;`,
            `${fn}(byteOffset: ${options.brandedNumber.TypedArraySizeArg}): ${valueType};`,
          ),
        ),

        ...(
          [
            ['getInt16', options.brandedNumber.Int16],
            ['getUint16', options.brandedNumber.Uint16],
            ['getInt32', options.brandedNumber.Int32],
            ['getUint32', options.brandedNumber.Uint32],
            ['getFloat32', options.brandedNumber.Float32],
            ['getFloat64', options.brandedNumber.Float64],
          ] as const
        ).map(([fn, valueType]) =>
          replaceWithNoMatchCheck(
            `${fn}(byteOffset: number, littleEndian?: boolean): number;`,
            `${fn}(byteOffset: ${options.brandedNumber.TypedArraySizeArg}, littleEndian?: boolean): ${valueType};`,
          ),
        ),

        ...(
          [
            ['setInt8', enumType.Int8],
            ['setUint8', enumType.Uint8],
          ] as const
        ).map(([fn, valueType]) =>
          replaceWithNoMatchCheck(
            `${fn}(byteOffset: number, value: number): void;`,
            `${fn}(byteOffset: ${options.brandedNumber.TypedArraySizeArg}, value: ${valueType}): void;`,
          ),
        ),

        ...(
          [
            ['setInt16', options.brandedNumber.Int16],
            ['setUint16', options.brandedNumber.Uint16],
            ['setInt32', options.brandedNumber.Int32],
            ['setUint32', options.brandedNumber.Uint32],
            ['setFloat32', options.brandedNumber.Float32],
            ['setFloat64', options.brandedNumber.Float64],
          ] as const
        ).map(([fn, valueType]) =>
          replaceWithNoMatchCheck(
            `${fn}(byteOffset: number, value: number, littleEndian?: boolean): void;`,
            `${fn}(byteOffset: ${options.brandedNumber.TypedArraySizeArg}, value: ${valueType}, littleEndian?: boolean): void;`,
          ),
        ),
      ),
    }),

    replaceWithNoMatchCheckBetweenRegexp({
      startRegexp: 'interface DataViewConstructor {',
      endRegexp: closeBraceRegexp,
      mapFn: composeMonoTypeFns(
        replaceWithNoMatchCheck(
          'byteLength?: number',
          `byteLength?: ${options.brandedNumber.TypedArraySize}`,
        ),
        replaceWithNoMatchCheck(
          'byteOffset?: number',
          `byteOffset?: ${options.brandedNumber.TypedArraySize}`,
        ),
      ),
    }),
  );
