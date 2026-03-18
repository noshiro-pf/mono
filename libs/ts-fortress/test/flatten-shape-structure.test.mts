import {
  boolean,
  flattenShapeStructure,
  number,
  string,
  type ShapeStructure,
  type UnknownShape,
} from '../src/index.mjs';

describe(flattenShapeStructure, () => {
  test('simple shape', () => {
    const simpleShape: UnknownShape = { a: number(), b: string() } as const;

    const simpleStructure: ShapeStructure = {
      kind: 'simple',
      shape: simpleShape,
    } as const;

    assert.deepStrictEqual(flattenShapeStructure(simpleStructure), simpleShape);
  });

  test('intersection of simple shapes', () => {
    const shape1: UnknownShape = { a: number() } as const;

    const shape2: UnknownShape = { b: string() } as const;

    const intersectionStructure: ShapeStructure = {
      kind: 'intersection',
      parts: [
        { kind: 'simple', shape: shape1 },
        { kind: 'simple', shape: shape2 },
      ],
    } as const;

    const flattened = flattenShapeStructure(intersectionStructure);

    assert.isDefined(flattened);

    assert.deepStrictEqual(Object.keys(flattened).toSorted(), ['a', 'b']);

    assert.strictEqual(flattened['a'], shape1['a']);

    assert.strictEqual(flattened['b'], shape2['b']);
  });

  test('nested intersection', () => {
    const shape1: UnknownShape = { a: number() } as const;

    const shape2: UnknownShape = { b: string() } as const;

    const shape3: UnknownShape = { c: boolean() } as const;

    const intersectionStructure: ShapeStructure = {
      kind: 'intersection',
      parts: [
        { kind: 'simple', shape: shape1 },
        { kind: 'simple', shape: shape2 },
      ],
    } as const;

    const nestedIntersection: ShapeStructure = {
      kind: 'intersection',
      parts: [intersectionStructure, { kind: 'simple', shape: shape3 }],
    } as const;

    const flattened = flattenShapeStructure(nestedIntersection);

    assert.isDefined(flattened);

    assert.deepStrictEqual(Object.keys(flattened).toSorted(), ['a', 'b', 'c']);
  });

  test('union structure - cannot flatten', () => {
    const shape1: UnknownShape = { a: number() } as const;

    const shape2: UnknownShape = { b: string() } as const;

    const unionStructure: ShapeStructure = {
      kind: 'union',
      variants: [
        { kind: 'simple', shape: shape1 },
        { kind: 'simple', shape: shape2 },
      ],
    } as const;

    assert.isUndefined(flattenShapeStructure(unionStructure));
  });

  test('intersection containing union - cannot flatten', () => {
    const shape1: UnknownShape = { a: number() } as const;

    const shape2: UnknownShape = { b: string() } as const;

    const unionStructure: ShapeStructure = {
      kind: 'union',
      variants: [
        { kind: 'simple', shape: shape1 },
        { kind: 'simple', shape: shape2 },
      ],
    } as const;

    const intersectionWithUnion: ShapeStructure = {
      kind: 'intersection',
      parts: [{ kind: 'simple', shape: shape1 }, unionStructure],
    } as const;

    assert.isUndefined(flattenShapeStructure(intersectionWithUnion));
  });

  describe('edge cases and validation', () => {
    test('empty intersection returns empty shape', () => {
      const emptyStructure: ShapeStructure = {
        kind: 'intersection',
        parts: [],
      } as const;

      const flattened = flattenShapeStructure(emptyStructure);

      assert.isDefined(flattened);

      assert.deepStrictEqual(Object.keys(flattened), []);
    });

    test('single element intersection returns that shape', () => {
      const shape: UnknownShape = { a: number(), b: string() } as const;

      const singleStructure: ShapeStructure = {
        kind: 'intersection',
        parts: [{ kind: 'simple', shape }],
      } as const;

      const flattened = flattenShapeStructure(singleStructure);

      assert.isDefined(flattened);

      assert.deepStrictEqual(flattened, shape);
    });

    test('deeply nested intersections are flattened', () => {
      const shape1: UnknownShape = { a: number() } as const;

      const shape2: UnknownShape = { b: string() } as const;

      const shape3: UnknownShape = { c: boolean() } as const;

      const shape4: UnknownShape = { d: number() } as const;

      const inner: ShapeStructure = {
        kind: 'intersection',
        parts: [
          { kind: 'simple', shape: shape1 },
          { kind: 'simple', shape: shape2 },
        ],
      } as const;

      const outer: ShapeStructure = {
        kind: 'intersection',
        parts: [
          inner,
          { kind: 'simple', shape: shape3 },
          { kind: 'simple', shape: shape4 },
        ],
      } as const;

      const flattened = flattenShapeStructure(outer);

      assert.isDefined(flattened);

      assert.deepStrictEqual(Object.keys(flattened).toSorted(), [
        'a',
        'b',
        'c',
        'd',
      ]);
    });

    test('union in any position prevents flattening', () => {
      const shape1: UnknownShape = { a: number() } as const;

      const unionPart: ShapeStructure = {
        kind: 'union',
        variants: [{ kind: 'simple', shape: shape1 }],
      } as const;

      // Union at start
      const startUnion: ShapeStructure = {
        kind: 'intersection',
        parts: [unionPart, { kind: 'simple', shape: { b: string() } }],
      } as const;

      assert.isUndefined(flattenShapeStructure(startUnion));

      // Union at end
      const endUnion: ShapeStructure = {
        kind: 'intersection',
        parts: [{ kind: 'simple', shape: { b: string() } }, unionPart],
      } as const;

      assert.isUndefined(flattenShapeStructure(endUnion));

      // Union in middle
      const middleUnion: ShapeStructure = {
        kind: 'intersection',
        parts: [
          { kind: 'simple', shape: { a: number() } },
          unionPart,
          { kind: 'simple', shape: { c: boolean() } },
        ],
      } as const;

      assert.isUndefined(flattenShapeStructure(middleUnion));
    });
  });
});
