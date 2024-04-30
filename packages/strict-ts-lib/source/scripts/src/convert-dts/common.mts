import * as fs from 'node:fs/promises';

export type ConverterOptions = Readonly<{
  commentOutDeprecated: boolean;
  returnType: 'mutable' | 'readonly';
}>;

export const converterOptions: ConverterOptions = {
  commentOutDeprecated: false,
  returnType: 'readonly',
} as const;

export const closeBraceRegexp = /\n\}\n/gu;

export const typeUtilsName = '@noshiro/ts-type-utils-no-stdlib';

export const NumberType = {
  StringSize: 'NumberType.StringSize',
  ArraySize: 'NumberType.ArraySize',
  TypedArraySize: 'NumberType.TypedArraySize',

  StringSizeArgPositive: 'NumberType.StringSizeArgPositive',
  ArraySizeArgPositive: 'NumberType.ArraySizeArgPositive',
  TypedArraySizeArgPositive: 'NumberType.TypedArraySizeArgPositive',

  StringSizeArgNonNegative: 'NumberType.StringSizeArgNonNegative',
  ArraySizeArgNonNegative: 'NumberType.ArraySizeArgNonNegative',
  TypedArraySizeArgNonNegative: 'NumberType.TypedArraySizeArgNonNegative',

  StringSizeArg: 'NumberType.StringSizeArg',
  ArraySizeArg: 'NumberType.ArraySizeArg',
  TypedArraySizeArg: 'NumberType.TypedArraySizeArg',

  StringSearchResult: 'NumberType.StringSearchResult',
  ArraySearchResult: 'NumberType.ArraySearchResult',
  TypedArraySearchResult: 'NumberType.TypedArraySearchResult',

  NewArrayMaxSize: 'NumberType.NewArrayMaxSize',
  SafeUint: 'SafeUint',
  int: 'SafeInt',
} as const;

const chopNamespacePrefix = (s: `NumberType.${string}`): string =>
  s.replace('NumberType.', '');

export const numberTypeDefString = [
  '/**',
  ' * https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/length',
  ' * https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/length',
  ' *',
  ' *     Max array length : 2^32 - 1',
  ' *     Max string length : 2^53 - 1',
  ' */',
  'namespace NumberType {',
  `  export type ${chopNamespacePrefix(NumberType.StringSize)} = SafeUint;`,
  `  export type ${chopNamespacePrefix(NumberType.ArraySize)} = Uint32;`,
  `  export type ${chopNamespacePrefix(NumberType.TypedArraySize)} = SafeUint;`, // 要出典
  '',
  `  export type ${chopNamespacePrefix(NumberType.ArraySizeArgPositive)} = WithSmallInt<IntersectBrand<PositiveNumber, ArraySize>>;`,
  `  export type ${chopNamespacePrefix(NumberType.TypedArraySizeArgPositive)} = WithSmallInt<IntersectBrand<PositiveNumber, TypedArraySize>>;`,
  `  export type ${chopNamespacePrefix(NumberType.StringSizeArgPositive)} = WithSmallInt<IntersectBrand<PositiveNumber, StringSize>>;`,
  '',
  `  export type ${chopNamespacePrefix(NumberType.StringSizeArgNonNegative)} = WithSmallInt<StringSize>;`,
  `  export type ${chopNamespacePrefix(NumberType.ArraySizeArgNonNegative)} = WithSmallInt<ArraySize>;`,
  `  export type ${chopNamespacePrefix(NumberType.TypedArraySizeArgNonNegative)} = WithSmallInt<TypedArraySize>;`,
  '',
  `  export type ${chopNamespacePrefix(NumberType.StringSizeArg)} = WithSmallInt<SafeInt>;`,
  `  export type ${chopNamespacePrefix(NumberType.ArraySizeArg)} = WithSmallInt<NegativeInt32 | ArraySize>;`,
  `  export type ${chopNamespacePrefix(NumberType.TypedArraySizeArg)} = WithSmallInt<SafeInt>;`,
  '',
  `  export type ${chopNamespacePrefix(NumberType.StringSearchResult)} = StringSize | -1;`,
  `  export type ${chopNamespacePrefix(NumberType.ArraySearchResult)} = ArraySize | -1;`,
  `  export type ${chopNamespacePrefix(NumberType.TypedArraySearchResult)} = TypedArraySize | -1;`,
  '',
  `  export type ${chopNamespacePrefix(NumberType.NewArrayMaxSize)} = ArraySize;`,
  '}',
].join('\n');

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
