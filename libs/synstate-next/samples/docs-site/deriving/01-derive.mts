import { batch, createState, derive } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('derive', () => {
    // embed-sample-code-ignore-above
    const [price, setPrice] = createState(100);

    const [quantity, setQuantity] = createState(2);

    // Computed once per update, however many parents changed.
    const total = derive([price, quantity], (p, q) => p * q);

    assert.strictEqual(total.value, 200);

    // The latest values as a tuple.
    const pair = derive([price, quantity], (p, q) => [p, q] as const);

    const mut_totals: number[] = [];

    const mut_pairs: string[] = [];

    total.subscribe((t) => {
      mut_totals.push(t);
    });

    pair.subscribe(([p, q]) => {
      mut_pairs.push(`${p} × ${q}`);
    });

    batch(() => {
      setPrice(50);

      setQuantity(4);
    });

    // 50 × 4 is 200 again: `total` stops the update there. `pair` builds a new
    // tuple on every update, so it never does.
    assert.deepStrictEqual(mut_totals, [200]);

    assert.deepStrictEqual(mut_pairs, ['100 × 2', '50 × 4']);

    // embed-sample-code-ignore-below
  });
}
