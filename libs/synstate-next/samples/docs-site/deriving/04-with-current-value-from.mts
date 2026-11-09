import {
  createEventEmitter,
  createState,
  map,
  withCurrentValueFrom,
} from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('withCurrentValueFrom', () => {
    // embed-sample-code-ignore-above
    const [draft, setDraft] = createState('');

    const [submitted, submit] = createEventEmitter();

    // What the draft holds when the form is submitted. Typing alone sends
    // nothing: `draft` is read, not followed.
    const sent = submitted
      .pipe(withCurrentValueFrom(draft))
      .pipe(map(([, text]) => text, { equals: () => false }));

    const mut_sent: string[] = [];

    sent.subscribe((text) => {
      mut_sent.push(text);
    });

    setDraft('h');

    setDraft('hello');

    submit();

    submit();

    assert.deepStrictEqual(mut_sent, ['hello', 'hello']);

    // embed-sample-code-ignore-below
  });
}
