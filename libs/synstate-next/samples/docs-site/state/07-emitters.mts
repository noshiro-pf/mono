import {
  createEventEmitter,
  createValueEmitter,
  scan,
  source,
} from 'synstate-next';
import { Optional } from 'ts-std-forge';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('events', () => {
    // embed-sample-code-ignore-above
    // An event holds nothing until it first fires, and every `emit` passes on,
    // equal to the last or not.
    const [clicked, click] = createEventEmitter();

    const clicks = clicked.pipe(scan((n) => n + 1, 0));

    click();

    click();

    assert.strictEqual(clicks.value, 2);

    const [keyPressed, pressKey] = createValueEmitter<string>();

    const mut_keys: string[] = [];

    keyPressed.subscribe((key) => {
      mut_keys.push(key);
    });

    pressKey('a');

    pressKey('a');

    assert.deepStrictEqual(mut_keys, ['a', 'a']);

    // Both are `source()`, with the function taken off.
    const messages = source<string>();

    assert.isFalse(messages.hasValue);

    messages.emit('hello');

    assert.deepStrictEqual(messages.getSnapshot(), Optional.some('hello'));

    // embed-sample-code-ignore-below
  });
}
