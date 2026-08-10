import { createValueEmitter } from 'synstate';

if (import.meta.vitest !== undefined) {
  test(createValueEmitter, () => {
    // embed-sample-code-ignore-above

    const [message$, emitMessage] = createValueEmitter<string>();

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const messageHistory: string[] = [];

    message$.subscribe((msg) => {
      messageHistory.push(msg);
    });

    emitMessage('Hello'); // logs: Hello

    assert.deepStrictEqual(messageHistory, ['Hello']);

    emitMessage('World');

    assert.deepStrictEqual(messageHistory, ['Hello', 'World']);

    // embed-sample-code-ignore-below
  });
}
