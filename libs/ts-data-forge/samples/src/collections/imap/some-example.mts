// Example: src/collections/imap.mts (some)
import { IMap } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const entries = [
      ['alice', 3],
      ['bob', 5],
    ] satisfies readonly (readonly [string, number])[];

    const map = IMap.create(entries);

    assert.isTrue(map.some((value) => value > 4));

    assert.isFalse(map.some((value) => value > 10));

    // embed-sample-code-ignore-below
  });
}
