import { epochMsOf } from './timestamp.mjs';

describe(epochMsOf, () => {
  test('reads the UTC timestamps GitHub sends', () => {
    assert.strictEqual(epochMsOf('1970-01-01T00:00:00Z'), 0);

    assert.strictEqual(epochMsOf('2026-09-24T09:39:18Z'), 1_790_242_758_000);
  });

  test('counts leap days, including a century that is not one', () => {
    assert.strictEqual(epochMsOf('2024-02-29T00:00:00Z'), 1_709_164_800_000);

    assert.strictEqual(epochMsOf('2024-03-01T00:00:00Z'), 1_709_251_200_000);

    assert.strictEqual(epochMsOf('2000-03-01T00:00:00Z'), 951_868_800_000);

    assert.strictEqual(epochMsOf('2100-03-01T00:00:00Z'), 4_107_542_400_000);
  });

  test('keeps the milliseconds when there are any', () => {
    assert.strictEqual(epochMsOf('1970-01-01T00:00:01.250Z'), 1250);
  });

  test('is undefined for anything else', () => {
    assert.isUndefined(epochMsOf(''));

    assert.isUndefined(epochMsOf('2026-09-24T09:39:18+09:00'));

    assert.isUndefined(epochMsOf('2026-09-24'));
  });
});
