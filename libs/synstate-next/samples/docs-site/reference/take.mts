import { createValueEmitter, take } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('take', () => {
    // embed-sample-code-ignore-above
    const [clicked, click] = createValueEmitter<number>();

    const firstTwo = clicked.pipe(take(2));

    const mut_seen: number[] = [];

    firstTwo.subscribe((n) => {
      mut_seen.push(n);
    });

    click(1);

    click(2);

    click(3);

    assert.deepStrictEqual(mut_seen, [1, 2]);

    // It keeps the last value it passed.
    assert.strictEqual(firstTwo.getSnapshot(), 2);

    // embed-sample-code-ignore-below
  });
}
