import { batch, createValueEmitter, scan } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('counting events with scan (synstate-next)', () => {
    // embed-sample-code-ignore-above
    // A click on a list item, sent as the item's id.
    const [clicked, click] = createValueEmitter<string>();

    const clickCount = clicked.pipe(scan((n) => n + 1, 0));

    let mut_count = 0;

    clickCount.subscribe((n) => {
      mut_count = n;
    });

    click('A');

    click('A'); // every emission is an event, equal or not

    batch(() => {
      // two clicks in one batch: each is delivered in a round of its own
      click('B');

      click('C');
    });

    // 4 clicks, counted as 4
    // embed-sample-code-ignore-below
    assert.strictEqual(mut_count, 4);
  });
}
