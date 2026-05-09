import { expectType } from 'ts-data-forge';
import {
  type ArrayElement,
  type NonEmptyArray,
  type PartiallyRequired,
  type TypeEq,
  type UnknownRecord,
} from 'ts-type-forge';
import {
  flattenShapeStructure,
  hasRecordInternals,
  type ExcessPropertyOption,
  type Type,
  type TypeOf,
  type UnknownShape,
} from '../type.mjs';
import { toUnionKeyString } from '../utils/index.mjs';
import { isOptionalProperty, type RequiredPropertyType } from './optional.mjs';
import { record } from './record.mjs';

/**
 * Creates a Required type. If keysToBeRequired is set, only those keys are
 * made required, otherwise, all properties are made required.
 */
export const required = <
  const R extends UnknownRecord,
  const KeysToBeRequired extends NonEmptyArray<keyof R & string>,
>(
  recordType: Type<R>,
  options?: Partial<
    Readonly<{
      keysToBeRequired: KeysToBeRequired;
      typeName: string;
      excessProperty: ExcessPropertyOption;
    }>
  >,
): RequiredType<R, KeysToBeRequired> => {
  if (!hasRecordInternals(recordType)) {
    throw new Error(
      `Expected a record type but received: ${recordType.typeName}`,
    );
  }

  const shape = flattenShapeStructure(recordType.shapeStructure);

  if (shape === undefined) {
    throw new Error(
      `required() requires a simple or intersection record type, but received a union type`,
    );
  }

  const typeNameFilled: string =
    options?.typeName ??
    (options?.keysToBeRequired === undefined
      ? `Required<${recordType.typeName}>`
      : `PartiallyRequired<${recordType.typeName}, ${toUnionKeyString(options.keysToBeRequired)}>`);

  const keysToBeRequired: ReadonlySet<string> = new Set(
    options?.keysToBeRequired ?? Object.keys(shape),
  );

  const requiredShape = Object.fromEntries(
    Object.entries(shape).map(
      ([k, v]) => [k, keysToBeRequired.has(k) ? makeRequired(v) : v] as const,
    ),
  ) satisfies UnknownShape;

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return record(requiredShape, {
    typeName: typeNameFilled,
    excessProperty: options?.excessProperty ?? recordType.excessProperty,
  }) as unknown as Type<RequiredValue<R, KeysToBeRequired>>;
};

type RequiredType<
  R extends UnknownRecord,
  KeysToBeRequired extends NonEmptyArray<keyof R & string>,
> = Type<RequiredValue<R, KeysToBeRequired>>;

/** Compute the required value type. */
type RequiredValue<
  R extends UnknownRecord,
  KeysToBeRequired extends NonEmptyArray<keyof R & string> | undefined,
> =
  TypeEq<KeysToBeRequired, undefined> extends true
    ? Readonly<Required<R>>
    : PartiallyRequired<R, ArrayElement<KeysToBeRequired>>;

/**
 * Makes an optional property required by removing the optional flag.
 */
const makeRequired = <T extends Type<unknown>>(
  t: T,
): RequiredPropertyType<T> => {
  if (!isOptionalProperty(t)) {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return t as RequiredPropertyType<T>;
  }

  const { optional: _, ...rest } = t;

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return rest as RequiredPropertyType<T>;
};

// --- expectType assertions ---

{
  type Base = ReturnType<
    typeof record<
      Readonly<{ a: Type<0>; b: Type<1 | undefined>; c: Type<2 | undefined> }>
    >
  >;

  // required with no keys makes all properties required
  expectType<
    TypeOf<ReturnType<typeof required<TypeOf<Base>, readonly ['a', 'b', 'c']>>>,
    Readonly<Required<Readonly<{ a: 0; b: 1 | undefined; c: 2 | undefined }>>>
  >('=');
}
