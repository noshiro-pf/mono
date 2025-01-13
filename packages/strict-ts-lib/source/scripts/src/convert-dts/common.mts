import {
  expectType,
  generateKeyValueRecordFromKeys,
} from '@noshiro/mono-utils';
import * as fs from 'node:fs/promises';

export type ConverterConfig = Readonly<{
  commentOutDeprecated: boolean;
  returnType: 'mutable' | 'readonly';
  useBrandedNumber: boolean;
  forNpmPackage: boolean;
  useLocalPath: boolean;
}>;

export type ConverterOptions = Readonly<{
  config: ConverterConfig;
  readonlyModifier: '' | 'readonly ';
  brandedNumber: BrandedNumberTypes;
}>;

export const closeBraceRegexp = /\n\}\n/gu;

export const enumType = generateKeyValueRecordFromKeys([
  'Int8',
  'Uint8',
] as const);

const brandedNumberFromTypeUtils = [
  'FiniteNumber',
  'Int',
  'NaNType',
  'NEGATIVE_INFINITY',
  'POSITIVE_INFINITY',
  'PositiveNumber',
  'NonNegativeNumber',
  'InfiniteNumber',
  'Int16',
  'Uint16',
  'Int32',
  'Uint32',
  'Float32',
  'Float64',
  'BigInt64',
  'BigUint64',
  'SafeInt',
  'SafeUint',
  'YearEnum',
  'NegativeInt32',
] as const;

const brandedNumbers = [
  'StringSize',
  'ArraySize',
  'TypedArraySize',

  'StringSizeArgPositive',
  'ArraySizeArgPositive',
  'TypedArraySizeArgPositive',

  'StringSizeArgNonNegative',
  'ArraySizeArgNonNegative',
  'TypedArraySizeArgNonNegative',

  'StringSizeArg',
  'ArraySizeArg',
  'TypedArraySizeArg',

  'StringSearchResult',
  'ArraySearchResult',
  'TypedArraySearchResult',

  'NewArrayMaxSize',

  ...brandedNumberFromTypeUtils,
] as const;

const BrandedNumberName = generateKeyValueRecordFromKeys(
  brandedNumbers,
) satisfies BrandedNumberTypes;

export type BrandedNumberTypes = Record<
  (typeof brandedNumbers)[number],
  (typeof brandedNumbers)[number] | 'bigint' | 'number' | `NumberType.${string}`
>;

const tupleMap = <T extends readonly unknown[], B>(
  tpl: T,
  mapFn: (a: T[number]) => B,
): { readonly [K in keyof T]: B } =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  tpl.map(mapFn as (a: unknown) => B) as {
    readonly [K in keyof T]: B;
  };

const set = new Set(brandedNumberFromTypeUtils);

export const createBrandedNumber = (
  useBrandedNumber: boolean,
): BrandedNumberTypes =>
  Object.fromEntries(
    tupleMap(
      brandedNumbers,
      (key) =>
        [
          key,
          !useBrandedNumber
            ? key === 'BigInt64' || key === 'BigUint64'
              ? 'bigint'
              : 'number'
            : set.has(key)
              ? key
              : prependNamespacePrefix(BrandedNumberName[key]),
        ] as const,
    ),
  ) satisfies BrandedNumberTypes;

const prependNamespacePrefix = (s: string): `NumberType.${string}` =>
  `NumberType.${s}`;

export const brandedNumberTypeDefString = (): string => {
  const {
    StringSize,
    ArraySize,
    TypedArraySize,
    ArraySizeArgPositive,
    TypedArraySizeArgPositive,
    StringSizeArgPositive,
    StringSizeArgNonNegative,
    ArraySizeArgNonNegative,
    TypedArraySizeArgNonNegative,
    StringSizeArg,
    ArraySizeArg,
    TypedArraySizeArg,
    StringSearchResult,
    ArraySearchResult,
    TypedArraySearchResult,
    NewArrayMaxSize,

    ...rest
  } = BrandedNumberName;

  expectType<keyof typeof rest, (typeof brandedNumberFromTypeUtils)[number]>(
    '=',
  );

  const { SafeUint, Uint32, PositiveNumber, NegativeInt32, SafeInt } = rest;

  return [
    '/**',
    ' * https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/length',
    ' * https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/length',
    ' *',
    ' *     Max array length : 2^32 - 1',
    ' *     Max string length : 2^53 - 1',
    ' */',
    'declare namespace NumberType {',
    `  export type ${StringSize} = ${SafeUint};`,
    `  export type ${ArraySize} = ${Uint32};`,
    `  export type ${TypedArraySize} = ${SafeUint};`, // 要出典
    '',
    `  export type ${ArraySizeArgPositive} = WithSmallInt<IntersectBrand<${PositiveNumber}, ${ArraySize}>>;`,
    `  export type ${TypedArraySizeArgPositive} = WithSmallInt<IntersectBrand<${PositiveNumber}, ${TypedArraySize}>>;`,
    `  export type ${StringSizeArgPositive} = WithSmallInt<IntersectBrand<${PositiveNumber}, ${StringSize}>>;`,
    '',
    `  export type ${StringSizeArgNonNegative} = WithSmallInt<${StringSize}>;`,
    `  export type ${ArraySizeArgNonNegative} = WithSmallInt<${ArraySize}>;`,
    `  export type ${TypedArraySizeArgNonNegative} = WithSmallInt<${TypedArraySize}>;`,
    '',
    `  export type ${StringSizeArg} = WithSmallInt<${SafeInt}>;`,
    `  export type ${ArraySizeArg} = WithSmallInt<${NegativeInt32} | ${ArraySize}>;`,
    `  export type ${TypedArraySizeArg} = WithSmallInt<${SafeInt}>;`,
    '',
    `  export type ${StringSearchResult} = ${StringSize} | -1;`,
    `  export type ${ArraySearchResult} = ${ArraySize} | -1;`,
    `  export type ${TypedArraySearchResult} = ${TypedArraySize} | -1;`,
    '',
    `  export type ${NewArrayMaxSize} = ${ArraySize};`,
    '}',
  ].join('\n');
};

export const getSrcFileList = async (
  srcDir: string,
): Promise<readonly Readonly<{ filename: string; content: string }>[]> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const distFileNameList = await fs.readdir(srcDir);

  const distFileContentList = await Promise.all(
    distFileNameList.map((filename) =>
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.readFile(`${srcDir}/${filename}`, 'utf8'),
    ),
  );

  const distFileList: readonly Readonly<{
    filename: string;
    content: string;
  }>[] = distFileNameList.map((filename, index) => ({
    filename,
    content: distFileContentList[index] ?? '',
  }));

  return distFileList;
};

export const idFn = (s: string): string => s;
