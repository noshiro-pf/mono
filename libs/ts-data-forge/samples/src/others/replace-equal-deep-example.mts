// Example: src/others/replace-equal-deep.mts (replaceEqualDeep)
import { hasKey, isRecord, replaceEqualDeep } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    type PullReport = DeepReadonly<{
      summary: { open: number };
      pulls: { number: number; title: string }[];
    }>;

    const held: PullReport = {
      summary: { open: 2 },
      pulls: [
        { number: 1, title: 'one' },
        { number: 2, title: 'two' },
      ],
    } as const;

    // A server answers with the whole report every time.
    const answer: PullReport = {
      summary: { open: 2 },
      pulls: [
        { number: 1, title: 'one' },
        { number: 2, title: 'two (edited)' },
      ],
    } as const;

    const written = replaceEqualDeep(held, answer);

    assert.deepStrictEqual(written, answer);

    // What did not change is the object already held,
    assert.strictEqual(written.summary, held.summary);

    assert.strictEqual(written.pulls[0], held.pulls[0]);

    // and what changed is new.
    assert.notStrictEqual(written.pulls[1], held.pulls[1]);

    // An answer that changes nothing gives back the value held.
    assert.strictEqual(replaceEqualDeep(held, structuredClone(held)), held);

    // Match array items by key rather than by index.
    const opened = replaceEqualDeep(
      held.pulls,
      [{ number: 0, title: 'zero' }, ...structuredClone(held.pulls)],
      {
        key: (item) =>
          isRecord(item) && hasKey(item, 'number') ? item.number : undefined,
      },
    );

    assert.strictEqual(opened[1], held.pulls[0]);

    assert.strictEqual(opened[2], held.pulls[1]);

    // embed-sample-code-ignore-below
  });
}
