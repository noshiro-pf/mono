import { createState, map } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('equals and keepEqualParts', () => {
    // embed-sample-code-ignore-above
    type User = Readonly<{
      name: string;
      tags: readonly string[];
    }>;

    // A server answers with a new object every time, equal or not.
    const [user, setUser] = createState<User>(
      { name: 'Ada', tags: ['admin'] },
      { keepEqualParts: true },
    );

    const tags = user.pipe(map((u) => u.tags));

    const mut_tagUpdates: (readonly string[])[] = [];

    tags.subscribe((t) => {
      mut_tagUpdates.push(t);
    });

    const before = user.value;

    // Deeply equal: nothing is passed on, and the object held stays.
    setUser({ name: 'Ada', tags: ['admin'] });

    assert.strictEqual(user.value, before);

    // Only `name` changed: `tags` keeps its array, so `tags` passes nothing.
    setUser({ name: 'Ada Lovelace', tags: ['admin'] });

    assert.strictEqual(user.value.tags, before.tags);

    assert.strictEqual(mut_tagUpdates.length, 1);

    // `equals` decides what counts as a change.
    const [point, setPoint] = createState(
      { x: 0, y: 0 },
      { equals: (a, b) => a.x === b.x && a.y === b.y },
    );

    const mut_points: number[] = [];

    point.subscribe((p) => {
      mut_points.push(p.x);
    });

    setPoint({ x: 0, y: 0 });

    setPoint({ x: 1, y: 0 });

    assert.deepStrictEqual(mut_points, [0, 1]);

    // embed-sample-code-ignore-below
  });
}
