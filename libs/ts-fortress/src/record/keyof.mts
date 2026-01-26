import { Arr, expectType, pipe } from 'ts-data-forge';
import { enumType } from '../enum/index.mjs';
import { undefinedType } from '../primitives/index.mjs';
import { type RecordType, type Type } from '../type.mjs';

export const keyof = <const R extends ReadonlyRecord<string, Type<unknown>>>(
  recordType: RecordType<R>,
  options?: Partial<
    Readonly<{
      typeName: string;
    }>
  >,
): KeyofType<R> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  pipe(getKeys(recordType)).map((keys) =>
    Arr.isNonEmpty(keys)
      ? (enumType(keys, {
          typeName: options?.typeName ?? `keyof ${recordType.typeName}`,
        }) satisfies KeyofTypeSub<R>)
      : (undefinedType satisfies Type<undefined>),
  ).value as KeyofType<R>;

const getKeys = <const R extends ReadonlyRecord<string, Type<unknown>>>(
  recordType: RecordType<R>,
): readonly ToString<keyof R>[] =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  Object.keys(
    recordType.shape,
  ) satisfies readonly string[] as readonly string[] as readonly ToString<
    keyof R
  >[];

type KeyofTypeSub<R extends ReadonlyRecord<string, Type<unknown>>> = Type<
  ToString<keyof R>
>;

type KeyofType<R extends ReadonlyRecord<string, Type<unknown>>> =
  IsNever<keyof R> extends true ? Type<undefined> : KeyofTypeSub<R>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
expectType<keyof {}, never>('=');

expectType<ToString<keyof Readonly<{ 1: 1; 2: 2; 3: 3 }>>, '1' | '2' | '3'>(
  '=',
);

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
expectType<KeyofType<{}>, Type<undefined>>('=');

expectType<
  KeyofType<Readonly<{ a: Type<0>; b: Type<1>; c: Type<2> }>>,
  Type<'a' | 'b' | 'c'>
>('=');

expectType<
  KeyofType<Readonly<{ x: Type<string>; y: Type<number>; z: Type<boolean> }>>,
  Type<'x' | 'y' | 'z'>
>('=');

expectType<
  KeyofType<Readonly<{ same: Type<string>; value: Type<string> }>>,
  Type<'same' | 'value'>
>('=');

expectType<KeyofType<Readonly<{ never: Type<never> }>>, Type<'never'>>('=');
