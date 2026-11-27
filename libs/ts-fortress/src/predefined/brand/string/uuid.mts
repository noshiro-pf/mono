import type {
  Brand,
  NonEmptyString,
  ReadonlyRecord,
  TypeEq,
  UintRangeInclusive,
} from 'ts-type-forge';
import { brand } from '../../../brand/index.mjs';
import { annotate } from '../../../other-types/index.mjs';
import { string } from '../../../primitives/index.mjs';
import type { Type } from '../../../type.mjs';

export type UuidVersion = UintRangeInclusive<1, 8>;

export type UuidBaseString<V extends UuidVersion = UuidVersion> =
  | `${string}-${string}-${V}${string}-${string}-${string}`
  | '00000000-0000-0000-0000-000000000000'
  // The max UUID in any case, which `is` reads case-insensitively: a literal
  // would leave its upper- and mixed-case spellings outside the type.
  | `${string}-${string}-${'f' | 'F'}${string}-${string}-${string}`;

// A UUID always has the dash-separated hexadecimal form, so it is never an
// empty string; `Uuid` is branded on top of `NonEmptyString` and is assignable
// to it.
export type Uuid = Brand<UuidBaseString & NonEmptyString, 'Uuid'>;

export type Uuid4 = Brand<UuidBaseString<4> & NonEmptyString, 'Uuid'>;

export type Uuid6 = Brand<UuidBaseString<6> & NonEmptyString, 'Uuid'>;

export type Uuid7 = Brand<UuidBaseString<7> & NonEmptyString, 'Uuid'>;

/**
 * @link https://github.com/validatorjs/validator.js/tree/v13.1.17?tab=readme-ov-file#validators
 */
export const uuid = <V extends UuidVersion | UuidVersionAdditionalOption>(
  options?: UuidValidatorOption<V>,
): Type<UuidOf<V>> => {
  type T = Brand<UuidBaseString & NonEmptyString, 'Uuid'>;

  const version = options?.version ?? 'all';

  const defaultValue = options?.defaultValue ?? defaultOf(version);

  // Every value accepted is in the hexadecimal form RFC 9562 defines, so it is
  // also of the JSON Schema `uuid` format.
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  return annotate(
    brand<UuidBaseString & NonEmptyString, readonly ['Uuid']>({
      // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
      baseType: string(defaultValue, { nonempty: true }) as Type<
        UuidBaseString & NonEmptyString
      >,
      is: (s): s is T => uuidDef[version](s),
      // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
      defaultValue: defaultValue as UuidBaseString & NonEmptyString,
      brandKeys: ['Uuid'],
      typeName:
        options?.typeName ??
        (version === 4
          ? 'UuidV4'
          : version === 6
            ? 'UuidV6'
            : version === 7
              ? 'UuidV7'
              : 'Uuid'),
    }),
    { format: 'uuid' },
  ) satisfies Type<T> as Type<UuidOf<V>>;
};

/**
 * The `version` values of {@link uuid} beyond the numbered versions: `'nil'`
 * and `'max'` accept only the all-zero and all-`f` UUIDs, `'all'` those and
 * versions 1–8, and `'loose'` any hexadecimal string of the UUID layout,
 * ignoring RFC 9562. Every version reads the hexadecimal digits in any case, as
 * RFC 9562 says for input.
 */
export type UuidVersionAdditionalOption = 'nil' | 'max' | 'all' | 'loose';

/**
 * The type {@link uuid} gives for the `version` `V`: `Uuid4`, `Uuid6` or
 * `Uuid7` for those versions, and `Uuid` for any other. All four carry the
 * brand `'Uuid'`; they differ only in the version digit of their string type.
 */
export type UuidOf<V extends UuidVersion | UuidVersionAdditionalOption> =
  TypeEq<V, 4> extends true
    ? Uuid4
    : TypeEq<V, 6> extends true
      ? Uuid6
      : TypeEq<V, 7> extends true
        ? Uuid7
        : Uuid;

export const uuidV4 = (defaultValue?: string): Type<Uuid4> =>
  uuid({
    defaultValue: defaultValue ?? '00000000-0000-4000-8000-000000000000',
    version: 4,
  });

export const uuidV6 = (defaultValue?: string): Type<Uuid6> =>
  uuid({
    defaultValue: defaultValue ?? '00000000-0000-6000-8000-000000000000',
    version: 6,
  });

export const uuidV7 = (defaultValue?: string): Type<Uuid7> =>
  uuid({
    defaultValue: defaultValue ?? '00000000-0000-7000-8000-000000000000',
    version: 7,
  });

/**
 * The options {@link uuid} takes, each optional. Left out, `defaultValue` is
 * one the `version` accepts: `00000000-0000-V000-8000-000000000000` for a
 * numbered version `V`, the max UUID for `'max'`, and the nil UUID for `'nil'`,
 * `'all'` and `'loose'`.
 */
export type UuidValidatorOption<
  V extends UuidVersion | UuidVersionAdditionalOption,
> = Partial<
  Readonly<{
    /**
     * 1–8, or one of {@link UuidVersionAdditionalOption}; `'all'` if left out.
     */
    version: V;

    typeName: string;
    defaultValue: string;
  }>
>;

const nilUuid = '00000000-0000-0000-0000-000000000000' satisfies UuidBaseString;

const maxUuid = 'ffffffff-ffff-ffff-ffff-ffffffffffff' satisfies UuidBaseString;

const regexDef = {
  1: /^[\da-f]{8}-[\da-f]{4}-1[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/iu,
  2: /^[\da-f]{8}-[\da-f]{4}-2[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/iu,
  3: /^[\da-f]{8}-[\da-f]{4}-3[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/iu,
  4: /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/iu,
  5: /^[\da-f]{8}-[\da-f]{4}-5[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/iu,
  6: /^[\da-f]{8}-[\da-f]{4}-6[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/iu,
  7: /^[\da-f]{8}-[\da-f]{4}-7[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/iu,
  8: /^[\da-f]{8}-[\da-f]{4}-8[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/iu,
  max: /^f{8}-f{4}-f{4}-f{4}-f{12}$/iu,
  loose: /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu,
  '1-8':
    /^(?:[\da-f]{8}-[\da-f]{4}-[1-8][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12})$/iu,
} as const;

const uuidDef: ReadonlyRecord<
  UuidVersion | UuidVersionAdditionalOption,
  (s: string) => boolean
> = {
  1: (s) => regexDef[1].test(s),
  2: (s) => regexDef[2].test(s),
  3: (s) => regexDef[3].test(s),
  4: (s) => regexDef[4].test(s),
  5: (s) => regexDef[5].test(s),
  6: (s) => regexDef[6].test(s),
  7: (s) => regexDef[7].test(s),
  8: (s) => regexDef[8].test(s),
  nil: (s) => s === nilUuid,
  max: (s) => regexDef.max.test(s),
  loose: (s) => regexDef.loose.test(s),
  all: (s) => s === nilUuid || regexDef.max.test(s) || regexDef['1-8'].test(s),
} as const;

/**
 * The default {@link uuid} gives a `version` when the options leave
 * `defaultValue` out: one that `version` accepts, so that building never
 * panics.
 */
const defaultOf = (
  version: UuidVersion | UuidVersionAdditionalOption,
): UuidBaseString =>
  version === 'max'
    ? maxUuid
    : version === 'nil' || version === 'all' || version === 'loose'
      ? nilUuid
      : (`00000000-0000-${version}000-8000-000000000000` as const);
