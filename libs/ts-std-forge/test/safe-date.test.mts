import { Result } from 'ts-data-forge';
import { SafeDate } from '../src/index.mjs';

describe('SafeDate.toISOString', () => {
  test('returns Ok for a valid date', () => {
    const result = SafeDate.toISOString(new Date(0));

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, '1970-01-01T00:00:00.000Z');
  });

  test('returns Err for an invalid date', () => {
    const result = SafeDate.toISOString(new Date(Number.NaN));

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value.name, 'RangeError');
  });
});
