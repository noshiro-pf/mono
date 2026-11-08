import { createEventEmitter, createState, map, scan } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('equality cut-off', () => {
    // embed-sample-code-ignore-above
    const [count, setCount] = createState(1);

    const isEven = count.pipe(map((n) => n % 2 === 0));

    let mut_computed = 0;

    const label = isEven.pipe(
      map((even) => {
        mut_computed += 1;

        return even ? 'even' : 'odd';
      }),
    );

    setCount(3);

    setCount(5);

    // `isEven` stayed `false`, so nothing below it was visited.
    assert.strictEqual(mut_computed, 1);

    assert.strictEqual(label.value, 'odd');

    // An event mapped to a value that repeats: pass `equals: () => false`, or
    // the second one is taken for no change.
    const [clicked, click] = createEventEmitter();

    const steps = clicked.pipe(map(() => 1, { equals: () => false }));

    const position = steps.pipe(scan((sum, step) => sum + step, 0));

    click();

    click();

    assert.strictEqual(position.value, 2);

    // embed-sample-code-ignore-below
  });
}
