import { expectType, pipe } from 'ts-data-forge';
import { type MonoTypeFunction, type StrictExclude } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
} from '../functions/utils/node-utils.mjs';
import { enumType, type ConverterOptions } from './common.mjs';

export const convertTypedArrayCommon =
  ({ brandedNumber }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        replaceWithNoMatchCheck(
          // TS 5.5+ requires `start: number`; TS 5.4 and earlier have `start?: number`.
          /copyWithin\(target: number, start\??: number, end\?: number\): this;/gu,
          `copyWithin(target: ${brandedNumber.TypedArraySizeArg}, start: ${brandedNumber.TypedArraySizeArg}, end?: ${brandedNumber.TypedArraySizeArg}): this;`,
        ),
        replaceWithNoMatchCheck(
          'subarray(begin?: number, end?: number)',
          `subarray(begin?: ${brandedNumber.TypedArraySizeArg}, end?: ${brandedNumber.TypedArraySizeArg})`,
        ),
        replaceWithNoMatchCheck(
          'slice(start?: number, end?: number)',
          `slice(start?: ${brandedNumber.TypedArraySizeArg}, end?: ${brandedNumber.TypedArraySizeArg})`,
        ),
        replaceWithNoMatchCheck(
          'offset?: number',
          `offset?: ${brandedNumber.TypedArraySizeArgNonNegative}`,
        ),
        replaceWithNoMatchCheck(
          `fromIndex?: number`,
          `fromIndex?: ${brandedNumber.TypedArraySizeArg}`,
        ),
        replaceWithNoMatchCheck(
          'currentIndex: number',
          `currentIndex: ${brandedNumber.TypedArraySize}`,
        ),
      ),
    ).value;

export type TypedArrayNumberElemType =
  | 'Float16'
  | 'Float32'
  | 'Float64'
  | 'Int8'
  | 'Int16'
  | 'Int32'
  | 'Uint8'
  | 'Uint8Clamped'
  | 'Uint16'
  | 'Uint32';

export type TypedArrayBigintElemType = 'BigInt64' | 'BigUint64';

export type TypedArrayElemType =
  | TypedArrayBigintElemType
  | TypedArrayNumberElemType;

// Note: `Float16` is intentionally omitted here. This list drives the
// iteration over typed-array interfaces declared in `lib.es5.d.ts`; the
// `Float16Array` interface lives in its own `lib.esnext.float16.d.ts` (added in
// TS 5.8) and is converted separately by `convertLibEsnextFloat16`. Hence the
// assertion below is `<=` (subset) rather than `=`.
export const typedArrayNumberElemTypes = [
  'Int8',
  'Uint8',
  'Uint8Clamped',
  'Int16',
  'Uint16',
  'Int32',
  'Uint32',
  'Float32',
  'Float64',
] as const satisfies readonly TypedArrayNumberElemType[];

expectType<
  (typeof typedArrayNumberElemTypes)[number],
  TypedArrayNumberElemType
>('<=');

export const typedArrayBigIntElemTypes = [
  'BigInt64',
  'BigUint64',
] as const satisfies readonly TypedArrayBigintElemType[];

expectType<
  (typeof typedArrayBigIntElemTypes)[number],
  TypedArrayBigintElemType
>('=');

export const typedArrayElemTypes = [
  ...typedArrayNumberElemTypes,
  ...typedArrayBigIntElemTypes,
] as const satisfies readonly TypedArrayElemType[];

// `<=` rather than `=` because `Float16` is part of the union but not iterated
// here (see note on `typedArrayNumberElemTypes`).
expectType<(typeof typedArrayElemTypes)[number], TypedArrayElemType>('<=');

export const typedArrayTypeToElemBaseType = (
  s: TypedArrayElemType,
): 'bigint' | 'number' => {
  switch (s) {
    case 'Uint8Clamped':
    case 'Int8':
    case 'Uint8':
    case 'Int16':
    case 'Int32':
    case 'Uint16':
    case 'Uint32':
    case 'Float16':
    case 'Float32':
    case 'Float64':
      return 'number';

    case 'BigInt64':
    case 'BigUint64':
      return 'bigint';
  }
};

export const typedArrayTypeToElemType = (
  s: TypedArrayElemType,
  useBrandedNumber: boolean,
): StrictExclude<TypedArrayElemType, 'Uint8Clamped'> | 'bigint' | 'number' => {
  switch (s) {
    case 'Uint8Clamped':
      return enumType.Uint8;

    case 'Int8':
    case 'Uint8':
      return s;

    case 'Int16':
    case 'Int32':
    case 'Uint16':
    case 'Uint32':
    case 'Float16':
    case 'Float32':
    case 'Float64':
      return useBrandedNumber ? s : 'number';

    case 'BigInt64':
    case 'BigUint64':
      return useBrandedNumber ? s : 'bigint';
  }
};

export const BYTES_PER_ELEMENT = (
  elementType: TypedArrayElemType,
): 1 | 2 | 4 | 8 => {
  switch (elementType) {
    case 'Uint8':
    case 'Uint8Clamped':
    case 'Int8':
      return 1;

    case 'Uint16':
    case 'Int16':
    case 'Float16':
      return 2;

    case 'Uint32':
    case 'Int32':
    case 'Float32':
      return 4;

    case 'Float64':
    case 'BigInt64':
    case 'BigUint64':
      return 8;
  }
};
