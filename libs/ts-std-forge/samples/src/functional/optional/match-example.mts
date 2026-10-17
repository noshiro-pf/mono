// Example: src/functional/optional.mts (Optional.match)
import { Optional } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const doubledOrZero = Optional.match(Optional.some(21), {
      some: (value) => value * 2,
      none: () => 0,
    });

    assert.strictEqual(doubledOrZero, 42);

    const matcher = Optional.match({
      some: (value: number) => `value: ${value}`,
      none: () => 'none',
    });

    assert.strictEqual(matcher(Optional.some(3)), 'value: 3');

    assert.strictEqual(matcher(Optional.none), 'none');

    // embed-sample-code-ignore-below
  });
}
