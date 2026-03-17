import {
  intersection,
  mergeRecords,
  nullType,
  number,
  omit,
  partial,
  pick,
  record,
  recursion,
  required,
  string,
  union,
  type Type,
} from '../src/index.mjs';

describe('Record composition should preserve RecordTypeInternals', () => {
  const baseRecord = record({
    a: number(),
    b: string(),
    c: number(),
  });

  test('omit result should have RecordTypeInternals', () => {
    const omittedRecord = omit(baseRecord, ['c']);

    // This should not throw
    const merged = mergeRecords([baseRecord, omittedRecord]);

    assert.isTrue(merged.is({ a: 1, b: 'hello', c: 2 }));
  });

  test('pick result should have RecordTypeInternals', () => {
    const pickedRecord = pick(baseRecord, ['a', 'b']);

    // This should not throw
    const merged = mergeRecords([baseRecord, pickedRecord]);

    assert.isTrue(merged.is({ a: 1, b: 'hello', c: 2 }));
  });

  test('partial result should have RecordTypeInternals', () => {
    const partialRecord = partial(baseRecord);

    // This should not throw
    const merged = mergeRecords([baseRecord, partialRecord]);

    assert.isTrue(merged.is({ a: 1, b: 'hello', c: 2 }));
  });

  test('required result should have RecordTypeInternals', () => {
    const partialRecord = partial(baseRecord);

    const requiredRecord = required(partialRecord);

    // This should not throw
    const merged = mergeRecords([baseRecord, requiredRecord]);

    assert.isTrue(merged.is({ a: 1, b: 'hello', c: 2 }));
  });

  test('union of records should have RecordTypeInternals', () => {
    const record1 = record({ x: number() });

    const record2 = record({ y: string() });

    const unionRecord = union([record1, record2]);

    // This should not throw
    const merged = mergeRecords([unionRecord, record1]);

    assert.isTrue(merged.is({ x: 1, y: 'hello' }));
  });

  test('intersection of records should have RecordTypeInternals', () => {
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

  test('recursion with record should have RecordTypeInternals', () => {
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
});
