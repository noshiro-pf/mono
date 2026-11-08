import { createValueEmitter } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('create-value-emitter', () => {
    // embed-sample-code-ignore-above
    const [keyPressed, pressKey] = createValueEmitter<string>();

    const mut_keys: string[] = [];

    keyPressed.subscribe((key) => {
      mut_keys.push(key);
    });

    pressKey('a');

    // An event repeats: every emission propagates.
    pressKey('a');

    assert.deepStrictEqual(mut_keys, ['a', 'a']);

    // embed-sample-code-ignore-below
  });
}
