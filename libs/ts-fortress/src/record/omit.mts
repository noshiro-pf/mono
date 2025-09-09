import { expectType, Obj } from 'ts-data-forge';
import { type RecordType, type Type } from '../type.mjs';
import { toUnionString } from '../utils/index.mjs';
import { record } from './record.mjs';

/** Creates a record type with keys omitted. */
export const omit = <
  const R extends ReadonlyRecord<string, Type<unknown>>,
  const KeysToOmit extends readonly (keyof R & string)[],
>(
  recordType: RecordType<R>,
  keysToOmit: KeysToOmit,
  options?: PartialReadonly<{
    typeName: string;

    /** @default true */
    allowExcessProperties: boolean;
  }>,
): OmittedType<R, KeysToOmit> =>
  record(Obj.omit(recordType.shape, keysToOmit), {
    typeName:
      options?.typeName ??
      `Omit<${recordType.typeName}, ${toUnionString(keysToOmit)}>`,
    allowExcessProperties:
      options?.allowExcessProperties ?? recordType.allowExcessProperties,
  });

export type OmittedType<
  R extends ReadonlyRecord<string, Type<unknown>>,
  KeysToOmit extends readonly (keyof R)[],
> = RecordType<Omit<R, ArrayElement<KeysToOmit>>>;

expectType<
  Omit<{ a: Type<0>; b: Type<1>; c: Type<2> }, 'a' | 'b'>,
  {
    c: Type<2>;
  }
>('=');

expectType<
  RecordType<Omit<{ a: Type<0>; b: Type<1>; c: Type<2> }, 'a' | 'b'>>,
  Type<Readonly<{ c: 2 }>> &
    Readonly<{
      shape: { c: Type<2> };
      allowExcessProperties: boolean;
    }>
>('=');

expectType<
  OmittedType<{ a: Type<0>; b: Type<1>; c: Type<2> }, ['a', 'b']>,
  Type<Readonly<{ c: 2 }>> &
    Readonly<{
      shape: { c: Type<2> };
      allowExcessProperties: boolean;
    }>
>('=');

expectType<
  OmittedType<
    { a: Type<0>; b: Type<1>; c: Type<2> },
    // @ts-expect-error key "d" doesn't exist
    ['a', 'd']
  >,
  0
>('!=');
