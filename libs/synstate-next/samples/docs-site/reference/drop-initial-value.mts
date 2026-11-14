import { dropInitialValue, state } from 'synstate-next';
import { Optional } from 'ts-std-forge';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('drop-initial-value', () => {
    // embed-sample-code-ignore-above
    const eventId = state('event-1');

    // Reacts to a change of the id, not to the id held at the start.
    const eventIdChanged = eventId.pipe(dropInitialValue());

    const mut_fetched: string[] = [];

    eventIdChanged.subscribe((id) => {
      mut_fetched.push(id);
    });

    assert.isTrue(Optional.isNone(eventIdChanged.getSnapshot()));

    assert.deepStrictEqual(mut_fetched, []);

    eventId.set('event-2');

    assert.deepStrictEqual(mut_fetched, ['event-2']);

    // embed-sample-code-ignore-below
  });
}
