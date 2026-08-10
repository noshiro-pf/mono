import {
  expectType,
  ISet,
  isRecord,
  RecordUtils,
  Result,
} from '@noshiro/ts-utils';
import { type Type, type TypeOf } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  validationErrorMessage,
} from '../utils/index.mjs';

/**
 * Creates a Partial type. If keysToBeOptional is set, only those keys are
 * optional, otherwise, all properties are optional.
 */
export const partial = <
  const R extends Type<UnknownRecord>,
  const KeysToBeOptional extends NonEmptyArray<keyof TypeOf<R> & string>,
>(
  recordType: R,
  options?: Partial<
    Readonly<{
      keysToBeOptional: KeysToBeOptional;
      typeName: string;
    }>
  >,
): PartialType<R, KeysToBeOptional> => {
  type V = PartialTypeValue<R, KeysToBeOptional>;

  const typeNameFilled: string =
    options?.typeName ??
    (options?.keysToBeOptional === undefined
      ? `Partial<${recordType.typeName}>`
      : `PartiallyPartial<${recordType.typeName}, ${options.keysToBeOptional.join('|')}>`);

  const keysToBeOptional =
    options?.keysToBeOptional ?? Object.keys(recordType.defaultValue);

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  const defaultValue: V = RecordUtils.omit(
    recordType.defaultValue,
    keysToBeOptional,
  ) as V;

  const validate: Type<V>['validate'] = (a) => {
    if (!isRecord(a)) {
      return Result.err([
        validationErrorMessage(a, 'The value is expected to be a record'),
      ]);
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const objectFilled = {
      // fill optional properties to skip check by recordType.validate
      ...RecordUtils.pick(recordType.defaultValue, keysToBeOptional),
      // overwrite with `a`
      ...a,
    } as TypeOf<R>;

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return recordType.validate(objectFilled) as ReturnType<Type<V>['validate']>;
  };

  const fill: Type<V>['fill'] = (a) => {
    if (!isRecord(a)) {
      return defaultValue;
    }

    const inputKeys = ISet.new(Object.keys(a));

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return RecordUtils.omit(
      // First, create a recursively filled object with all properties required.
      recordType.fill(a),
      // Then, Omit optional properties not present in `a`.
      keysToBeOptional.filter(
        (k) =>
          // avoid removing properties from `a`
          !inputKeys.has(k),
      ),
    ) as unknown as V;
  };

  return {
    typeName: typeNameFilled,
    defaultValue,
    fill,
    validate,
    is: createIsFn(validate),
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
  };
};

type PartialTypeValue<
  R extends Type<UnknownRecord>,
  KeysToBeOptional extends NonEmptyArray<keyof TypeOf<R> & string> | undefined,
> =
  TypeEq<KeysToBeOptional, undefined> extends true
    ? Partial<TypeOf<R>>
    : PartiallyPartial<TypeOf<R>, ArrayElement<KeysToBeOptional>>;

type PartialType<
  R extends Type<UnknownRecord>,
  KeysToBeOptional extends NonEmptyArray<keyof TypeOf<R> & string> | undefined,
> = Type<PartialTypeValue<R, KeysToBeOptional>>;

if (import.meta.vitest !== undefined) {
  test('dummy', () => {
    expect(0).toBe(0);
  });

  // expectType<IoTsInternal.SetOptional<Type<0>>, OptionalType<0>>('=');

  // expectType<
  //   IoTsInternal.SetOptionalForAllKey<{
  //     a: Type<0>;
  //   }>,
  //   Readonly<{
  //     a: OptionalType<0>;
  //   }>
  // >('=');

  // expectType<
  //   IoTsInternal.SetOptionalForAllKey<{
  //     a: Type<0>;
  //     b: OptionalType<0>;
  //   }>,
  //   Readonly<{
  //     a: OptionalType<0>;
  //     b: OptionalType<0>;
  //   }>
  // >('=');

  // expectType<
  //   IoTsInternal.SetOptionalForAllKey<
  //     RecordType<{
  //       a: OptionalType<0>;
  //       b: OptionalType<0>;
  //       c: Type<0>;
  //     }>['source']
  //   >,
  //   Readonly<{
  //     a: OptionalType<0>;
  //     b: OptionalType<0>;
  //     c: OptionalType<0>;
  //   }>
  // >('=');

  // expectType<
  //   PartialType<
  //     RecordType<{
  //       a: OptionalType<0>;
  //       b: OptionalType<0>;
  //       c: Type<0>;
  //     }>,
  //     undefined
  //   >,
  //   RecordType<
  //     Readonly<{
  //       a: OptionalType<0>;
  //       b: OptionalType<0>;
  //       c: OptionalType<0>;
  //     }>
  //   >
  // >('=');

  // expectType<
  //   PartialType<
  //     Type<{
  //       a: OptionalType<0>;
  //       b: Type<0>;
  //       c: Type<0>;
  //     }>,
  //     ['b']
  //   >,
  //   RecordType<
  //     Readonly<{
  //       a: OptionalType<0>;
  //       b: OptionalType<0>;
  //       c: Type<0>;
  //     }>
  //   >
  // >('=');

  expectType<
    PartialType<
      Type<{ a: Type<0>; b: Type<0>; c: Type<0> }>,
      // @ts-expect-error key "d" doesn't exist
      ['a', 'd']
    >,
    0
  >('!=');
}
