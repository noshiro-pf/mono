// Example: src/functional/ternary-result/impl/ternary-result-is-err.mts
import { TernaryResult } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const maybeErr = TernaryResult.err('boom') as TernaryResult<
      number,
      string,
      string
    >;

    if (TernaryResult.isErr(maybeErr)) {
      assert.strictEqual(maybeErr.value, 'boom');
    }

    // embed-sample-code-ignore-below
  });
}
