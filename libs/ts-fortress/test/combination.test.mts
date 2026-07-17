import { asInt, expectType, Result } from 'ts-data-forge';
import { type Int, type UnknownRecord } from 'ts-type-forge';
import {
  array,
  brandedString,
  enumType,
  fixedLengthTuple,
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
    xs: array(int(2)),
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
      } as const;

      if (nestedRecord.is(x)) {
        expectType<typeof x, NestedRecord>('=');
      } else {
        expectType<typeof x, UnknownRecord>('=');
      }

      assert.isTrue(nestedRecord.is(x));
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
      } as const;

      if (nestedRecord.is(x)) {
        expectType<typeof x, NestedRecord>('=');
      } else {
        expectType<typeof x, UnknownRecord>('=');
      }

      assert.isFalse(nestedRecord.is(x));
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
      } as const;

      const result = nestedRecord.validate(x);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: ['xs', '1'],
          actualValue: 2.2,
          expectedType: 'Int',
          typeName: 'Int',
          details: undefined,
        },
        {
          path: ['xs', '2'],
          actualValue: 3.3,
          expectedType: 'Int',
          typeName: 'Int',
          details: undefined,
        },
        {
          path: ['rec', 'a'],
          actualValue: 123,
          expectedType: 'uintRange(0, 11)',
          typeName: 'uintRange(0, 11)',
          details: {
            kind: 'integer-range',
            start: 0,
            endExclusive: 11,
          },
        },
        {
          path: ['rec', 'b'],
          actualValue: 234,
          expectedType: 'uintRange(0, 11)',
          typeName: 'uintRange(0, 11)',
          details: {
            kind: 'integer-range',
            start: 0,
            endExclusive: 11,
          },
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error at xs.1: expected <Int> type but <number> type value `2.2` was passed.',
        'Error at xs.2: expected <Int> type but <number> type value `3.3` was passed.',
        'Error at rec.a: expected an integer between 0 and 10 but `123` was passed.',
        'Error at rec.b: expected an integer between 0 and 10 but `234` was passed.',
      ]);
    });
  });

  describe('fill', () => {
    test('from an empty record', () => {
      const x: UnknownRecord = {} as const;

      assert.deepStrictEqual(nestedRecord.fill(x), {
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
      } as const;

      assert.deepStrictEqual(nestedRecord.fill(x), {
        xs: [asInt(-1), asInt(2), asInt(2)],
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
      } as const;

      assert.deepStrictEqual(nestedRecord.fill(x), {
        xs: [asInt(11), asInt(22)],
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
      } as const;

      assert.deepStrictEqual(nestedRecord.fill(x), {
        xs: [asInt(11), asInt(22)],
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
  const Identifier = brandedString({
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

  const paletteBase = fixedLengthTuple(2, EvenRange);

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

  const Tag = brandedString({
    typeName: 'Tag',
    defaultValue: 'tag:0',
  });

  const SettingKey = brandedString({
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
    } as const;

    assert.isTrue(AdvancedNodeType.is(valid));

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
    } as const;

    const result = AdvancedNodeType.validate(invalid);

    assert.isTrue(Result.isErr(result));

    if (!Result.isErr(result)) {
      throw new Error('Expected validation to fail');
    }

    const messages = validationErrorsToMessages(result.value);

    assert.deepStrictEqual(messages, [
      'Error at status: expected one of <enum>, <null>, <undefined> but <string> type value "unknown" was passed.',
      'Error at coordinates.1: expected an integer between -128 and 127 but `190` was passed.',
      'Error at palette: expected value to match all types of <NonEmptyArray<EvenRange>>, <FixedLengthTuple<2, EvenRange>> but <object> type value `[1,3,5]` was passed.',
      'Error at palette.0: expected <EvenRange> type but <number> type value `1` was passed.',
      'Error at palette.1: expected <EvenRange> type but <number> type value `3` was passed.',
      'Error at palette.2: expected <EvenRange> type but <number> type value `5` was passed.',
      'Error at palette: expected value to match all types of <NonEmptyArray<EvenRange>>, <FixedLengthTuple<2, EvenRange>> but <object> type value `[1,3,5]` was passed.',
      'Error at palette: expected array of length 2 but length 3 was passed.',
      'Error at metrics: expected one of <key-value-record>, <undefined> but <object> type value `{"alpha":1}` was passed.',
      'Error at tags: expected one of <NonEmptyArray<Tag>>, <undefined> but <object> type value `[]` was passed.',
      'Error at extras: expected one of <key-value-record>, <undefined> but <object> type value was passed.',
      'Error at children: expected one of <AdvancedNode[]>, <undefined> but <object> type value `[{}]` was passed.',
    ]);
  });

  test('fill hydrates defaults', () => {
    const partialNode: UnknownRecord = {
      id: 'id:partial',
      status: undefined,
    } as const;

    assert.deepStrictEqual(AdvancedNodeType.fill(partialNode), {
      id: Identifier.cast('id:partial'),
      status: undefined,
      coordinates: [0, 0],
      palette: [0, 0],
      metrics: Metrics.cast({}),
      tags: [Tag.cast('tag:0')],
      extras: {},
      children: [],
    });
  });

  describe('additional negative cases for complex types', () => {
    test('rejects completely wrong structure', () => {
      assert.isFalse(AdvancedNodeType.is(null));

      assert.isFalse(AdvancedNodeType.is(undefined));

      assert.isFalse(AdvancedNodeType.is(123));

      assert.isFalse(AdvancedNodeType.is('string'));

      assert.isFalse(AdvancedNodeType.is([]));
    });

    test('rejects partial valid structure', () => {
      // Only id field
      assert.isFalse(AdvancedNodeType.is({ id: 'id:test' }));

      // Missing critical fields
      assert.isFalse(
        AdvancedNodeType.is({
          id: 'id:test',
          status: 'draft',
        }),
      );
    });

    test('rejects invalid nested types in recursion', () => {
      const invalidChild: UnknownRecord = {
        id: 'id:parent',
        status: 'draft',
        coordinates: [0, 0],
        palette: [0, 2],
        metrics: null,
        tags: ['tag:1'],
        children: [
          {
            // Invalid child: missing required fields
            id: 'id:child',
          },
        ],
      } as const;

      assert.isFalse(AdvancedNodeType.is(invalidChild));
    });

    test('rejects invalid union variants', () => {
      const invalidStatus: UnknownRecord = {
        id: 'id:test',
        status: 'invalid-status', // not in enum/null/undefined
        coordinates: [0, 0],
        palette: [0, 2],
        metrics: null,
        tags: ['tag:1'],
      } as const;

      assert.isFalse(AdvancedNodeType.is(invalidStatus));
    });
  });
});
