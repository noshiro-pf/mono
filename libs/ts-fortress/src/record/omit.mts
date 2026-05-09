import { expectType, Obj } from 'ts-data-forge';
import {
  type ArrayElement,
  type StrictOmit,
  type UnknownRecord,
} from 'ts-type-forge';
import {
  type ExcessPropertyOption,
  flattenShapeStructure,
  hasRecordInternals,
  type Type,
  type TypeOf,
} from '../type.mjs';
import { toUnionKeyString } from '../utils/index.mjs';
import { record } from './record.mjs';

/** Creates a record type with keys omitted. */
export const omit = <
  const R extends UnknownRecord,
  const KeysToOmit extends readonly (keyof R & string)[],
>(
  recordType: Type<R>,
  keysToOmit: KeysToOmit,
  options?: Partial<
    Readonly<{
      typeName: string;
      excessProperty: ExcessPropertyOption;
    }>
  >,
): OmittedType<R, KeysToOmit> => {
  if (!hasRecordInternals(recordType)) {
    throw new Error(
      `Expected a record type but received: ${recordType.typeName}`,
    );
  }

  const shape = flattenShapeStructure(recordType.shapeStructure);

  if (shape === undefined) {
    throw new Error(
      `omit() requires a simple or intersection record type, but received a union type`,
    );
  }

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return record(Obj.omit(shape, keysToOmit), {
    typeName:
      options?.typeName ??
      `Omit<${recordType.typeName}, ${toUnionKeyString(keysToOmit)}>`,

    excessProperty: options?.excessProperty ?? recordType.excessProperty,
  }) as unknown as OmittedType<R, KeysToOmit>;
};

type OmittedType<
  R extends UnknownRecord,
  KeysToOmit extends readonly (keyof R & string)[],
> = Type<Readonly<Omit<R, ArrayElement<KeysToOmit>>>>;

// --- expectType assertions ---

{
  type Base = ReturnType<
    typeof record<Readonly<{ a: Type<0>; b: Type<1>; c: Type<2> }>>
  >;

  // omit removes specified keys from value type
  expectType<
    TypeOf<ReturnType<typeof omit<TypeOf<Base>, readonly ['a']>>>,
    Readonly<{ b: 1; c: 2 }>
  >('=');

  // omit with multiple keys
  expectType<
    TypeOf<ReturnType<typeof omit<TypeOf<Base>, readonly ['a', 'b']>>>,
    Readonly<{ c: 2 }>
  >('=');

  expectType<
    Omit<Readonly<{ a: Type<0>; b: Type<1>; c: Type<2> }>, 'a' | 'b'>,
    Readonly<{
      c: Type<2>;
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
}

{
  type A = Readonly<{ a: 0; b: 0; c: 0 } | { b: 0; c: 0; d: 0 }>;

  // TypeScript Omit will not distribute over unions, so we don't support unions in omit() - it will produce an error if given a union type
  expectType<Omit<A, 'b'>, Readonly<{ c: 0 }>>('=');

  expectType<StrictOmit<A, 'b'>, Readonly<{ c: 0 }>>('=');

  expectType<TypeOf<OmittedType<A, readonly ['b']>>, StrictOmit<A, 'b'>>('=');
}
