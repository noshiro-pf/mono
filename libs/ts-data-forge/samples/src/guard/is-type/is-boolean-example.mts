// Example: src/guard/is-type.mts (isBoolean)
import { isBoolean } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const flags: readonly unknown[] = [true, 'no', false];

    const booleans = flags.filter(isBoolean);

    assert.deepStrictEqual(booleans, [true, false]);

    // embed-sample-code-ignore-below
  });
}
