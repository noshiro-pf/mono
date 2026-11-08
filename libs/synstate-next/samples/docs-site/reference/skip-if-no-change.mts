import { createValueEmitter, skipIfNoChange } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('skip-if-no-change', () => {
    // embed-sample-code-ignore-above
    const [reading, read] = createValueEmitter<number>();

    // An event source passes every value; this drops the repeats.
    const changes = reading.pipe(skipIfNoChange());

    const mut_seen: number[] = [];

    changes.subscribe((r) => {
      mut_seen.push(r);
    });

    read(1);

    read(1);

    read(2);

    assert.deepStrictEqual(mut_seen, [1, 2]);

    // embed-sample-code-ignore-below
  });
}
