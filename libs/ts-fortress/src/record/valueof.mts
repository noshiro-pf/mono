import { Arr, expectType } from 'ts-data-forge';
import { type IsNever, type UnknownRecord, type ValueOf } from 'ts-type-forge';
import { union } from '../compose/index.mjs';
import { undefinedType } from '../primitives/index.mjs';
import {
  flattenShapeStructure,
  hasRecordInternals,
  type Type,
  type TypeOf,
} from '../type.mjs';

export type { ValueOf } from 'ts-type-forge';

export const valueof = <const R extends UnknownRecord>(
  recordType: Type<R>,
  options?: Partial<
    Readonly<{
      typeName: string;
    }>
  >,
): ValueOfType<R> => {
  if (!hasRecordInternals(recordType)) {
    throw new Error(
      `Expected a record type but received: ${recordType.typeName}`,
    );
  }

  const shape = flattenShapeStructure(recordType.shapeStructure);

  if (shape === undefined) {
    throw new Error(
      `valueof() requires a simple or intersection record type, but received a union type`,
    );
  }

  const types = Object.values(shape);

  if (Arr.isArrayAtLeastLength(types, 2)) {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return union(types, {
      typeName: options?.typeName ?? `ValueOf<${recordType.typeName}>`,
    }) as ValueOfType<R>;
  }

  if (Arr.isNonEmpty(types)) {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return types[0] as ValueOfType<R>;
  }

  // types is empty

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return undefinedType satisfies Type<undefined> as ValueOfType<R>;
};

type ValueOfType<T extends UnknownRecord> =
  IsNever<keyof T> extends true ? Type<undefined> : Type<ValueOf<T>>;

// --- expectType assertions ---

{
  // valueof extracts union of value types
  type Base = Readonly<{ a: 0; b: 1; c: 2 }>;

  expectType<TypeOf<ReturnType<typeof valueof<Base>>>, 0 | 1 | 2>('=');

  // valueof of single-key record yields that value type
  type Single = Readonly<{ x: 'hello' }>;

  expectType<TypeOf<ReturnType<typeof valueof<Single>>>, 'hello'>('=');

  // valueof of empty record yields undefined
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  type EmptyRecord = Readonly<{}>;

  expectType<ValueOfType<EmptyRecord>, Type<undefined>>('=');

  expectType<TypeOf<ReturnType<typeof valueof<EmptyRecord>>>, undefined>('=');
}
