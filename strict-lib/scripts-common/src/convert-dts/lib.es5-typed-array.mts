import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '../functions/utils/node-utils.mjs';
import {
  closeBraceRegexp,
  enumType,
  typedArrayInterfaceStartRegexp,
  typedArrayThisCaptureRegexSource,
  wrapTolerant,
  type ConverterOptions,
} from './common.mjs';
import {
  BYTES_PER_ELEMENT,
  convertTypedArrayCommon,
  typedArrayNumberElemTypes,
  typedArrayTypeToElemType,
  type TypedArrayElemType,
} from './lib.typed-array-common.mjs';

export const convertInterfaceTypedArray = (
  options: ConverterOptions,
  elementTypeArg: TypedArrayElemType,
): MonoTypeFunction<string> => {
  const {
    brandedNumber,
    config: { useBrandedNumber },
  } = options;

  const elementType = typedArrayTypeToElemType(
    elementTypeArg,
    useBrandedNumber,
  );

  // TS 5.7+ writes `array: this` / `obj: this`; pre-5.7 writes
  // `array: ${typeName}Array` / `obj: ${typeName}Array`. Capture the original
  // token so each version's output keeps the form it had upstream.
  const tName = `${elementTypeArg}Array` as const;

  const thisCap = typedArrayThisCaptureRegexSource(tName);

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
      new RegExp(
        wrapTolerant(
          String.raw`callbackfn: \(value: number, index: number, array: ${thisCap}\) => number`,
        ),
        'gu',
      ),
      `callbackfn: (value: ${elementType}, index: ${brandedNumber.TypedArraySize}, array: $1) => ${elementType}`,
    ),
    replaceWithNoMatchCheck(
      new RegExp(
        wrapTolerant(
          String.raw`find\(predicate: \(value: number, index: number, obj: ${thisCap}\) => boolean, thisArg\?: unknown\): number \| undefined;`,
        ),
        'gu',
      ),
      `find(predicate: (value: ${elementType}, index: ${brandedNumber.TypedArraySize}, obj: $1) => boolean, thisArg?: unknown): ${elementType} | undefined;`,
    ),
    replaceWithNoMatchCheck(
      new RegExp(
        wrapTolerant(
          String.raw`findIndex\(predicate: \(value: number, index: number, obj: ${thisCap}\) => boolean, thisArg\?: unknown\): number;`,
        ),
        'gu',
      ),
      `findIndex(predicate: (value: ${elementType}, index: ${brandedNumber.TypedArraySize}, obj: $1) => boolean, thisArg?: unknown): ${brandedNumber.TypedArraySearchResult};`,
    ),
    replaceWithNoMatchCheck(
      new RegExp(
        wrapTolerant(
          String.raw`predicate: \(value: number, index: number, array: ${thisCap}\) => unknown`,
        ),
        'gu',
      ),
      `predicate: (value: ${elementType}, index: ${brandedNumber.TypedArraySize}, array: $1) => boolean`,
    ),
    replaceWithNoMatchCheck(
      new RegExp(
        wrapTolerant(
          String.raw`callbackfn: \(value: number, index: number, array: ${thisCap}\) => void`,
        ),
        'gu',
      ),
      `callbackfn: (value: ${elementType}, index: ${brandedNumber.TypedArraySize}, array: $1) => void`,
    ),
    replaceWithNoMatchCheck(
      // reduce / reduceRight
      new RegExp(
        wrapTolerant(
          String.raw`\(callbackfn: \(previousValue: number, currentValue: number, currentIndex: ${brandedNumber.TypedArraySize}, array: ${thisCap}\) => number\): number`,
        ),
        'gu',
      ),
      `(callbackfn: (previousValue: ${elementType}, currentValue: ${elementType}, currentIndex: ${brandedNumber.TypedArraySize}, array: $1) => ${elementType}): ${elementType}`,
    ),
    replaceWithNoMatchCheck(
      new RegExp(
        wrapTolerant(
          String.raw`callbackfn: \(previousValue: number, currentValue: number, currentIndex: ${brandedNumber.TypedArraySize}, array: ${thisCap}\) => number, initialValue: number\): number;`,
        ),
        'gu',
      ),
      `callbackfn: (previousValue: ${elementType}, currentValue: ${elementType}, currentIndex: ${brandedNumber.TypedArraySize}, array: $1) => ${elementType}, initialValue: ${elementType}): ${elementType};`,
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

export const convertLibEs5_TypedArray =
  (options: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        ...typedArrayNumberElemTypes.flatMap((elemType) => [
          replaceWithNoMatchCheckBetweenRegexp({
            startRegexp: typedArrayInterfaceStartRegexp(`${elemType}Array`),
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
              replaceWithNoMatchCheck(
                'readonly [index: number]: ',
                '[index: number]: ',
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
            // TS 5.7 made `begin` optional; earlier versions had it required.
            /slice\(begin\??: number, end\?: number\)/gu,
            `slice(begin?: ${options.brandedNumber.TypedArraySizeArg}, end?: ${options.brandedNumber.TypedArraySizeArg})`,
          ),
        }),

        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: typedArrayInterfaceStartRegexp('DataView'),
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
      ),
    ).value;
