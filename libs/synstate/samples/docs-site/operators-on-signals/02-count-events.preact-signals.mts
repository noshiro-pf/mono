import { batch, effect, signal } from '@preact/signals-core';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('counting events written as an effect (Preact Signals)', () => {
    // embed-sample-code-ignore-above
    // A click on a list item, sent as the item's id.
    const clicked = signal<string | undefined>(undefined);

    const clickCount = signal(0);

    // scan((n) => n + 1, 0), written as an effect.
    effect(() => {
      if (clicked.value !== undefined) {
        clickCount.value = clickCount.peek() + 1;
      }
    });

    clicked.value = 'A';

    clicked.value = 'A'; // the same item again: an equal value, dropped

    batch(() => {
      // two clicks handled in one batch: the effect sees only the last
      clicked.value = 'B';

      clicked.value = 'C';
    });

    // 4 clicks, counted as 2
    // embed-sample-code-ignore-below
    assert.strictEqual(clickCount.value, 2);
  });
}
