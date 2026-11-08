import { createValueEmitter, merge } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('merge', () => {
    // embed-sample-code-ignore-above
    const [mouse, fromMouse] = createValueEmitter<string>();

    const [keyboard, fromKeyboard] = createValueEmitter<string>();

    const mut_inputs: string[] = [];

    merge([mouse, keyboard]).subscribe((input) => {
      mut_inputs.push(input);
    });

    fromMouse('click');

    fromKeyboard('enter');

    assert.deepStrictEqual(mut_inputs, ['click', 'enter']);

    // embed-sample-code-ignore-below
  });
}
