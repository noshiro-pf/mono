import { expectType, Obj } from 'ts-data-forge';
import { type RecordType, type Type } from '../type.mjs';
import { toUnionString } from '../utils/index.mjs';
import { record } from './record.mjs';

/** Creates a record type with keys picked. */
export const pick = <
  const R extends ReadonlyRecord<string, Type<unknown>>,
  const KeysToPick extends readonly (keyof R & string)[],
>(
  recordType: RecordType<R>,
  keysToPick: KeysToPick,
  options?: Partial<
    Readonly<{
      typeName: string;

      /** @default true */
      allowExcessProperties: boolean;
    }>
  >,
): PickedType<R, KeysToPick> =>
  record(Obj.pick(recordType.shape, keysToPick), {
    typeName:
      options?.typeName ??
      `Pick<${recordType.typeName}, ${toUnionString(keysToPick)}>`,
    allowExcessProperties:
      options?.allowExcessProperties ?? recordType.allowExcessProperties,
  });

export type PickedType<
  R extends ReadonlyRecord<string, Type<unknown>>,
  KeysToPick extends readonly (keyof R)[],
> = RecordType<Pick<R, ArrayElement<KeysToPick>>>;

expectType<
  Pick<{ a: Type<0>; b: Type<1>; c: Type<2> }, 'a' | 'b'>,
  {
    a: Type<0>;
    b: Type<1>;
  }
>('=');

expectType<
  RecordType<Pick<{ a: Type<0>; b: Type<1>; c: Type<2> }, 'a' | 'b'>>,
  Type<Readonly<{ a: 0; b: 1 }>> &
    Readonly<{
      shape: { a: Type<0>; b: Type<1> };
      allowExcessProperties: boolean;
    }>
>('=');

expectType<
  PickedType<{ a: Type<0>; b: Type<1>; c: Type<2> }, ['a', 'b']>,
  Type<Readonly<{ a: 0; b: 1 }>> &
    Readonly<{
      shape: { a: Type<0>; b: Type<1> };
      allowExcessProperties: boolean;
    }>
>('=');

expectType<
  PickedType<
    { a: Type<0>; b: Type<1>; c: Type<2> },
    // @ts-expect-error key "d" doesn't exist
    ['a', 'd']
  >,
  0
>('!=');
