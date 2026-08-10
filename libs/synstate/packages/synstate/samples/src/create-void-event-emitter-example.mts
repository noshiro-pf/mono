import { createEventEmitter } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(createEventEmitter, () => {
    // embed-sample-code-ignore-above

    const [click$, emitClick] = createEventEmitter();

    const mut_clickCount = { value: 0 };

    click$.subscribe(() => {
      mut_clickCount.value += 1;
    });

    emitClick(); // logs: Clicked!

    assert.deepStrictEqual(mut_clickCount.value, 1);

    emitClick();

    emitClick();

    assert.deepStrictEqual(mut_clickCount.value, 3);

    // embed-sample-code-ignore-below
  });
}
