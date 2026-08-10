/* eslint-disable functional/immutable-data */
import { signal } from '@preact/signals';
import { fromSignal } from 'synstate-preact-signals';

if (import.meta.vitest !== undefined) {
  test('fromSignal', () => {
    // embed-sample-code-ignore-above

    const input = signal('hello');

    const [input$, dispose] = fromSignal(input);

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const mut_valueHistory: string[] = [];

    input$.subscribe((value) => {
      mut_valueHistory.push(value);
    });

    assert.deepStrictEqual(mut_valueHistory, ['hello']);

    input.value = 'world';

    assert.deepStrictEqual(mut_valueHistory, ['hello', 'world']);

    dispose(); // stop tracking the signal

    // embed-sample-code-ignore-below
  });
}
