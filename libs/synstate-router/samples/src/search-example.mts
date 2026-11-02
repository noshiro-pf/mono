import { search } from 'synstate-router';

if (import.meta.vitest !== undefined) {
  test('search', () => {
    // embed-sample-code-ignore-above

    const page = search.int({ default: 1 });

    assert.strictEqual(page.decode('3'), 3);

    // An invalid value is read as absent, so the default applies.
    assert.strictEqual(page.decode('abc'), 1);

    const tags = search.array(search.string());

    assert.deepStrictEqual(tags.decode(['a', 'b']), ['a', 'b']);

    // embed-sample-code-ignore-below
  });
}
