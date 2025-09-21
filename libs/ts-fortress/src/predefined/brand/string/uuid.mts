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
  const regexp = uuidDef[version];

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return brand({
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    baseType: string(defaultValue) as Type<UuidBaseString>,
    is: (s): s is T => regexp.test(s),
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    defaultValue: defaultValue as T,
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
  uuid({ defaultValue, version: 4 });

export const uuidV6 = (defaultValue?: string): Type<Uuid6> =>
  uuid({ defaultValue, version: 6 });

export const uuidV7 = (defaultValue?: string): Type<Uuid7> =>
  uuid({ defaultValue, version: 7 });

type UuidValidatorOption<V extends UuidVersion | UuidVersionAdditionalOption> =
  Readonly<{
    /**
     * @param version One of 1-8, 'nil', 'max', 'all' or 'loose'. The 'loose' option checks if the string is a UUID-like string with hexadecimal values, ignoring RFC9562.
     */
    version?: V;

    typeName?: string;
    defaultValue?: string;
  }>;

const nilUuid = '00000000-0000-0000-0000-000000000000';

const uuidDef = {
  1: /^[\da-f]{8}-[\da-f]{4}-1[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/iu,
  2: /^[\da-f]{8}-[\da-f]{4}-2[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/iu,
  3: /^[\da-f]{8}-[\da-f]{4}-3[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/iu,
  4: /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/iu,
  5: /^[\da-f]{8}-[\da-f]{4}-5[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/iu,
  6: /^[\da-f]{8}-[\da-f]{4}-6[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/iu,
  7: /^[\da-f]{8}-[\da-f]{4}-7[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/iu,
  8: /^[\da-f]{8}-[\da-f]{4}-8[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/iu,

  // eslint-disable-next-line security/detect-unsafe-regex
  nil: /^0{8}-(?:0{4}-){3}0{12}$/iu,
  // eslint-disable-next-line security/detect-unsafe-regex
  max: /^f{8}-(?:f{4}-){3}f{12}$/iu,
  // eslint-disable-next-line security/detect-unsafe-regex
  loose: /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/iu,

  // From https://github.com/uuidjs/uuid/blob/main/src/regex.js

  // eslint-disable-next-line security/detect-unsafe-regex
  all: /^(?:[\da-f]{8}-[\da-f]{4}-[1-8][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}|0{8}-(?:0{4}-){3}0{12}|f{8}-(?:f{4}-){3}f{12})$/iu,
} as const;

if (import.meta.vitest !== undefined) {
  test('uuidNil', () => {
    expect(nilUuid).toMatch(uuidDef.nil);
  });
}
