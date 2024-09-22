import { expectType, isRecord, RecordUtils, Result } from '@noshiro/ts-utils';
import { type Type, type TypeOf } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  validationErrorMessage,
} from '../utils/index.mjs';

/** Creates a record type with keys picked. */
export const pick = <
  const R extends Type<UnknownRecord>,
  const KeysToPick extends readonly (keyof TypeOf<R> & string)[],
>(
  recordType: R,
  keysToPick: KeysToPick,
  options?: Partial<
    Readonly<{
      typeName: string;
    }>
  >,
): PickedType<R, KeysToPick> => {
  type V = Pick<TypeOf<R>, ArrayElement<KeysToPick>>;

  const typeNameFilled: string =
    options?.typeName ??
    `Pick<${recordType.typeName}, ${keysToPick.join('|')}>`;

  const defaultValue: V = RecordUtils.pick(
    recordType.defaultValue,
    keysToPick,
  ) as V;

  const validate: Type<V>['validate'] = (a) => {
    if (!isRecord(a)) {
      return Result.err([
        validationErrorMessage(a, 'The value is expected to be a record'),
      ]);
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const objectFilled = {
      ...RecordUtils.omit(recordType.fill(a), keysToPick),
      ...a,
    } as TypeOf<R>;

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return recordType.validate(objectFilled) as ReturnType<Type<V>['validate']>;
  };

  const fill: Type<V>['fill'] = (a) =>
    RecordUtils.pick(recordType.fill(a), keysToPick) as V;

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

type PickedType<
  R extends Type<UnknownRecord>,
  KeysToPick extends readonly (keyof TypeOf<R>)[],
> = Type<Pick<TypeOf<R>, ArrayElement<KeysToPick>>>;

if (import.meta.vitest !== undefined) {
  test('dummy', () => {
    expect(0).toBe(0);
  });

  expectType<
    Pick<TypeOf<Type<{ a: Type<0>; b: Type<0>; c: Type<0> }>>, 'a' | 'b'>,
    {
      a: Type<0>;
      b: Type<0>;
    }
  >('=');

  expectType<
    Type<Pick<TypeOf<Type<{ a: Type<0>; b: Type<0>; c: Type<0> }>>, 'a' | 'b'>>,
    Type<{
      a: Type<0>;
      b: Type<0>;
    }>
  >('=');

  expectType<
    PickedType<Type<{ a: Type<0>; b: Type<0>; c: Type<0> }>, ['a', 'b']>,
    Type<{
      a: Type<0>;
      b: Type<0>;
    }>
  >('=');

  expectType<
    PickedType<
      Type<{ a: Type<0>; b: Type<0>; c: Type<0> }>,
      // @ts-expect-error key "d" doesn't exist
      ['a', 'd']
    >,
    0
  >('!=');
}
