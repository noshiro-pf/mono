import { expectType, Obj } from 'ts-data-forge';
import {
  type ExcessPropertyBehavior,
  type RecordType,
  type Type,
  type UnknownShape,
} from '../type.mjs';
import { toUnionKeyString } from '../utils/index.mjs';
import { record } from './record.mjs';

/** Creates a record type with keys omitted. */
export const omit = <
  const R extends UnknownShape,
  const KeysToOmit extends readonly (keyof R & string)[],
  const ExcessValidation extends ExcessPropertyBehavior = 'strip',
>(
  recordType: RecordType<R, ExcessValidation>,
  keysToOmit: KeysToOmit,
  options?: Partial<
    Readonly<{
      typeName: string;
      excessPropertyValidation: ExcessValidation;
      excessPropertyFill: Extract<ExcessPropertyBehavior, 'allow' | 'strip'>;
    }>
  >,
): OmittedType<R, KeysToOmit, ExcessValidation> =>
  record(Obj.omit(recordType.shape, keysToOmit), {
    typeName:
      options?.typeName ??
      `Omit<${recordType.typeName}, ${toUnionKeyString(keysToOmit)}>`,
    excessPropertyValidation:
      options?.excessPropertyValidation ?? recordType.excessPropertyValidation,
    excessPropertyFill:
      options?.excessPropertyFill ?? recordType.excessPropertyFill,
  });

export type OmittedType<
  R extends UnknownShape,
  KeysToOmit extends readonly (keyof R)[],
  ExcessValidation extends ExcessPropertyBehavior = 'strip',
> = RecordType<Omit<R, ArrayElement<KeysToOmit>>, ExcessValidation>;

expectType<
  Omit<Readonly<{ a: Type<0>; b: Type<1>; c: Type<2> }>, 'a' | 'b'>,
  Readonly<{
    c: Type<2>;
  }>
>('=');

expectType<
  RecordType<Omit<Readonly<{ a: Type<0>; b: Type<1>; c: Type<2> }>, 'a' | 'b'>>,
  Type<Readonly<{ c: 2 }>> &
    Readonly<{
      shape: Readonly<{ c: Type<2> }>;
      excessPropertyValidation: 'strip';
      excessPropertyFill: 'allow' | 'strip';
    }>
>('=');

expectType<
  OmittedType<
    Readonly<{ a: Type<0>; b: Type<1>; c: Type<2> }>,
    readonly ['a', 'b']
  >,
  Type<Readonly<{ c: 2 }>> &
    Readonly<{
      shape: Readonly<{ c: Type<2> }>;
      excessPropertyValidation: 'strip';
      excessPropertyFill: 'allow' | 'strip';
    }>
>('=');

expectType<
  OmittedType<
    Readonly<{ a: Type<0>; b: Type<1>; c: Type<2> }>,
    // @ts-expect-error key "d" doesn't exist
    readonly ['a', 'd']
  >,
  0
>('!=');
