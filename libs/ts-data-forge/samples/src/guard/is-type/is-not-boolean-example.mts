// Example: src/guard/is-type.mts (isNotBoolean)
import { isNotBoolean } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const flags: readonly unknown[] = [true, 'no', false] as const;

    const nonBooleans = flags.filter(isNotBoolean);

    assert.deepStrictEqual(nonBooleans, ['no']);

    // embed-sample-code-ignore-below
  });
}
