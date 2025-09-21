import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../../../type.mjs';
import { validationErrorsToMessages } from '../../../utils/index.mjs';
import { uuid, uuidV4, uuidV6, uuidV7 } from './uuid.mjs';

const nilUuid = '00000000-0000-0000-0000-000000000000';
const maxUuid = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
const uuidV4Example = '550e8400-e29b-41d4-a716-446655440000';
const uuidV6Example = '550e8400-e29b-61d4-a716-446655440000';
const uuidV7Example = '550e8400-e29b-71d4-a716-446655440000';

describe('uuid', () => {
  const baseType = uuid();

  type UuidType = TypeOf<typeof baseType>;
  expectType<UuidType, string>('<=');
  expectType<typeof baseType.defaultValue, UuidType>('=');

  test('provides nil UUID as default', () => {
    expect(baseType.defaultValue).toBe(nilUuid);
  });

  test('accepts multiple UUID flavours by default', () => {
    const validSamples = [
      uuidV4Example,
      uuidV6Example,
      uuidV7Example,
      nilUuid,
      maxUuid,
    ];

    for (const sample of validSamples) {
      expect(baseType.is(sample)).toBe(true);
    }
  });

  test('rejects malformed identifiers', () => {
    const invalidSamples = [
      'not-a-uuid',
      '550e8400e29b41d4a716446655440000',
      '550e8400-e29b-41d4-a716-44665544000',
    ];

    for (const sample of invalidSamples) {
      expect(baseType.is(sample)).toBe(false);
    }
  });

  test('validate surfaces details for invalid strings', () => {
    const result = baseType.validate('not-a-uuid');
    expect(Result.isErr(result)).toBe(true);
    if (!Result.isErr(result)) {
      throw new Error('Expected validation failure');
    }

    expect(result.value).toStrictEqual([
      {
        path: [],
        actualValue: 'not-a-uuid',
        expectedType: 'Uuid',
        typeName: 'Uuid',
        message: undefined,
      },
    ]);

    expect(validationErrorsToMessages(result.value)).toStrictEqual([
      'Expected <Uuid>, got <string> type value "not-a-uuid".',
    ]);
  });
});

describe('uuidV4', () => {
  const v4Type = uuidV4();

  type UuidV4Type = TypeOf<typeof v4Type>;
  expectType<UuidV4Type, string>('<=');
  expectType<typeof v4Type.defaultValue, UuidV4Type>('=');

  test('recognizes version 4 UUIDs only', () => {
    expect(v4Type.is(uuidV4Example)).toBe(true);
    expect(v4Type.is(uuidV6Example)).toBe(false);
  });

  test('validate reports version mismatch', () => {
    const result = v4Type.validate(uuidV6Example);
    expect(Result.isErr(result)).toBe(true);
    if (!Result.isErr(result)) {
      throw new Error('Expected validation failure');
    }

    expect(result.value).toStrictEqual([
      {
        path: [],
        actualValue: uuidV6Example,
        expectedType: 'UuidV4',
        typeName: 'UuidV4',
        message: undefined,
      },
    ]);
  });

  test('fill returns default for invalid input', () => {
    expect(v4Type.fill('invalid-uuid')).toBe(v4Type.defaultValue);
  });
});

describe('uuidV6', () => {
  const v6Type = uuidV6();

  test('recognizes only version 6 UUIDs', () => {
    expect(v6Type.is(uuidV6Example)).toBe(true);
    expect(v6Type.is(uuidV4Example)).toBe(false);
    expect(v6Type.is(uuidV7Example)).toBe(false);
  });
});

describe('uuidV7', () => {
  const v7Type = uuidV7();

  test('recognizes only version 7 UUIDs', () => {
    expect(v7Type.is(uuidV7Example)).toBe(true);
    expect(v7Type.is(uuidV4Example)).toBe(false);
    expect(v7Type.is(uuidV6Example)).toBe(false);
  });
});
