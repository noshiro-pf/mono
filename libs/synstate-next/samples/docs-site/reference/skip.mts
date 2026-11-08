import { createState, skip } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('skip', () => {
    // embed-sample-code-ignore-above
    const [query, setQuery] = createState('');

    // Leaves out the value held at the start: only what the user typed.
    const typed = query.pipe(skip(1));

    assert.isFalse(typed.hasValue);

    setQuery('syn');

    assert.strictEqual(typed.getSnapshot(), 'syn');

    // embed-sample-code-ignore-below
  });
}
