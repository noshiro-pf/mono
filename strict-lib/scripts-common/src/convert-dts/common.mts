import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import dedent from 'dedent';
import { expectType } from 'ts-data-forge';
import { type MonoTypeFunction, type ReadonlyRecord } from 'ts-type-forge';
import { generateKeyValueRecordFromKeys } from '../functions/utils/node-utils.mjs';

export type ConverterConfig = Readonly<{
  commentOutDeprecated: boolean;
  returnType: 'mutable' | 'readonly';
  useBrandedNumber: boolean;
}>;

export type TsLibShape = Readonly<{
  /**
   * TS 5.7 made the typed-array interfaces (`Int8Array`, `Uint8Array`, ...,
   * `DataView`, `ArrayBufferView`) generic over a `TArrayBuffer extends
   * ArrayBufferLike` parameter. Earlier versions declare them without the
   * generic parameter. Replacement strings that reference typed arrays should
   * branch on this flag to emit `Int8Array<ArrayBufferLike>` vs plain
   * `Int8Array`.
   */
  hasTypedArrayGeneric: boolean;

  /**
   * TS 5.6 introduced the `ArrayIterator` / `MapIterator` / `SetIterator`
   * built-in interfaces. Earlier versions used `IterableIterator` for the same
   * return types. Emit the appropriate name in the replacement string.
   */
  hasArrayIterator: boolean;
}>;

export type ConverterOptions = Readonly<{
  config: ConverterConfig;
  readonlyModifier: '' | 'readonly ';
  brandedNumber: BrandedNumberTypes;
  tsLibShape: TsLibShape;
}>;

/**
 * Compute the `TsLibShape` flags for a given TypeScript version. Bumps to this
 * function happen alongside upstream lib breaking changes.
 */
export const tsLibShapeFor = (tsVersion: string): TsLibShape => {
  const [majorStr, minorStr] = tsVersion.split('.', 2);

  const major = Number(majorStr);

  const minor = Number(minorStr);

  const atLeast = (m: number, n: number): boolean =>
    major > m || (major === m && minor >= n);

  return {
    hasTypedArrayGeneric: atLeast(5, 7),
    hasArrayIterator: atLeast(5, 6),
  };
};

/**
 * Name of the array-iterator return type for the target TS lib shape:
 *
 * - TS >= 5.6: `ArrayIterator`
 * - TS < 5.6: `IterableIterator`
 */
export const arrayIteratorName = (tsLibShape: TsLibShape): string =>
  tsLibShape.hasArrayIterator ? 'ArrayIterator' : 'IterableIterator';

/**
 * Render a typed-array reference appropriate to the target TS lib shape:
 *
 * - TS >= 5.7: `Int8Array<${genericArg}>` (default `ArrayBufferLike`)
 * - TS < 5.7: `Int8Array`
 */
export const typedArrayRef = (
  typeName: string,
  tsLibShape: TsLibShape,
  genericArg: string = 'ArrayBufferLike',
): string =>
  tsLibShape.hasTypedArrayGeneric
    ? (`${typeName}<${genericArg}>` as const)
    : typeName;

/**
 * Regex source fragment matching the `array: this` (TS 5.7+) or `array:
 * ${typeName}Array` (pre-5.7) parameter form inside typed-array interface
 * bodies.
 */
export const typedArrayThisRegexSource = (typeName: string): string =>
  `(?:this|${typeName})` as const;

/**
 * Capturing variant of `typedArrayThisRegexSource`. Use `$1` in the replacement
 * string to keep whichever form (`this` or `${typeName}`) the source lib
 * actually used.
 */
export const typedArrayThisCaptureRegexSource = (typeName: string): string =>
  `(this|${typeName})` as const;

export const closeBraceRegexp = /\n\}\n/gu;

/**
 * Matches `interface ${typeName} {` with an optional `<TArrayBuffer extends
 * ArrayBufferLike>` or `<TArrayBuffer extends ArrayBufferLike =
 * ArrayBufferLike>` generic parameter. TypeScript 5.7 introduced the generic
 * parameter on typed-array interfaces; earlier versions (e.g. TS 5.6) declare
 * them without it. Tolerant of oxfmt wrapping the generic parameter list onto
 * its own lines (with a trailing comma before `>`), which happens for some TS
 * versions' fetched lib files.
 */
export const typedArrayInterfaceStartRegexp = (typeName: string): RegExp =>
  new RegExp(
    String.raw`interface ${typeName}(?:<\s*TArrayBuffer extends ArrayBufferLike(?:\s*=\s*ArrayBufferLike)?,?\s*>)?\s*\{`,
    'u',
  );

/**
 * Regex source fragment that matches a typed-array reference with or without
 * the `<ArrayBufferLike>` generic argument. Use to compose patterns covering
 * both TS 5.7+ (generic) and earlier (non-generic) lib file shapes.
 */
export const typedArrayRefRegexSource = (typeName: string): string =>
  `${typeName}(?:<ArrayBufferLike>)?` as const;

/**
 * Regex source fragment matching a `|`-joined union of typed-array references,
 * each tolerating an optional `<ArrayBufferLike>` generic argument.
 *
 * Also tolerates oxfmt's multiline "leading-pipe" wrapping style, where a long
 * union gets wrapped as `\n | Int8Array\n | Uint8Array\n | ...` — i.e. every
 * member, including the first, is prefixed with `| ` on its own line. The
 * leading `\s*\|?\s*` makes that leading pipe (and the surrounding
 * whitespace/newlines that come with wrapping) optional, while the `\s*\|\s*`
 * separator between members stays flexible on whitespace but keeps the pipe
 * mandatory, since it is always present there in both single-line and wrapped
 * forms.
 */
export const typedArrayUnionRegexSource = (
  typeNames: readonly string[],
): string =>
  String.raw`\s*\|?\s*` +
  typeNames.map(typedArrayRefRegexSource).join(String.raw`\s*\|\s*`);

/**
 * Wraps a hand-authored regex source string (typically a `String.raw` template
 * covering a function signature) with tolerance for oxfmt re-wrapping the
 * matched text onto multiple lines. Applies the same transform as the
 * plain-string matcher in `replaceWithNoMatchCheck` does automatically, but for
 * `RegExp` inputs, which bypass that matcher's built-in tokenizer:
 *
 * - After every literal `(` (i.e. every escaped `\(` in the source, which
 *   represents a literal open-paren character in the matched text, as opposed
 *   to an unescaped `(` used for actual regex grouping), allow leading
 *   whitespace/newlines;
 * - Loosen `: ` and `, ` (colon/comma followed by a single mandatory space) to
 *   `:\s*` / `,\s*`, keeping the colon/comma mandatory but the surrounding
 *   whitespace flexible;
 * - Before every literal `)` (escaped `\)`), allow an optional trailing comma,
 *   since oxfmt adds one before a wrapped closing paren that isn't present in
 *   the single-line form.
 *
 * Only the literal escaped forms (`\(`, `\)`) are touched, so actual regex
 * syntax built from unescaped parens (e.g. `(?:this|Foo)`, capture groups) is
 * left untouched.
 */
export const wrapTolerant = (regexSource: string): string =>
  regexSource
    .replaceAll(String.raw`\(`, String.raw`\(\s*`)
    .replaceAll(': ', String.raw`:\s*`)
    .replaceAll(', ', String.raw`,\s*`)
    .replaceAll(String.raw`\)`, String.raw`,?\s*\)`);

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
  'Float16',
  'Float32',
  'Float64',
  'BigInt64',
  'BigUint64',
  'SafeInt',
  'SafeUint',
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

  // YearEnum is not present in ts-type-forge globals; we add it as an alias
  // of SafeUint inside the generated `declare namespace NumberType`.
  'YearEnum',

  ...brandedNumberFromTypeUtils,
] as const;

const BrandedNumberName = generateKeyValueRecordFromKeys(
  brandedNumbers,
) satisfies BrandedNumberTypes;

export type BrandedNumberTypes = ReadonlyRecord<
  (typeof brandedNumbers)[number],
  (typeof brandedNumbers)[number] | 'bigint' | 'number' | `NumberType.${string}`
>;

const tupleMap = <T extends readonly unknown[], B>(
  tpl: T,
  mapFn: (a: T[number]) => B,
): Readonly<{ [K in keyof T]: B }> =>
  tpl.map(mapFn) as Readonly<{ [K in keyof T]: B }>;

// Typed as a set of plain strings so `.has` accepts any `brandedNumbers` key
// (a wider type than the `brandedNumberFromTypeUtils` element type).
const typeUtilsGlobalSet: ReadonlySet<string> = new Set(
  brandedNumberFromTypeUtils,
);

export const createBrandedNumber = (
  useBrandedNumber: boolean,
): BrandedNumberTypes =>
  // `Object.fromEntries` widens to `{ [k: string]: ... }`, losing the exact key
  // set; the mapping over `brandedNumbers` guarantees every key is present, so
  // the assertion back to `BrandedNumberTypes` is sound.
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
            : typeUtilsGlobalSet.has(key)
              ? key
              : prependNamespacePrefix(BrandedNumberName[key]),
        ] as const,
    ),
  ) as BrandedNumberTypes;

const prependNamespacePrefix = (s: string): `NumberType.${string}` =>
  `NumberType.${s}` as const;

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
    YearEnum,

    ...rest
  } = BrandedNumberName;

  expectType<keyof typeof rest, (typeof brandedNumberFromTypeUtils)[number]>(
    '=',
  );

  const { SafeUint, Uint32, PositiveNumber, NegativeInt32, SafeInt } = rest;

  return dedent`
    /**
     * https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/length
     * https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/length
     *
     *     Max array length : 2^32 - 1
     *     Max string length : 2^53 - 1
     */
    declare namespace NumberType {
      export type ${StringSize} = ${SafeUint};
      export type ${ArraySize} = ${Uint32};
      export type ${TypedArraySize} = ${SafeUint};

      export type ${ArraySizeArgPositive} = WithSmallInt<IntersectBrand<${PositiveNumber}, ${ArraySize}>>;
      export type ${TypedArraySizeArgPositive} = WithSmallInt<IntersectBrand<${PositiveNumber}, ${TypedArraySize}>>;
      export type ${StringSizeArgPositive} = WithSmallInt<IntersectBrand<${PositiveNumber}, ${StringSize}>>;

      export type ${StringSizeArgNonNegative} = WithSmallInt<${StringSize}>;
      export type ${ArraySizeArgNonNegative} = WithSmallInt<${ArraySize}>;
      export type ${TypedArraySizeArgNonNegative} = WithSmallInt<${TypedArraySize}>;

      export type ${StringSizeArg} = WithSmallInt<${SafeInt}>;
      export type ${ArraySizeArg} = WithSmallInt<${NegativeInt32} | ${ArraySize}>;
      export type ${TypedArraySizeArg} = WithSmallInt<${SafeInt}>;

      export type ${StringSearchResult} = ${StringSize} | -1;
      export type ${ArraySearchResult} = ${ArraySize} | -1;
      export type ${TypedArraySearchResult} = ${TypedArraySize} | -1;

      export type ${NewArrayMaxSize} = ${ArraySize};

      export type ${YearEnum} = ${SafeUint};
    }
  `;
};

export const getSrcFileList = async (
  srcDir: string,
): Promise<readonly Readonly<{ filename: string; content: string }>[]> => {
  const distFileNameList = await fs.readdir(srcDir);

  const distFileContentList = await Promise.all(
    distFileNameList.map((filename) =>
      fs.readFile(path.resolve(srcDir, filename), { encoding: 'utf8' }),
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

/**
 * Ensures the file carries a top-of-file `/// <reference lib="es5" />`
 * directive, so a lib that augments a base es5 interface (e.g.
 * `ObjectConstructor` in `lib.es2019.object` / `lib.es2022.object`) can see the
 * declaration it extends when resolved on its own.
 *
 * TypeScript 5.x lib files start with `/// <reference no-default-lib="true"/>`,
 * and the es5 directive is inserted directly after it (preserving the
 * historical byte-for-byte output). TypeScript 6.0 removed `no-default-lib`
 * from every lib file, so there the es5 directive is prepended at the very top
 * instead. Idempotent: a no-op if an es5 reference is already present.
 */
export const ensureEs5Reference: MonoTypeFunction<string> = (src) => {
  const es5Ref = '/// <reference lib="es5" />';

  if (src.includes(es5Ref)) return src;

  const noDefaultLibRef = '/// <reference no-default-lib="true"/>';

  return src.includes(noDefaultLibRef)
    ? src.replace(noDefaultLibRef, () => `${noDefaultLibRef}\n${es5Ref}`)
    : `${es5Ref}\n${src}`;
};
