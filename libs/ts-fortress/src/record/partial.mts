import { expectType } from 'ts-data-forge';
import {
  type ExcessPropertyOption,
  type Type,
  type TypeOf,
  type UnknownShape,
  flattenShapeStructure,
  hasRecordInternals,
} from '../type.mjs';
import { toUnionKeyString } from '../utils/index.mjs';
import { optional } from './optional.mjs';
import { record } from './record.mjs';

/**
 * Creates a Partial type. If keysToBeOptional is set, only those keys are
 * optional, otherwise, all properties are optional.
 */
export const partial = <
  const R extends UnknownRecord,
  const KeysToBeOptional extends NonEmptyArray<keyof R & string>,
>(
  recordType: Type<R>,
  options?: Partial<
    Readonly<{
      keysToBeOptional: KeysToBeOptional;
      typeName: string;
      excessProperty: ExcessPropertyOption;
    }>
  >,
): PartialType<R, KeysToBeOptional> => {
  if (!hasRecordInternals(recordType)) {
    throw new Error(
      `Expected a record type but received: ${recordType.typeName}`,
    );
  }

  const shape = flattenShapeStructure(recordType.shapeStructure);

  if (shape === undefined) {
    throw new Error(
      `partial() requires a simple or intersection record type, but received a union type`,
    );
  }

  const typeNameFilled: string =
    options?.typeName ??
    (options?.keysToBeOptional === undefined
      ? `Partial<${recordType.typeName}>`
      : `PartiallyPartial<${recordType.typeName}, ${toUnionKeyString(options.keysToBeOptional)}>`);

  const keysToBeOptional: ReadonlySet<string> = new Set(
    options?.keysToBeOptional ?? Object.keys(shape),
  );

  const partialShape = Object.fromEntries(
    Object.entries(shape).map(
      ([k, v]) => [k, keysToBeOptional.has(k) ? optional(v) : v] as const,
    ),
  ) satisfies UnknownShape;

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return record(partialShape, {
    typeName: typeNameFilled,
    excessProperty: options?.excessProperty ?? recordType.excessProperty,
  }) as unknown as PartialType<R, KeysToBeOptional>;
};

type PartialType<
  R extends UnknownRecord,
  KeysToBeOptional extends NonEmptyArray<keyof R & string> | undefined =
    undefined,
> = Type<PartialValue<R, KeysToBeOptional>>;

/** Compute the partial value type. */
type PartialValue<
  R extends UnknownRecord,
  KeysToBeOptional extends NonEmptyArray<keyof R & string> | undefined,
> =
  TypeEq<KeysToBeOptional, undefined> extends true
    ? Partial<R>
    : PartiallyPartial<R, ArrayElement<KeysToBeOptional>>;

// --- expectType assertions ---

{
  type Base = ReturnType<
    typeof record<Readonly<{ a: Type<0>; b: Type<1>; c: Type<2> }>>
  >;

  expectType<
    PartialType<TypeOf<Base>, readonly ['a', 'b', 'c']>,
    Type<Partial<Readonly<{ a: 0; b: 1; c: 2 }>>>
  >('=');

  expectType<
    PartialType<TypeOf<Base>, readonly ['a', 'b']>,
    Type<Readonly<{ a?: 0; b?: 1; c: 2 }>>
  >('=');

  expectType<
    // @ts-expect-error NonEmptyArray is required if keysToBeOptional is provided
    PartialType<TypeOf<Base>, readonly []>,
    Type<Readonly<{ a?: 0; b?: 1; c: 2 }>>
  >('!=');

  expectType<
    PartialType<TypeOf<Base>>,
    Type<Readonly<{ a?: 0; b?: 1; c?: 2 }>>
  >('=');

  // partial with no keys makes all properties optional
  expectType<
    TypeOf<
      ReturnType<typeof partial<TypeOf<Base>, NonEmptyArray<'a' | 'b' | 'c'>>>
    >,
    Partial<Readonly<{ a: 0; b: 1; c: 2 }>>
  >('=');
}
