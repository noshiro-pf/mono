// Example: src/functional/optional.mts (Optional.flatMap)
import { Num, Optional, Result } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const parseNumber = (input: string): Optional<number> => {
      const num = Num.safeParseInt(input);

      return Result.isErr(num) ? Optional.none : Optional.some(num.value);
    };

    const parsed = Optional.flatMap(Optional.some('10'), parseNumber);

    assert.deepStrictEqual(parsed, Optional.some(10));

    const flatMapParse = Optional.flatMap(parseNumber);

    assert.deepStrictEqual(flatMapParse(Optional.some('5')), Optional.some(5));

    assert.deepStrictEqual(
      flatMapParse(Optional.some('invalid')),
      Optional.none,
    );

    // embed-sample-code-ignore-below
  });
}
