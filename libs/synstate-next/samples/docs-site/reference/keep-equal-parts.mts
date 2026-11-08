import { createValueEmitter, keepEqualParts, map } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('keep-equal-parts', () => {
    // embed-sample-code-ignore-above
    type User = Readonly<{ name: string; tags: readonly string[] }>;

    const [fetched, receive] = createValueEmitter<User>();

    const user = fetched.pipe(keepEqualParts());

    const tags = user.pipe(map((u) => u.tags));

    receive({ name: 'a', tags: ['x'] });

    const first = tags.peek();

    // A fresh object from the server, with the same tags.
    receive({ name: 'b', tags: ['x'] });

    // The tags kept their reference, so nothing below `tags` was woken.
    assert.strictEqual(tags.peek(), first);

    assert.strictEqual(user.peek()?.name, 'b');

    // embed-sample-code-ignore-below
  });
}
