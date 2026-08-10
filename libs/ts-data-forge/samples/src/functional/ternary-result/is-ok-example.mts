// Example: src/functional/ternary-result/impl/ternary-result-is-ok.mts
import { TernaryResult } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const maybeNumber = TernaryResult.ok(42) as TernaryResult<
      number,
      string,
      string
    >;

    if (TernaryResult.isOk(maybeNumber)) {
      const value: number = maybeNumber.value;

      assert.strictEqual(value, 42);
    }

    // embed-sample-code-ignore-below
  });
}
