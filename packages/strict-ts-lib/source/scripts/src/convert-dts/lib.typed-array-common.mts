import {
  composeMonoTypeFns,
  expectType,
  replaceWithNoMatchCheck,
} from '@noshiro/mono-scripts';
import { enumType, type ConverterOptions } from './common.mjs';

export const convertTypedArrayCommon = ({
  brandedNumber,
}: ConverterOptions): MonoTypeFunction<string> =>
  composeMonoTypeFns(
    replaceWithNoMatchCheck(
      'copyWithin(target: number, start: number, end?: number): this;',
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
  );

export type TypedArrayElemType =
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

export const typedArrayElemTypes = [
  'Int8',
  'Uint8',
  'Uint8Clamped',
  'Int16',
  'Uint16',
  'Int32',
  'Uint32',
  'Float32',
  'Float64',
] as const satisfies readonly TypedArrayElemType[];

expectType<(typeof typedArrayElemTypes)[number], TypedArrayElemType>('=');

export const typedArrayBigIntElemTypes = [
  'BigInt64',
  'BigUint64',
] as const satisfies readonly TypedArrayBigintElemType[];

export const typedArrayTypeToElemType = (
  s: TypedArrayElemType,
  useBrandedNumber: boolean,
): Exclude<TypedArrayElemType, 'Uint8Clamped'> | 'number' => {
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
    case 'Float32':
    case 'Float64':
      return useBrandedNumber ? s : 'number';
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
      return 2;

    case 'Uint32':
    case 'Int32':
    case 'Float32':
      return 4;

    case 'Float64':
      return 8;
  }
};
