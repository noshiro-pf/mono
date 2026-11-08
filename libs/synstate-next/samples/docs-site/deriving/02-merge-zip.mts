import { createValueEmitter, merge, zip } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('merge and zip', () => {
    // embed-sample-code-ignore-above
    const [mouse, emitMouse] = createValueEmitter<string>();

    const [keyboard, emitKeyboard] = createValueEmitter<string>();

    // Whichever emitted.
    const input = merge([mouse, keyboard]);

    // The n-th value of each, paired.
    const pairs = zip([mouse, keyboard]);

    const mut_inputs: string[] = [];

    const mut_pairs: string[] = [];

    input.subscribe((value) => {
      mut_inputs.push(value);
    });

    pairs.subscribe(([m, k]) => {
      mut_pairs.push(`${m} + ${k}`);
    });

    emitMouse('click');

    emitMouse('drag');

    emitKeyboard('a');

    emitKeyboard('b');

    assert.deepStrictEqual(mut_inputs, ['click', 'drag', 'a', 'b']);

    assert.deepStrictEqual(mut_pairs, ['click + a', 'drag + b']);

    // embed-sample-code-ignore-below
  });
}
