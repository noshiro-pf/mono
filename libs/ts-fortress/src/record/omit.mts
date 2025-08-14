import { expectType, isRecord, Obj, Result } from 'ts-data-forge';
import { type Type, type TypeOf } from '../type.mjs';
import { createAssertFn, createCastFn, createIsFn } from '../utils/index.mjs';
import { createPrimitiveValidationError } from '../validation-error.mjs';

/** Creates a record type with keys omitted. */
export const omit = <
  const R extends Type<UnknownRecord>,
  const KeysToOmit extends readonly (keyof TypeOf<R> & string)[],
>(
  recordType: R,
  keysToOmit: KeysToOmit,
  options?: Partial<
    Readonly<{
      typeName: string;
    }>
  >,
): OmittedType<R, KeysToOmit> => {
  type V = Omit<TypeOf<R>, ArrayElement<KeysToOmit>>;

  const typeNameFilled: string =
    options?.typeName ??
    `Omit<${recordType.typeName}, ${keysToOmit.join('|')}>`;

  const defaultValue: V = Obj.omit(recordType.defaultValue, keysToOmit);

  const validate: Type<V>['validate'] = (a) => {
    if (!isRecord(a)) {
      return Result.err([
        createPrimitiveValidationError({
          actualValue: a,
          expectedType: 'record',
          typeName: typeNameFilled,
        }),
      ]);
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const objectFilled = {
      ...Obj.pick(recordType.fill(a), keysToOmit),
      ...a,
    } as TypeOf<R>;

    const baseValidationResult = recordType.validate(objectFilled);

    return Result.map(baseValidationResult, Obj.omit(keysToOmit)) as ReturnType<
      Type<V>['validate']
    >;
  };

  const fill: Type<V>['fill'] = (a) => Obj.omit(recordType.fill(a), keysToOmit);

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

type OmittedType<
  R extends Type<UnknownRecord>,
  KeysToOmit extends readonly (keyof TypeOf<R>)[],
> = Type<Omit<TypeOf<R>, ArrayElement<KeysToOmit>>>;

expectType<
  Omit<TypeOf<Type<{ a: Type<0>; b: Type<0>; c: Type<0> }>>, 'a' | 'b'>,
  {
    c: Type<0>;
  }
>('=');

expectType<
  Type<Omit<TypeOf<Type<{ a: Type<0>; b: Type<0>; c: Type<0> }>>, 'a' | 'b'>>,
  Type<{
    c: Type<0>;
  }>
>('=');

expectType<
  OmittedType<Type<{ a: Type<0>; b: Type<0>; c: Type<0> }>, ['a', 'b']>,
  Type<{
    c: Type<0>;
  }>
>('=');

expectType<
  OmittedType<
    Type<{ a: Type<0>; b: Type<0>; c: Type<0> }>,
    // @ts-expect-error key "d" doesn't exist
    ['a', 'd']
  >,
  0
>('!=');
