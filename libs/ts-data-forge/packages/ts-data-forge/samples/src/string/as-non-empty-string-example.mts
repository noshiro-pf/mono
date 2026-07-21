// Example: src/string/str.mts (Str.asNonEmptyString)
import { Str } from 'ts-data-forge';
import { type NonEmptyString } from 'ts-type-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const name = Str.asNonEmptyString('noshiro');

    const nonEmpty: NonEmptyString = name; // OK

    assert.isTrue(nonEmpty.length >= 1);

    assert.throws(() => Str.asNonEmptyString('')); // length 0 < 1

    // embed-sample-code-ignore-below
  });
}
