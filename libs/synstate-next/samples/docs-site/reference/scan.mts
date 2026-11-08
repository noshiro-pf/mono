import { createValueEmitter, scan } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('scan', () => {
    // embed-sample-code-ignore-above
    const [amount, add] = createValueEmitter<number>();

    const total = amount.pipe(scan((sum, n) => sum + n, 0));

    // `scan` holds its seed from the start.
    assert.strictEqual(total.value, 0);

    add(10);

    add(5);

    assert.strictEqual(total.value, 15);

    // embed-sample-code-ignore-below
  });
}
