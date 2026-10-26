import {
  annotate,
  at,
  intersection,
  literal,
  mergeRecords,
  nullType,
  number,
  omit,
  optional,
  partial,
  pick,
  record,
  recursion,
  required,
  string,
  union,
  type Type,
} from '../src/index.mjs';

describe('Record composition should preserve the record view', () => {
  const baseRecord = record({
    a: number(),
    b: string(),
    c: number(),
  });

  test('omit result should have the record view', () => {
    const omittedRecord = omit(baseRecord, ['c']);

    // This should not throw
    const merged = mergeRecords([baseRecord, omittedRecord]);

    assert.isTrue(merged.is({ a: 1, b: 'hello', c: 2 }));
  });

  test('pick result should have the record view', () => {
    const pickedRecord = pick(baseRecord, ['a', 'b']);

    // This should not throw
    const merged = mergeRecords([baseRecord, pickedRecord]);

    assert.isTrue(merged.is({ a: 1, b: 'hello', c: 2 }));
  });

  test('partial result should have the record view', () => {
    const partialRecord = partial(baseRecord);

    // This should not throw
    const merged = mergeRecords([baseRecord, partialRecord]);

    assert.isTrue(merged.is({ a: 1, b: 'hello', c: 2 }));
  });

  test('required result should have the record view', () => {
    const partialRecord = partial(baseRecord);

    const requiredRecord = required(partialRecord);

    // This should not throw
    const merged = mergeRecords([baseRecord, requiredRecord]);

    assert.isTrue(merged.is({ a: 1, b: 'hello', c: 2 }));
  });

  test('union of records should have the record view', () => {
    const record1 = record({ x: number() });

    const record2 = record({ y: string() });

    const unionRecord = union([record1, record2]);

    // This should not throw
    const merged = mergeRecords([unionRecord, record1]);

    assert.isTrue(merged.is({ x: 1, y: 'hello' }));
  });

  test('intersection of records should have the record view', () => {
    const record1 = record({ a: number() });

    const record2 = record({ b: string() });

    const intersectionRecord = intersection(
      [record1, record2],
      record({ a: number(), b: string() }),
    );

    // This should not throw
    const merged = mergeRecords([intersectionRecord, record1]);

    assert.isTrue(merged.is({ a: 1, b: 'hello' }));
  });

  test('recursion with record should have the record view', () => {
    type LinkedList = Readonly<{
      value: number;
      next: LinkedList | null;
    }>;

    const LinkedListNumber: Type<LinkedList> = recursion<LinkedList>(
      'LinkedList',
      () =>
        record({
          value: number(),
          next: union([nullType, LinkedListNumber]),
        }),
    );

    // This should not throw
    const merged = mergeRecords([LinkedListNumber, record({ id: string() })]);

    assert.isTrue(
      merged.is({
        value: 1,
        next: null,
        id: 'test',
      }),
    );

    assert.isTrue(
      merged.is({
        value: 1,
        next: { value: 2, next: null },
        id: 'test',
      }),
    );
  });

  describe('read off the structure', () => {
    test('a record wrapped in optional or annotate is still a record', () => {
      for (const wrapped of [
        optional(baseRecord),
        annotate(baseRecord, { description: 'A record.' }),
      ]) {
        const picked = pick(wrapped, ['a']);

        assert.isTrue(picked.is({ a: 1 }));

        assert.isFalse(picked.is({ b: 'x' }));

        assert.isTrue(at(wrapped, 'b').is('x'));
      }
    });

    test('a union whose member refers back to it is built without running the member', () => {
      type U = Readonly<{ kind: 'leaf' } | { kind: 'node'; child?: U }>;

      const U: Type<U> = union([
        record({ kind: literal('leaf') }),
        recursion('Node', () =>
          record({
            kind: literal('node'),
            child: optional(U, { forceUndefinedDefault: true }),
          }),
        ),
      ]);

      assert.isTrue(U.is({ kind: 'node', child: { kind: 'leaf' } }));

      assert.isTrue(at(U, 'kind').is('node'));
    });

    test('an intersection whose member refers back to it is built without running the member', () => {
      type I = Readonly<{ id: string } & { next?: I }>;

      const I: Type<I> = intersection(
        [
          record({ id: string() }),
          recursion('Next', () =>
            record({ next: optional(I, { forceUndefinedDefault: true }) }),
          ),
        ],
        record({ id: string() }),
      );

      assert.isTrue(I.is({ id: 'a', next: { id: 'b' } }));

      assert.deepStrictEqual(I.prune({ id: 'a', next: { id: 'b' } }), {
        id: 'a',
        next: { id: 'b' },
      });
    });

    test('a recursion that is a union with itself is not a record', () => {
      type R = Readonly<{ a: number }>;

      const R: Type<R> = recursion('R', () =>
        union([record({ a: number() }), R]),
      );

      assert.isTrue(R.is({ a: 1 }));

      expect(() => pick(R, ['a'])).toThrow('Expected a record type');
    });
  });

  describe('negative cases for compositions', () => {
    test('union of records rejects values not matching any variant', () => {
      const record1 = record({ x: number() });

      const record2 = record({ y: string() });

      const unionRecord = union([record1, record2]);

      // Missing both x and y
      assert.isFalse(unionRecord.is({ z: 123 }));

      // Wrong type for x
      assert.isFalse(unionRecord.is({ x: 'not a number' }));

      // Wrong type for y
      assert.isFalse(unionRecord.is({ y: 456 }));
    });

    test('intersection of records rejects partial matches', () => {
      const record1 = record({ a: number() });

      const record2 = record({ b: string() });

      const intersectionRecord = intersection(
        [record1, record2],
        record({ a: number(), b: string() }),
      );

      // Only has 'a', missing 'b'
      assert.isFalse(intersectionRecord.is({ a: 1 }));

      // Only has 'b', missing 'a'
      assert.isFalse(intersectionRecord.is({ b: 'hello' }));

      // Wrong type for 'a'
      assert.isFalse(intersectionRecord.is({ a: 'wrong', b: 'hello' }));

      // Wrong type for 'b'
      assert.isFalse(intersectionRecord.is({ a: 1, b: 999 }));
    });

    test('recursion rejects invalid nested structures', () => {
      type LinkedList = Readonly<{
        value: number;
        next: LinkedList | null;
      }>;

      const LinkedListNumber: Type<LinkedList> = recursion<LinkedList>(
        'LinkedList',
        () =>
          record({
            value: number(),
            next: union([nullType, LinkedListNumber]),
          }),
      );

      // Missing 'value'
      assert.isFalse(LinkedListNumber.is({ next: null }));

      // Wrong type for 'value'
      assert.isFalse(
        LinkedListNumber.is({ value: 'not a number', next: null }),
      );

      // Wrong type for 'next'
      assert.isFalse(LinkedListNumber.is({ value: 1, next: 'invalid' }));

      // Invalid nested value
      assert.isFalse(
        LinkedListNumber.is({
          value: 1,
          next: { value: 'invalid', next: null },
        }),
      );
    });
  });
});
