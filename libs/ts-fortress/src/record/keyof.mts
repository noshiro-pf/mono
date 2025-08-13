import { Arr, expectType, pipe } from 'ts-data-forge';
import { enumType } from '../enum/index.mjs';
import { undefinedType } from '../primitives/index.mjs';
import { type Type, type TypeOf } from '../type.mjs';

export const keyof = <const R extends Type<UnknownRecord>>(
  recordType: R,
  options?: Partial<
    Readonly<{
      typeName: string;
    }>
  >,
): KeyofType<R> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  pipe(Object.keys(recordType.defaultValue)).map((keys) =>
    Arr.isNonEmpty(keys)
      ? enumType(keys, {
          typeName: options?.typeName ?? `keyof ${recordType.typeName}`,
        })
      : undefinedType,
  ).value as KeyofType<R>;

type KeyofType<R extends Type<UnknownRecord>> = Type<ToString<keyof TypeOf<R>>>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
expectType<KeyofType<Type<{}>>, Type<never>>('=');

expectType<
  KeyofType<Type<{ a: Type<0>; b: Type<0>; c: Type<0> }>>,
  Type<'a' | 'b' | 'c'>
>('=');

expectType<
  KeyofType<Type<{ 1: Type<0>; 2: Type<0>; 3: Type<0> }>>,
  Type<'1' | '2' | '3'>
>('=');
