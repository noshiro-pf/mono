import { createBooleanState } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('createBooleanState', () => {
    // embed-sample-code-ignore-above
    const [isOpen, { setTrue: open, setFalse: close, toggle }] =
      createBooleanState(false);

    const mut_seen: boolean[] = [];

    isOpen.subscribe((value) => {
      mut_seen.push(value);
    });

    open();

    // Already open: nothing is passed on.
    open();

    toggle();

    close();

    assert.deepStrictEqual(mut_seen, [false, true, false]);

    // embed-sample-code-ignore-below
  });
}
