import { expectType, Obj } from 'ts-data-forge';
import {
  type ExcessPropertyBehavior,
  type RecordType,
  type Type,
} from '../type.mjs';
import { toUnionKeyString } from '../utils/index.mjs';
import { record } from './record.mjs';

/** Creates a record type with keys picked. */
export const pick = <
  const R extends ReadonlyRecord<string, Type<unknown>>,
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  const KeysToPick extends readonly (keyof R & string)[],
  const ExcessValidation extends ExcessPropertyBehavior = 'strip',
>(
  recordType: RecordType<R, ExcessValidation>,
  keysToPick: KeysToPick,
  options?: PartialReadonly<{
    typeName: string;
    excessPropertyValidation: ExcessValidation;
    excessPropertyFill: Extract<ExcessPropertyBehavior, 'allow' | 'strip'>;
  }>,
): PickedType<R, KeysToPick, ExcessValidation> =>
  record(Obj.pick(recordType.shape, keysToPick), {
    typeName:
      options?.typeName ??
      `Pick<${recordType.typeName}, ${toUnionKeyString(keysToPick)}>`,
    excessPropertyValidation:
      options?.excessPropertyValidation ?? recordType.excessPropertyValidation,
    excessPropertyFill:
      options?.excessPropertyFill ?? recordType.excessPropertyFill,
  });

export type PickedType<
  R extends ReadonlyRecord<string, Type<unknown>>,
  KeysToPick extends readonly (keyof R)[],
  ExcessValidation extends ExcessPropertyBehavior = 'strip',
> = RecordType<Pick<R, ArrayElement<KeysToPick>>, ExcessValidation>;

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
      excessPropertyValidation: 'strip';
      excessPropertyFill: 'allow' | 'strip';
    }>
>('=');

expectType<
  PickedType<{ a: Type<0>; b: Type<1>; c: Type<2> }, ['a', 'b']>,
  Type<Readonly<{ a: 0; b: 1 }>> &
    Readonly<{
      shape: { a: Type<0>; b: Type<1> };
      excessPropertyValidation: 'strip';
      excessPropertyFill: 'allow' | 'strip';
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
