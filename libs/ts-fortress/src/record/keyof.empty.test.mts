import { Result } from 'ts-data-forge';
import { keyof } from './keyof.mjs';
import { record } from './record.mjs';

describe('keyof (empty record)', () => {
  const T = keyof(record({}));

  test('is/validate/fill for undefined', () => {
    expect(T.is(undefined)).toBe(true);

    expect(Result.isOk(T.validate(undefined))).toBe(true);

    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(T.fill('anything')).toBeUndefined();
  });
});
