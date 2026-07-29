import * as t from '../src/index.mjs';

describe('partial record with nullable key', () => {
  const ymd = t.record({
    year: t.number(1900),
    month: t.nullable(t.number(1)),
    date: t.optional(t.nullable(t.number(1))),
  });

  describe('prune', () => {
    test('removes excess properties and keeps present optional keys', () => {
      assert.deepStrictEqual(ymd.prune({ year: 2000, month: 6, aaaaa: 9999 }), {
        year: 2000,
        month: 6,
      });
    });

    test('does not fill in missing optional keys', () => {
      assert.deepStrictEqual(ymd.prune({ year: 2000, month: undefined }), {
        year: 2000,
        month: undefined,
      });
    });

    test('does not change nullable keys with undefined', () => {
      assert.deepStrictEqual(
        ymd.prune({ year: 2000, month: undefined, date: undefined }),
        {
          year: 2000,
          month: undefined,
          date: undefined,
        },
      );
    });
  });
});
