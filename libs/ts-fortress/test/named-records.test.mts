import { asInt, expectType, Result } from 'ts-data-forge';
import {
  array,
  int,
  optional,
  record,
  validationErrorsToMessages,
  type TypeOf,
} from '../src/index.mjs';

describe('nested record', () => {
  const Point = record({
    x: int(),
    y: int(),
    z: optional(int()),
  });

  const Points = array(Point);

  const Edge = record({
    from: Point,
    to: Point,
  });

  const Edges = array(Edge);

  const Polygon = record({
    vertices: Points,
    edges: Edges,
  });

  type Point = TypeOf<typeof Point>;

  type Edge = TypeOf<typeof Edge>;

  type Polygon = TypeOf<typeof Polygon>;

  expectType<
    Polygon,
    Readonly<{
      vertices: readonly Readonly<{ x: Int; y: Int; z?: Int }>[];
      edges: readonly Readonly<{
        from: Readonly<{ x: Int; y: Int; z?: Int }>;
        to: Readonly<{ x: Int; y: Int; z?: Int }>;
      }>[];
    }>
  >('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: UnknownRecord = {
        vertices: [
          { x: 1, y: 2 },
          { x: 3, y: 4, z: 5 },
        ],
        edges: [
          {
            from: { x: 1, y: 2 },
            to: { x: 3, y: 4 },
          },
        ],
      };

      if (Polygon.is(x)) {
        expectType<typeof x, Polygon>('=');
      } else {
        expectType<typeof x, UnknownRecord>('=');
      }

      assert.isTrue(Polygon.is(x));
    });

    test('falsy case', () => {
      const x: UnknownRecord = {
        vertices: [
          { x: 1, y: 2.2 }, // y is not an integer
          { x: 3, y: 4 },
        ],
        edges: [
          {
            from: { x: 1, y: 2 },
            to: { x: 3.3, y: 4 }, // x is not an integer
          },
        ],
      };

      if (Polygon.is(x)) {
        expectType<typeof x, Polygon>('=');
      } else {
        expectType<typeof x, UnknownRecord>('=');
      }

      assert.isFalse(Polygon.is(x));
    });
  });

  describe('validate', () => {
    test('falsy case', () => {
      const x: UnknownRecord = {
        vertices: [
          { x: 1, y: 2.2 }, // y is not an integer
          { x: 3, y: 4.4 }, // y is not an integer
        ],
        edges: [
          {
            from: { x: 1, y: 2 },
            to: { x: 3.3, y: 4 }, // x is not an integer
          },
          {
            from: { x: 5, y: 6.6 }, // y is not an integer
            to: { x: 7, y: 8 },
          },
        ],
      };

      const result = Polygon.validate(x);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: ['vertices', '0', 'y'],
          actualValue: 2.2,
          expectedType: 'Int',
          typeName: 'Int',
          details: undefined,
        },
        {
          path: ['vertices', '1', 'y'],
          actualValue: 4.4,
          expectedType: 'Int',
          typeName: 'Int',
          details: undefined,
        },
        {
          path: ['edges', '0', 'to', 'x'],
          actualValue: 3.3,
          expectedType: 'Int',
          typeName: 'Int',
          details: undefined,
        },
        {
          path: ['edges', '1', 'from', 'y'],
          actualValue: 6.6,
          expectedType: 'Int',
          typeName: 'Int',
          details: undefined,
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error at vertices.0.y: expected <Int> type but <number> type value `2.2` was passed.',
        'Error at vertices.1.y: expected <Int> type but <number> type value `4.4` was passed.',
        'Error at edges.0.to.x: expected <Int> type but <number> type value `3.3` was passed.',
        'Error at edges.1.from.y: expected <Int> type but <number> type value `6.6` was passed.',
      ]);
    });

    test('falsy case 2', () => {
      const x: UnknownRecord = {
        wrongVertices: [
          { x: 1, y: 2 },
          { x: 3, y: 4, z: 5 },
        ],
        wrongEdges: [
          {
            from: { x: 1, y: 2 },
            to: { x: 3, y: 4 },
          },
        ],
      };

      const result = Polygon.validate(x);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: ['vertices'],
          actualValue: x,
          expectedType:
            '{ vertices: { x: Int, y: Int, z: Int }[], edges: { from: { x: Int, y: Int, z: Int }, to: { x: Int, y: Int, z: Int } }[] }',
          typeName:
            '{ vertices: { x: Int, y: Int, z: Int }[], edges: { from: { x: Int, y: Int, z: Int }, to: { x: Int, y: Int, z: Int } }[] }',
          details: {
            kind: 'missing-key',
            key: 'vertices',
          },
        },
        {
          path: ['edges'],
          actualValue: x,
          expectedType:
            '{ vertices: { x: Int, y: Int, z: Int }[], edges: { from: { x: Int, y: Int, z: Int }, to: { x: Int, y: Int, z: Int } }[] }',
          typeName:
            '{ vertices: { x: Int, y: Int, z: Int }[], edges: { from: { x: Int, y: Int, z: Int }, to: { x: Int, y: Int, z: Int } }[] }',
          details: {
            kind: 'missing-key',
            key: 'edges',
          },
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error at vertices: missing required key "vertices".',
        'Error at edges: missing required key "edges".',
      ]);
    });
  });

  describe('fill', () => {
    test('from an empty record', () => {
      const x: UnknownRecord = {};

      assert.deepStrictEqual(Polygon.fill(x), {
        vertices: [],
        edges: [],
      });
    });

    test('from a filled record', () => {
      const x: UnknownRecord = {
        vertices: [
          { x: 1, y: 2.2 }, // y will be fixed to default (0)
          { x: 3, y: 4 },
        ],
        edges: [
          {
            from: { x: 1, y: 2 },
            to: { x: 3.3, y: 4 }, // x will be fixed to default (0)
          },
        ],
      };

      assert.deepStrictEqual(Polygon.fill(x), {
        vertices: [
          { x: asInt(1), y: asInt(0), z: asInt(0) },
          { x: asInt(3), y: asInt(4), z: asInt(0) },
        ],
        edges: [
          {
            from: { x: asInt(1), y: asInt(2), z: asInt(0) },
            to: { x: asInt(0), y: asInt(4), z: asInt(0) },
          },
        ],
      });
    });

    test('from a partial record', () => {
      const x: UnknownRecord = {
        vertices: [{ x: 11, y: 22 }],
      };

      assert.deepStrictEqual(Polygon.fill(x), {
        vertices: [{ x: asInt(11), y: asInt(22), z: asInt(0) }],
        edges: [],
      });
    });

    test('from a partial record with excess property', () => {
      const x: UnknownRecord = {
        vertices: [{ x: 11, y: 22, z: 33 }],
        edges: [],
        extraField: 'should be ignored',
      };

      assert.deepStrictEqual(Polygon.fill(x), {
        vertices: [{ x: asInt(11), y: asInt(22), z: asInt(33) }],
        edges: [],
      });
    });
  });
});
