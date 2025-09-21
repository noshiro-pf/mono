import { asInt, expectType, Result } from 'ts-data-forge';
import {
  array,
  arrayOfLength,
  enumType,
  int,
  intersection,
  intRange,
  keyof,
  keyValueRecord,
  literal,
  mergeRecords,
  nonEmptyArray,
  nullable,
  nullType,
  number,
  optional,
  partial,
  pick,
  record,
  recursion,
  refine,
  simpleBrandedString,
  tuple,
  uintRange,
  undefinedType,
  union,
  unknown,
  validationErrorsToMessages,
  type Type,
  type TypeOf,
} from '../src/index.mjs';

describe('nested record', () => {
  const nestedRecord = record({
    xs: array(int(asInt(2))),
    rec: pick(
      record({
        a: uintRange({ start: 0, end: 11, defaultValue: 0 }),
        b: uintRange({ start: 0, end: 11, defaultValue: 0 }),
        c: optional(uintRange({ start: 3, end: 6, defaultValue: 3 })),
        d: unknown(),
      }),
      ['a', 'b', 'c'],
    ),
    meta: number(100),
    u: unknown(),
  });

  type NestedRecord = TypeOf<typeof nestedRecord>;

  expectType<
    NestedRecord,
    Readonly<{
      xs: readonly Int[];
      rec: Readonly<{
        a: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
        b: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
        c?: 3 | 4 | 5;
      }>;
      meta: number;
      u: unknown;
    }>
  >('=');

  expectType<typeof nestedRecord.defaultValue, NestedRecord>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: UnknownRecord = {
        xs: [1, 2, 3],
        rec: {
          a: 1,
          b: 2,
          c: 3,
        },
        meta: 3,
        u: undefined,
      };

      if (nestedRecord.is(x)) {
        expectType<typeof x, NestedRecord>('=');
      } else {
        expectType<typeof x, UnknownRecord>('=');
      }

      expect(nestedRecord.is(x)).toBe(true);
    });

    test('falsy case', () => {
      const x: UnknownRecord = {
        xs: [-1, 2.2, 3.3],
        rec: {
          a: 123,
          b: 234,
          c: 3,
        },
        meta: 345,
        u: undefined,
      };

      if (nestedRecord.is(x)) {
        expectType<typeof x, NestedRecord>('=');
      } else {
        expectType<typeof x, UnknownRecord>('=');
      }

      expect(nestedRecord.is(x)).toBe(false);
    });
  });

  describe('validate', () => {
    test('falsy case', () => {
      const x: UnknownRecord = {
        xs: [-1, 2.2, 3.3],
        rec: {
          a: 123,
          b: 234,
          c: 3,
        },
        meta: 345,
        u: undefined,
      };

      const result = nestedRecord.validate(x);
      expect(Result.isErr(result)).toBe(true);

      const resultError = Result.unwrapErrThrow(result);
      expect(resultError).toStrictEqual([
        {
          path: ['xs', '1'],
          actualValue: 2.2,
          expectedType: 'Int',
          typeName: '"Finite" & "Int" & not("NaNValue")',
          message: undefined,
        },
        {
          path: ['xs', '2'],
          actualValue: 3.3,
          expectedType: 'Int',
          typeName: '"Finite" & "Int" & not("NaNValue")',
          message: undefined,
        },
        {
          path: ['rec', 'a'],
          actualValue: 123,
          expectedType: 'uintRange(0, 11)',
          typeName: 'uintRange(0, 11)',
          message: 'The value is expected to be an integer between 0 and 10',
        },
        {
          path: ['rec', 'b'],
          actualValue: 234,
          expectedType: 'uintRange(0, 11)',
          typeName: 'uintRange(0, 11)',
          message: 'The value is expected to be an integer between 0 and 10',
        },
      ]);
      expect(validationErrorsToMessages(resultError)).toStrictEqual([
        'Expected <Int> at xs.1, got <number> type value `2.2`.',
        'Expected <Int> at xs.2, got <number> type value `3.3`.',
        'The value is expected to be an integer between 0 and 10 at rec.a',
        'The value is expected to be an integer between 0 and 10 at rec.b',
      ]);
    });
  });

  describe('fill', () => {
    test('from an empty record', () => {
      const x: UnknownRecord = {};

      expect(nestedRecord.fill(x)).toStrictEqual({
        xs: [],
        rec: {
          a: 0,
          b: 0,
          c: 3,
        },
        meta: 100,
        u: undefined,
      });
    });

    test('from a filled record', () => {
      const x: UnknownRecord = {
        xs: [-1, 2.2, 3.3],
        rec: {
          a: 123,
          b: 234,
          c: 3,
        },
        meta: 345,
        u: undefined,
      };

      expect(nestedRecord.fill(x)).toStrictEqual({
        xs: [-1, 2, 2],
        rec: {
          a: 0,
          b: 0,
          c: 3,
        },
        meta: 345,
        u: undefined,
      });
    });

    test('from a partial record', () => {
      const x: UnknownRecord = {
        xs: [11, 22],
        rec: {
          a: 3,
        },
      };

      expect(nestedRecord.fill(x)).toStrictEqual({
        xs: [11, 22],
        rec: {
          a: 3,
          b: 0,
          c: 3,
        },
        meta: 100,
        u: undefined,
      });
    });

    test('from a partial record with excess property', () => {
      const x: UnknownRecord = {
        xs: [11, 22],
        rec: {
          a: 3,
          d: 9988,
        },
        u: undefined,
        aaaaa: [9999],
      };

      expect(nestedRecord.fill(x)).toStrictEqual({
        xs: [11, 22],
        rec: {
          a: 3,
          b: 0,
          c: 3,
        },
        meta: 100,
        u: undefined,
      });
    });
  });
});

describe('advanced type', () => {
  const Identifier = simpleBrandedString({
    typeName: 'Identifier',
    defaultValue: 'id:0000',
  });

  const EvenRange = refine({
    baseType: intRange({ start: 0, end: 11, defaultValue: 0 }),
    is: (value): value is 0 | 2 | 4 | 6 | 8 | 10 => value % 2 === 0,
    defaultValue: 0,
    typeName: 'EvenRange',
  });

  const Coordinates = tuple([
    intRange({ start: -90, end: 91, defaultValue: 0 }),
    intRange({ start: -128, end: 128, defaultValue: 0 }),
  ]);

  const paletteBase = arrayOfLength(2, EvenRange);
  const Palette = intersection(
    [nonEmptyArray(EvenRange), paletteBase],
    paletteBase,
  );

  const MetricShape = record({
    alpha: literal('alpha'),
    beta: literal('beta'),
    gamma: literal('gamma'),
  });
  const MetricKeys = keyof(MetricShape);
  type MetricKey = TypeOf<typeof MetricKeys>;
  expectType<MetricKey, 'alpha' | 'beta' | 'gamma'>('=');

  const Metrics = keyValueRecord(MetricKeys, EvenRange);
  const NullableMetrics = nullable(Metrics);

  const Tag = simpleBrandedString({
    typeName: 'Tag',
    defaultValue: 'tag:0',
  });

  const SettingKey = simpleBrandedString({
    typeName: 'SettingKey',
    defaultValue: 'setting:0',
  });

  const Status = union([
    enumType(['draft', 'published'] as const),
    nullType,
    undefinedType,
  ]);

  const SettingValue = union([
    literal('allowed'),
    literal('blocked'),
    nullType,
    undefinedType,
  ]);

  const NullableTags = nullable(nonEmptyArray(Tag));
  const NullableExtras = nullable(keyValueRecord(SettingKey, SettingValue));

  type AdvancedNode = Readonly<{
    id: TypeOf<typeof Identifier>;
    status: TypeOf<typeof Status>;
    coordinates: TypeOf<typeof Coordinates>;
    palette: TypeOf<typeof Palette>;
    metrics: TypeOf<typeof NullableMetrics>;
    tags: TypeOf<typeof NullableTags>;
    extras?: TypeOf<typeof NullableExtras>;
    children?: readonly AdvancedNode[] | undefined;
  }>;

  const AdvancedNodeType: Type<AdvancedNode> = recursion<AdvancedNode>(
    'AdvancedNode',
    () =>
      mergeRecords([
        record({
          id: Identifier,
          status: Status,
          coordinates: Coordinates,
          palette: Palette,
          metrics: NullableMetrics,
          tags: NullableTags,
        }),
        partial(
          record({
            extras: NullableExtras,
            children: nullable(array(AdvancedNodeType)),
          }),
        ),
      ]),
  );

  test('is accepts rich node', () => {
    const valid: UnknownRecord = {
      id: 'id:1234',
      status: 'draft',
      coordinates: [0, 0],
      palette: [0, 2],
      metrics: { alpha: 0, beta: 2 },
      tags: ['tag:1'],
      extras: { 'setting:1': 'allowed' },
      children: [
        {
          id: 'id:5678',
          status: null,
          coordinates: [1, -10],
          palette: [4, 6],
          metrics: undefined,
          tags: undefined,
        },
      ],
    };

    expect(AdvancedNodeType.is(valid)).toBe(true);

    if (AdvancedNodeType.is(valid)) {
      expectType<typeof valid, AdvancedNode>('=');
    }
  });

  test('validate surfaces nested errors', () => {
    const invalid: UnknownRecord = {
      id: 'id:bad',
      status: 'unknown',
      coordinates: [0, 190],
      palette: [1, 3, 5],
      metrics: { alpha: 1 },
      tags: [],
      extras: { 'setting:1': 'invalid' },
      children: [{}],
    };

    const result = AdvancedNodeType.validate(invalid);
    expect(Result.isErr(result)).toBe(true);

    if (!Result.isErr(result)) {
      throw new Error('Expected validation to fail');
    }

    const messages = validationErrorsToMessages(result.value);

    expect(messages).toStrictEqual([
      'The type of value is expected to match all types of { { id: "Identifier", status: (enum | null | undefined), coordinates: tuple, palette: (NonEmptyArray<EvenRange> & ArrayOfLength<2, EvenRange>), metrics: (key-value-record | undefined), tags: (NonEmptyArray<"Tag"> | undefined) }, Partial<{ extras: (key-value-record | undefined), children: (AdvancedNode[] | undefined) }> }',
      'The type of value is expected to be one of the elements contained in { enum, null, undefined } at status',
      'The value is expected to be an integer between -128 and 127 at coordinates.1',
      'The type of value is expected to match all types of { NonEmptyArray<EvenRange>, ArrayOfLength<2, EvenRange> } at palette',
      'Expected <EvenRange> at palette.0, got <number> type value `1`.',
      'Expected <EvenRange> at palette.1, got <number> type value `3`.',
      'Expected <EvenRange> at palette.2, got <number> type value `5`.',
      'The type of value is expected to match all types of { NonEmptyArray<EvenRange>, ArrayOfLength<2, EvenRange> } at palette',
      'Expected array of length 2, got length 3 at palette',
      'The type of value is expected to be one of the elements contained in { key-value-record, undefined } at metrics',
      'The type of value is expected to be one of the elements contained in { NonEmptyArray<"Tag">, undefined } at tags',
      'The type of value is expected to match all types of { { id: "Identifier", status: (enum | null | undefined), coordinates: tuple, palette: (NonEmptyArray<EvenRange> & ArrayOfLength<2, EvenRange>), metrics: (key-value-record | undefined), tags: (NonEmptyArray<"Tag"> | undefined) }, Partial<{ extras: (key-value-record | undefined), children: (AdvancedNode[] | undefined) }> }',
      'The type of value is expected to be one of the elements contained in { key-value-record, undefined } at extras',
      'The type of value is expected to be one of the elements contained in { AdvancedNode[], undefined } at children',
    ]);
  });

  test('fill hydrates defaults', () => {
    const partialNode: UnknownRecord = {
      id: 'id:partial',
      status: undefined,
    };

    expect(AdvancedNodeType.fill(partialNode)).toStrictEqual({
      id: 'id:partial',
      status: undefined,
      coordinates: [0, 0],
      palette: [0, 0],
      metrics: {},
      tags: ['tag:0'],
      extras: {},
      children: [],
    });
  });
});
