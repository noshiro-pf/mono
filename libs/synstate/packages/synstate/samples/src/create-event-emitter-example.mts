import { createValueEmitter } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(createValueEmitter, () => {
    // embed-sample-code-ignore-above

    const [message$, emitMessage] = createValueEmitter<string>();

    const mut_history: string[] = [];

    message$.subscribe((msg) => {
      mut_history.push(msg);
    });

    emitMessage('Hello'); // logs: Hello

    assert.deepStrictEqual(mut_history, ['Hello']);

    emitMessage('World');

    assert.deepStrictEqual(mut_history, ['Hello', 'World']);

    // embed-sample-code-ignore-below
  });
}
