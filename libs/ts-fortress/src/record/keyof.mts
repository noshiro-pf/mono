import { Arr, expectType, pipe } from 'ts-data-forge';
import { enumType } from '../enum/index.mjs';
import { undefinedType } from '../primitives/index.mjs';
import { type RecordType, type Type } from '../type.mjs';

export const keyof = <const R extends ReadonlyRecord<string, Type<unknown>>>(
  recordType: RecordType<R>,
  options?: PartialReadonly<{
    typeName: string;
  }>,
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
  Object.keys(recordType.shape) satisfies string[] as ToString<keyof R>[];

type KeyofTypeSub<R extends ReadonlyRecord<string, Type<unknown>>> = Type<
  ToString<keyof R>
>;

type KeyofType<R extends ReadonlyRecord<string, Type<unknown>>> =
  IsNever<keyof R> extends true ? Type<undefined> : KeyofTypeSub<R>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
expectType<keyof {}, never>('=');
expectType<ToString<keyof { 1: 1; 2: 2; 3: 3 }>, '1' | '2' | '3'>('=');

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
expectType<KeyofType<{}>, Type<undefined>>('=');

expectType<
  KeyofType<{ a: Type<0>; b: Type<1>; c: Type<2> }>,
  Type<'a' | 'b' | 'c'>
>('=');

expectType<
  KeyofType<{ x: Type<string>; y: Type<number>; z: Type<boolean> }>,
  Type<'x' | 'y' | 'z'>
>('=');

expectType<
  KeyofType<{ same: Type<string>; value: Type<string> }>,
  Type<'same' | 'value'>
>('=');

expectType<KeyofType<{ never: Type<never> }>, Type<'never'>>('=');
