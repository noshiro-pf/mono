import {
  createEventEmitter,
  createState,
  withCurrentValueFrom,
} from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('with-current-value-from', () => {
    // embed-sample-code-ignore-above
    const [draft, setDraft] = createState('');

    const [submitted, submit] = createEventEmitter();

    const mut_sent: string[] = [];

    submitted.pipe(withCurrentValueFrom(draft)).subscribe(([, text]) => {
      mut_sent.push(text);
    });

    // Typing alone sends nothing.
    setDraft('hi');

    setDraft('hello');

    submit();

    assert.deepStrictEqual(mut_sent, ['hello']);

    // embed-sample-code-ignore-below
  });
}
