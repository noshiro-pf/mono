import { expectType, Result } from 'ts-data-forge';
import type { NonEmptyString } from 'ts-type-forge';
import type { TypeOf } from '../../../type.mjs';
import { validationErrorsToMessages } from '../../../utils/index.mjs';
import { uuid, uuidV4, uuidV6, uuidV7, type UuidBaseString } from './uuid.mjs';

const nilUuid = '00000000-0000-0000-0000-000000000000';

const maxUuid = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

const uuidV4Example = '550e8400-e29b-41d4-a716-446655440000';

const uuidV6Example = '550e8400-e29b-61d4-a716-446655440000';

const uuidV7Example = '550e8400-e29b-71d4-a716-446655440000';

describe(uuid, () => {
  const baseType = uuid();

  type UuidType = TypeOf<typeof baseType>;

  expectType<UuidType, string>('<=');

  expectType<UuidType, NonEmptyString>('<=');

  expectType<typeof baseType.defaultValue, UuidType>('=');

  test('provides nil UUID as default', () => {
    expect(baseType.defaultValue).toBe(nilUuid);
  });

  test.each([
    uuidV4Example,
    uuidV6Example,
    uuidV7Example,
    nilUuid,
    maxUuid,
  ] as const)('accepts $0', (u) => {
    assert.isTrue(baseType.is(u));
  });

  test.each([
    'not-a-uuid',
    '550e8400e29b41d4a716446655440000',
    '550e8400-e29b-41d4-a716-44665544000',
  ] as const)('rejects $0', (u) => {
    assert.isFalse(baseType.is(u));
  });

  test('validate surfaces details for invalid strings', () => {
    const result = baseType.validate('not-a-uuid');

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value, [
      {
        path: [],
        actualValue: 'not-a-uuid',
        expectedType: 'Uuid',
        typeName: 'Uuid',
        details: undefined,
      },
    ]);

    assert.deepStrictEqual(validationErrorsToMessages(result.value), [
      'Error: expected <Uuid> type but <string> type value "not-a-uuid" was passed.',
    ]);
  });
});

describe(uuidV4, () => {
  const v4Type = uuidV4();

  type UuidV4Type = TypeOf<typeof v4Type>;

  expectType<UuidV4Type, string>('<=');

  expectType<typeof v4Type.defaultValue, UuidV4Type>('=');

  test('recognizes version 4 UUIDs only', () => {
    assert.isTrue(v4Type.is(uuidV4Example));

    assert.isFalse(v4Type.is(uuidV6Example));
  });

  test('validate reports version mismatch', () => {
    const result = v4Type.validate(uuidV6Example);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value, [
      {
        path: [],
        actualValue: uuidV6Example,
        expectedType: 'UuidV4',
        typeName: 'UuidV4',
        details: undefined,
      },
    ]);
  });

  test('fill returns default for invalid input', () => {
    expect(v4Type.fill('invalid-uuid')).toBe(v4Type.defaultValue);
  });
});

describe(uuidV6, () => {
  const v6Type = uuidV6();

  test('recognizes only version 6 UUIDs', () => {
    assert.isTrue(v6Type.is(uuidV6Example));

    assert.isFalse(v6Type.is(uuidV4Example));

    assert.isFalse(v6Type.is(uuidV7Example));
  });
});

describe(uuidV7, () => {
  const v7Type = uuidV7();

  test('recognizes only version 7 UUIDs', () => {
    assert.isTrue(v7Type.is(uuidV7Example));

    assert.isFalse(v7Type.is(uuidV4Example));

    assert.isFalse(v7Type.is(uuidV6Example));
  });
});

describe('uuid with a version and no defaultValue', () => {
  test.each([1, 2, 3, 4, 5, 6, 7, 8, 'nil', 'max', 'all', 'loose'] as const)(
    'version %s builds, and its default passes its own is',
    (version) => {
      const type = uuid({ version });

      assert.isTrue(type.is(type.defaultValue));
    },
  );

  test.each([1, 2, 3, 4, 5, 6, 7, 8] as const)(
    'version %s defaults to 00000000-0000-V000-8000-000000000000',
    (version) => {
      assert.strictEqual(
        uuid({ version }).defaultValue,
        `00000000-0000-${version.toString()}000-8000-000000000000`,
      );
    },
  );

  test("'max' defaults to the max UUID", () => {
    assert.strictEqual(uuid({ version: 'max' }).defaultValue, maxUuid);
  });
});

describe('uuid reads hexadecimal digits in any case', () => {
  const versioned = (version: number): string =>
    `aaaaaaaa-bbbb-${version.toString()}ccc-8ddd-eeeeeeeeeeee` as const;

  const cases = (lower: string): readonly string[] =>
    [
      lower,
      lower.toUpperCase(),
      `${lower.slice(0, 4).toUpperCase()}${lower.slice(4)}`,
    ] as const;

  test.each([1, 2, 3, 4, 5, 6, 7, 8] as const)(
    'version %s accepts lower, upper and mixed case',
    (version) => {
      const type = uuid({ version });

      for (const s of cases(versioned(version))) {
        assert.isTrue(type.is(s));
      }
    },
  );

  test("'all' and 'loose' accept lower, upper and mixed case", () => {
    for (const version of ['all', 'loose'] as const) {
      const type = uuid({ version });

      for (const s of cases(versioned(4))) {
        assert.isTrue(type.is(s));
      }
    }
  });

  test("'max' and 'all' accept the max UUID in upper and mixed case", () => {
    for (const version of ['max', 'all'] as const) {
      const type = uuid({ version });

      for (const s of [
        'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF',
        'FFFFffff-ffff-ffff-ffff-ffffffffffff',
      ]) {
        assert.isTrue(type.is(s));
      }
    }
  });

  test('a mixed-case max UUID is a UuidBaseString', () => {
    expectType<'FFFFffff-ffff-ffff-ffff-ffffffffffff', UuidBaseString>('<=');

    expectType<'00000000-0000-9000-8000-000000000000', UuidBaseString>('!<=');

    assert.isTrue(true);
  });
});
