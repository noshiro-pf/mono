import { createEventEmitter, scan } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('create-event-emitter', () => {
    // embed-sample-code-ignore-above
    const [clicked, click] = createEventEmitter();

    const clicks = clicked.pipe(scan((n) => n + 1, 0));

    click();

    click();

    assert.strictEqual(clicks.value, 2);

    // embed-sample-code-ignore-below
  });
}
