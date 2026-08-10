import {
  intersection,
  number,
  omit,
  partial,
  pick,
  record,
  required,
  string,
  valueof,
} from '../src/index.mjs';

describe('Record operations on intersection types', () => {
  const Record1 = record({ a: number(), b: string() });

  const Record2 = record({ b: string(), c: number() });

  const Intersected = intersection(
    [Record1, Record2],
    record({ a: number(), b: string(), c: number() }),
  );

  test('pick on intersection', () => {
    const Picked = pick(Intersected, ['a', 'b']);

    assert.isTrue(Picked.is({ a: 1, b: 'hello' }));

    // Extra properties are allowed by default
    assert.isTrue(Picked.is({ a: 1, b: 'hello', c: 2 }));
  });

  test('omit on intersection', () => {
    const Omitted = omit(Intersected, ['c']);

    assert.isTrue(Omitted.is({ a: 1, b: 'hello' }));

    // Extra properties are allowed by default
    assert.isTrue(Omitted.is({ a: 1, b: 'hello', c: 2 }));
  });

  test('partial on intersection', () => {
    const PartialRecord = partial(Intersected);

    assert.isTrue(PartialRecord.is({}));

    assert.isTrue(PartialRecord.is({ a: 1 }));

    assert.isTrue(PartialRecord.is({ a: 1, b: 'hello', c: 2 }));
  });

  test('required on intersection', () => {
    const PartialIntersected = partial(Intersected);

    const RequiredRecord = required(PartialIntersected);

    assert.isTrue(RequiredRecord.is({ a: 1, b: 'hello', c: 2 }));

    assert.isFalse(RequiredRecord.is({ a: 1 }));
  });

  test('valueof on intersection', () => {
    const ValueOf = valueof(Intersected);

    assert.isTrue(ValueOf.is(1)); // from a: number

    assert.isTrue(ValueOf.is('hello')); // from b: string

    assert.isTrue(ValueOf.is(2)); // from c: number

    assert.isFalse(ValueOf.is(true));
  });

  describe('negative cases for operations on intersection', () => {
    test('pick rejects missing required keys', () => {
      const Picked = pick(Intersected, ['a', 'b']);

      assert.isFalse(Picked.is({ a: 1 })); // missing 'b'

      assert.isFalse(Picked.is({ b: 'hello' })); // missing 'a'

      assert.isFalse(Picked.is({})); // missing both
    });

    test('pick rejects wrong types', () => {
      const Picked = pick(Intersected, ['a', 'b']);

      assert.isFalse(Picked.is({ a: 'wrong type', b: 'hello' }));

      assert.isFalse(Picked.is({ a: 1, b: 123 }));
    });

    test('omit rejects missing required keys', () => {
      const Omitted = omit(Intersected, ['c']);

      assert.isFalse(Omitted.is({ a: 1 })); // missing 'b'

      assert.isFalse(Omitted.is({ b: 'hello' })); // missing 'a'
    });

    test('partial accepts empty but rejects wrong types', () => {
      const PartialRecord = partial(Intersected);

      // Empty is valid for partial
      assert.isTrue(PartialRecord.is({}));

      // Wrong types should be rejected
      assert.isFalse(PartialRecord.is({ a: 'not a number' }));

      assert.isFalse(PartialRecord.is({ b: 123 }));

      assert.isFalse(PartialRecord.is({ c: false }));
    });

    test('required rejects missing keys', () => {
      const PartialIntersected = partial(Intersected);

      const RequiredRecord = required(PartialIntersected);

      assert.isFalse(RequiredRecord.is({}));

      assert.isFalse(RequiredRecord.is({ a: 1 }));

      assert.isFalse(RequiredRecord.is({ a: 1, b: 'hello' }));
    });
  });
});
