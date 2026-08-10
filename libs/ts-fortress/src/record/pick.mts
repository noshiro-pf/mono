import { expectType, Obj } from 'ts-data-forge';
import {
  type ArrayElement,
  type StrictPick,
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

/** Creates a record type with keys picked. */
export const pick = <
  const R extends UnknownRecord,
  const KeysToPick extends readonly (keyof R & string)[],
>(
  recordType: Type<R>,
  keysToPick: KeysToPick,
  options?: Partial<
    Readonly<{
      typeName: string;
      excessProperty: ExcessPropertyOption;
    }>
  >,
): PickedType<R, KeysToPick> => {
  if (!hasRecordInternals(recordType)) {
    throw new Error(
      `Expected a record type but received: ${recordType.typeName}`,
    );
  }

  const shape = flattenShapeStructure(recordType.shapeStructure);

  if (shape === undefined) {
    throw new Error(
      `pick() requires a simple or intersection record type, but received a union type`,
    );
  }

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return record(Obj.pick(shape, keysToPick), {
    typeName:
      options?.typeName ??
      `Pick<${recordType.typeName}, ${toUnionKeyString(keysToPick)}>`,

    excessProperty: options?.excessProperty ?? recordType.excessProperty,
  }) as unknown as PickedType<R, KeysToPick>;
};

type PickedType<
  R extends UnknownRecord,
  KeysToPick extends readonly (keyof R & string)[],
> = Type<Readonly<StrictPick<R, ArrayElement<KeysToPick>>>>;

// --- expectType assertions ---

{
  type Base = ReturnType<
    typeof record<Readonly<{ a: Type<0>; b: Type<1>; c: Type<2> }>>
  >;

  // pick narrows value type to picked keys
  expectType<
    TypeOf<ReturnType<typeof pick<TypeOf<Base>, readonly ['a', 'b']>>>,
    Readonly<{ a: 0; b: 1 }>
  >('=');

  // pick with single key
  expectType<
    TypeOf<ReturnType<typeof pick<TypeOf<Base>, readonly ['c']>>>,
    Readonly<{ c: 2 }>
  >('=');
}
