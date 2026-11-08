import {
  createRootOwner,
  createState,
  getOwner,
  map,
  onCleanup,
  untracked,
} from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('owners', () => {
    // embed-sample-code-ignore-above
    const [count, setCount] = createState(1);

    const mut_log: string[] = [];

    const owner = createRootOwner();

    const shared = owner.run(() => {
      // What is created in `run` belongs to `owner`.
      count.pipe(map((n) => n * 2)).subscribe((n) => {
        mut_log.push(`doubled ${n}`);
      });

      onCleanup(() => {
        mut_log.push('cleaned up');
      });

      assert.strictEqual(getOwner(), owner);

      // `untracked` creates something no owner disposes.
      return untracked(() => count.pipe(map((n) => n * 3)));
    });

    owner.dispose();

    setCount(2);

    assert.deepStrictEqual(mut_log, ['doubled 2', 'cleaned up']);

    assert.isTrue(owner.disposed);

    assert.strictEqual(shared.value, 6);

    // embed-sample-code-ignore-below
  });
}
