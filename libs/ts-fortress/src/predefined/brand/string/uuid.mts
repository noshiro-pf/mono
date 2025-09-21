import { brand } from '../../../brand/index.mjs';
import { string } from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

/**
 * @link https://github.com/validatorjs/validator.js/tree/v13.1.17?tab=readme-ov-file#validators
 */
export const uuid = <V extends UuidVersion | UuidVersionAdditionalOption>(
  options?: UuidValidatorOption<V>,
): Type<UuidOf<V>> => {
  type T = Brand<UuidBaseString, 'Uuid'>;

  const defaultValue = options?.defaultValue ?? nilUuid;
  const version = options?.version ?? 'all';

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return brand<UuidBaseString, readonly ['Uuid']>({
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    baseType: string(defaultValue) as Type<UuidBaseString>,
    is: (s): s is T => uuidDef[version](s),
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    defaultValue: defaultValue as UuidBaseString,
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
  }) satisfies Type<T> as Type<UuidOf<V>>;
};

type UuidVersionAdditionalOption = 'nil' | 'max' | 'all' | 'loose';

type UuidOf<V extends UuidVersion | UuidVersionAdditionalOption> =
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

type UuidValidatorOption<V extends UuidVersion | UuidVersionAdditionalOption> =
  PartialReadonly<{
    /**
     * @param version One of 1-8, 'nil', 'max', 'all' or 'loose'. The 'loose' option checks if the string is a UUID-like string with hexadecimal values, ignoring RFC9562.
     */
    version: V;

    typeName: string;
    defaultValue: string;
  }>;

const nilUuid = '00000000-0000-0000-0000-000000000000' satisfies UuidBaseString;
const maxUuid = 'ffffffff-ffff-ffff-ffff-ffffffffffff' satisfies UuidBaseString;

const regexDef = {
  1: /^[\da-f]{8}-[\da-f]{4}-1[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/u,
  2: /^[\da-f]{8}-[\da-f]{4}-2[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/u,
  3: /^[\da-f]{8}-[\da-f]{4}-3[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/u,
  4: /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/u,
  5: /^[\da-f]{8}-[\da-f]{4}-5[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/u,
  6: /^[\da-f]{8}-[\da-f]{4}-6[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/u,
  7: /^[\da-f]{8}-[\da-f]{4}-7[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/u,
  8: /^[\da-f]{8}-[\da-f]{4}-8[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/u,
  loose: /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/u,
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
  max: (s) => s === maxUuid,
  loose: (s) => regexDef.loose.test(s),
  all: (s) => s === nilUuid || s === maxUuid || regexDef['1-8'].test(s),
} as const;
