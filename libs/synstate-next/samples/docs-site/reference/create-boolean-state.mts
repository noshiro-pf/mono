import { createBooleanState } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('create-boolean-state', () => {
    // embed-sample-code-ignore-above
    const [isOpen, { setTrue, setFalse, toggle }] = createBooleanState(false);

    setTrue();

    assert.isTrue(isOpen.value);

    toggle();

    assert.isFalse(isOpen.value);

    toggle();

    setFalse();

    assert.isFalse(isOpen.value);

    // embed-sample-code-ignore-below
  });
}
