import * as t from 'io-ts';
import { expectType, Result } from 'ts-data-forge';
import * as f from '../src/index.mjs';

test('JsonValueIoTs', () => {
  const JsonPrimitiveIoTs = t.union([t.boolean, t.number, t.string, t.null]);

  type JsonPrimitiveIoTs = t.TypeOf<typeof JsonPrimitiveIoTs>;

  expectType<JsonPrimitiveIoTs, boolean | number | string | null>('=');

  type JsonValueIoTs =
    | JsonPrimitiveIoTs
    | Readonly<{
        [k: string]: JsonValueIoTs;
      }>
    | readonly JsonValueIoTs[];

  const JsonValueIoTs: t.Type<JsonValueIoTs> = t.recursion(
    'JsonValueIoTs',
    () =>
      t.union([
        JsonPrimitiveIoTs,
        t.readonly(t.record(t.string, JsonValueIoTs)),
        t.readonlyArray(JsonValueIoTs),
      ]),
  );

  assert.isTrue(JsonValueIoTs.is({ a: 1, b: [1, 2, 3] }));
});

describe('inconsistent keyof type', () => {
  test('io-ts', () => {
    const T = t.keyof({
      0: undefined,
      1: undefined,
      2: undefined,
      3: undefined,
      4: undefined,
    });

    // ❌ Runtime behavior is inconsistent with TypeScript types!

    assert.isFalse(T.is(0)); // false (fails) - number 0 is rejected

    assert.isTrue(T.is('0')); // true (succeeds) - string "0" is accepted

    type T = t.TypeOf<typeof T>;

    expectType<T, 0 | 1 | 2 | 3 | 4>('=');

    expectType<T, '0' | '1' | '2' | '3' | '4'>('!=');
  });

  test('ts-fortress', () => {
    const T = f.keyof(
      f.record({
        0: f.undefinedType,
        1: f.undefinedType,
        2: f.undefinedType,
        3: f.undefinedType,
        4: f.undefinedType,
      }),
    );

    // ✅ ts-fortress correctly handles numeric keys as strings

    assert.isFalse(T.is(0)); // false - number 0 is rejected

    assert.isTrue(T.is('0')); // true - string "0" is accepted

    type T = (typeof T)['defaultValue'];

    // TypeScript types are consistent with runtime behavior

    expectType<T, '0' | '1' | '2' | '3' | '4'>('=');

    expectType<T, 0 | 1 | 2 | 3 | 4>('!=');
  });
});

describe('union + undefined decode issues', () => {
  describe('io-ts', () => {
    const A = t.type({
      A: t.union([t.number, t.undefined, t.null]),
    });

    const B = t.type({
      B: t.union([t.number, t.undefined, t.null]),
    });

    const C = t.partial({
      C: t.union([t.number, t.null]),
    });

    const UnionAB = t.union([A, B]);

    const UnionBA = t.union([B, A]);

    const UnionAC = t.union([A, C]);

    const UnionCA = t.union([C, A]);

    const target = { A: 1 };

    test('UnionAB', () => {
      const res = UnionAB.decode(target);

      expect(res._tag).toBe('Right');

      if (res._tag !== 'Right') {
        throw new Error('Expected Right result');
      }

      const right = res.right;

      assert.deepStrictEqual(right, { A: 1 }); // ✅ correct

      assert.isTrue(A.is(right)); // ✅ correct

      assert.isFalse(B.is(right)); // ✅ correct
    });

    test('UnionBA', () => {
      const res = UnionBA.decode(target);

      expect(res._tag).toBe('Right');

      if (res._tag !== 'Right') {
        throw new Error('Expected Right result');
      }

      const right = res.right;

      assert.deepStrictEqual(right, { A: 1, B: undefined }); // ❌ incorrect (expected to be { A: 1 })

      assert.isTrue(A.is(right)); // ✅ correct

      assert.isTrue(B.is(right)); // ❌ incorrect (expected to be false)
    });

    test('UnionAC', () => {
      const res = UnionAC.decode(target);

      expect(res._tag).toBe('Right');

      if (res._tag !== 'Right') {
        throw new Error('Expected Right result');
      }

      const right = res.right;

      assert.deepStrictEqual(right, { A: 1 }); // ✅ correct

      assert.isTrue(A.is(right)); // ✅ correct

      assert.isTrue(C.is(right)); // ✅ correct (partial type accepts it)
    });

    test('UnionCA', () => {
      const res = UnionCA.decode(target);

      expect(res._tag).toBe('Right');

      if (res._tag !== 'Right') {
        throw new Error('Expected Right result');
      }

      const right = res.right;

      assert.deepStrictEqual(right, { A: 1 }); // ✅ correct (not {})

      assert.isTrue(A.is(right)); // ✅ correct

      assert.isTrue(C.is(right)); // ✅ correct
    });
  });

  describe('ts-fortress', () => {
    const A = f.record({
      A: f.union([f.number(), f.undefinedType, f.nullType]),
    });

    const B = f.record({
      B: f.union([f.number(), f.undefinedType, f.nullType]),
    });

    const C = f.partial(
      f.record({
        C: f.union([f.number(), f.nullType]),
      }),
    );

    const UnionAB = f.union([A, B]);

    const UnionBA = f.union([B, A]);

    const UnionAC = f.union([A, C]);

    const UnionCA = f.union([C, A]);

    const target = { A: 1 };

    test('UnionAB', () => {
      const res = UnionAB.validate(target);

      assert.isTrue(Result.isOk(res)); // should succeed

      const resValue = Result.unwrapThrow(res);

      assert.deepStrictEqual(resValue, { A: 1 }); // ✅ correct

      assert.isTrue(A.is(resValue)); // ✅ correct

      assert.isFalse(B.is(resValue)); // ✅ correct
    });

    test('UnionBA', () => {
      const res = UnionBA.validate(target);

      assert.isTrue(Result.isOk(res)); // should succeed

      const resValue1 = Result.unwrapThrow(res);

      assert.deepStrictEqual(resValue1, { A: 1 }); // ✅ correct (not { A: 1, B: undefined })

      assert.isTrue(A.is(resValue1)); // ✅ correct

      assert.isFalse(B.is(resValue1)); // ✅ correct (not true)
    });

    test('UnionAC', () => {
      const res = UnionAC.validate(target);

      assert.isTrue(Result.isOk(res)); // should succeed

      const resValue2 = Result.unwrapThrow(res);

      assert.deepStrictEqual(resValue2, { A: 1 }); // ✅ correct

      assert.isTrue(A.is(resValue2)); // ✅ correct

      assert.isTrue(C.is(resValue2)); // ✅ correct (partial type accepts it)
    });

    test('UnionCA', () => {
      const res = UnionCA.validate(target);

      assert.isTrue(Result.isOk(res)); // should succeed

      const resValue3 = Result.unwrapThrow(res);

      assert.deepStrictEqual(resValue3, { A: 1 }); // ✅ correct (not {})

      assert.isTrue(A.is(resValue3)); // ✅ correct

      assert.isTrue(C.is(resValue3)); // ✅ correct
    });
  });
});
