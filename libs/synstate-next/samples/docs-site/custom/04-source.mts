import { createRootOwner, createSource, type Observable } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('a source', () => {
    // embed-sample-code-ignore-above
    const fromEvent = (target: EventTarget, type: string): Observable<Event> =>
      createSource<Event>((ctx) => {
        const listener = (event: Event): void => {
          ctx.emit(event);
        };

        target.addEventListener(type, listener);

        // Runs when the source is disposed, with its owner or by itself.
        ctx.onCleanup(() => {
          target.removeEventListener(type, listener);
        });
      });

    const button = new EventTarget();

    const owner = createRootOwner();

    const mut_types: string[] = [];

    owner.run(() => {
      fromEvent(button, 'click').subscribe((event) => {
        mut_types.push(event.type);
      });
    });

    button.dispatchEvent(new Event('click'));

    owner.dispose();

    // The listener was removed.
    button.dispatchEvent(new Event('click'));

    assert.deepStrictEqual(mut_types, ['click']);

    // embed-sample-code-ignore-below
  });
}
