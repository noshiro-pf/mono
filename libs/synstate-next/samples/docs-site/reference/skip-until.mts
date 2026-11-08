import {
  createEventEmitter,
  createValueEmitter,
  skipUntil,
} from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('skip-until', () => {
    // embed-sample-code-ignore-above
    const [message, receive] = createValueEmitter<string>();

    const [ready, markReady] = createEventEmitter();

    const shown = message.pipe(skipUntil(ready));

    const mut_seen: string[] = [];

    shown.subscribe((m) => {
      mut_seen.push(m);
    });

    receive('too early');

    markReady();

    receive('hello');

    assert.deepStrictEqual(mut_seen, ['hello']);

    // embed-sample-code-ignore-below
  });
}
