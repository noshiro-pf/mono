// Example: src/safe-string/from-primitive.mts (SafeString.fromPrimitive)
import { SafeString } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    assert.strictEqual(SafeString.fromPrimitive(Symbol('tag')), 'Symbol(tag)');

    assert.strictEqual(SafeString.fromPrimitive(10n), '10');

    // embed-sample-code-ignore-below
  });
}
