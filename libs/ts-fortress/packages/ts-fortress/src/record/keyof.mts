import { Arr, expectType, pipe } from 'ts-data-forge';
import { type IsNever, type ToString, type UnknownRecord } from 'ts-type-forge';
import { enumType } from '../enum/index.mjs';
import { undefinedType } from '../primitives/index.mjs';
import {
  type ShapeStructure,
  type Type,
  type TypeOf,
  hasRecordInternals,
} from '../type.mjs';

export const keyof = <const R extends UnknownRecord>(
  recordType: Type<R>,
  options?: Partial<
    Readonly<{
      typeName: string;
    }>
  >,
): KeyofType<R> => {
  if (!hasRecordInternals(recordType)) {
    throw new Error(
      `Expected a record type but received: ${recordType.typeName}`,
    );
  }

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return pipe(getKeysFromStructure(recordType.shapeStructure)).map((keys) =>
    Arr.isNonEmpty(keys)
      ? (enumType(keys, {
          typeName: options?.typeName ?? `keyof ${recordType.typeName}`,
        }) satisfies Type<string>)
      : (undefinedType satisfies Type<undefined>),
  ).value as KeyofType<R>;
};

const getKeysFromStructure = (structure: ShapeStructure): readonly string[] => {
  switch (structure.kind) {
    case 'simple':
      return Object.keys(structure.shape);

    case 'union':
      return getKeysHelper(structure.variants);

    case 'intersection':
      return getKeysHelper(structure.parts);
  }
};

const getKeysHelper = (
  structures: readonly ShapeStructure[],
): readonly string[] => {
  const mut_allKeys = new Set<string>();

  for (const part of structures) {
    const keys = getKeysFromStructure(part);

    for (const key of keys) {
      mut_allKeys.add(key);
    }
  }

  return Array.from(mut_allKeys);
};

type KeyofType<R extends UnknownRecord> =
  IsNever<keyof R> extends true ? Type<undefined> : Type<ToString<keyof R>>;

// --- expectType assertions ---

{
  type Base = Readonly<{ a: 0; b: 1; c: 2 }>;

  // keyof extracts string keys
  expectType<TypeOf<ReturnType<typeof keyof<Base>>>, 'a' | 'b' | 'c'>('=');

  // keyof of empty record yields undefined
  type EmptyRecord = Readonly<Record<never, never>>;

  expectType<TypeOf<ReturnType<typeof keyof<EmptyRecord>>>, undefined>('=');

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  expectType<KeyofType<{}>, Type<undefined>>('=');

  expectType<KeyofType<Readonly<{ a: 0; b: 1; c: 2 }>>, Type<'a' | 'b' | 'c'>>(
    '=',
  );

  expectType<
    KeyofType<Readonly<{ x: string; y: number; z: boolean }>>,
    Type<'x' | 'y' | 'z'>
  >('=');

  expectType<
    KeyofType<Readonly<{ same: string; value: string }>>,
    Type<'same' | 'value'>
  >('=');

  expectType<KeyofType<Readonly<{ never: never }>>, Type<'never'>>('=');
}
