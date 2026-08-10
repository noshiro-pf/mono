// Example: src/functional/optional.mts (Optional.map)
import { Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const numberOptional = Optional.some(21);

    const mapped = Optional.map(numberOptional, (value) => value * 2);

    assert.deepStrictEqual(mapped, Optional.some(42));

    const mapToLength = Optional.map((text: string) => text.length);

    assert.deepStrictEqual(mapToLength(Optional.some('abc')), Optional.some(3));

    assert.deepStrictEqual(mapToLength(Optional.none), Optional.none);

    // embed-sample-code-ignore-below
  });
}
