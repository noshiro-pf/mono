// Example: src/collections/imap.mts (update)
import { IMap, Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const entries = [
      ['alice', 10],
      ['bob', 8],
    ] satisfies readonly (readonly ['alice' | 'bob' | 'charlie', number])[];

    const scores = IMap.create<'alice' | 'bob' | 'charlie', number>(entries);

    const boosted = scores.update('alice', (value) => value + 5);

    const unchanged = scores.update('charlie', (value) => value + 1);

    assert.deepStrictEqual(boosted.get('alice'), Optional.some(15));

    assert.deepStrictEqual(scores.get('alice'), Optional.some(10));

    assert.isTrue(unchanged === scores);

    // embed-sample-code-ignore-below
  });
}
