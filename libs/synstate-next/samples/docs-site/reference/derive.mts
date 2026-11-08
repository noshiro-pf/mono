import { batch, createState, derive } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('derive', () => {
    // embed-sample-code-ignore-above
    const [price, setPrice] = createState(100);

    const [quantity, setQuantity] = createState(2);

    let mut_runs = 0;

    const total = derive([price, quantity], (p, q) => {
      mut_runs += 1;

      return p * q;
    });

    total.subscribe(() => {});

    batch(() => {
      setPrice(120);

      setQuantity(3);
    });

    assert.strictEqual(total.value, 360);

    // Once at creation, once for the update that changed both parents.
    assert.strictEqual(mut_runs, 2);

    // embed-sample-code-ignore-below
  });
}
