// Example: src/functional/result.mts (Result.isResult)
import { Result } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const okValue = Result.ok('success');

    const errValue = Result.err(new Error('failure'));

    const notResult = { $$tag: 'ts-data-forge::Result.ok' } as const;

    assert.isTrue(Result.isResult(okValue));

    assert.isTrue(Result.isResult(errValue));

    assert.isFalse(Result.isResult(notResult));

    // embed-sample-code-ignore-below
  });
}
