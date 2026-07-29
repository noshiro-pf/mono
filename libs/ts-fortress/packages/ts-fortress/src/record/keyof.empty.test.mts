import { Result } from 'ts-data-forge';
import { keyof } from './keyof.mjs';
import { record } from './record.mjs';

describe('keyof (empty record)', () => {
  const T = keyof(record({}));

  test('is/validate/fill for undefined', () => {
    assert.isTrue(T.is(undefined));

    assert.isTrue(Result.isOk(T.validate(undefined)));

    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(T.fill('anything')).toBeUndefined();
  });
});
