import { createRootOwner, createState, map, onCleanup } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('an owner disposes what was created while it ran', () => {
    // embed-sample-code-ignore-above
    const [count, setCount] = createState(0);

    const mut_log: string[] = [];

    const owner = createRootOwner();

    const doubled = owner.run(() => {
      const d = count.pipe(map((n) => n * 2));

      d.subscribe((value) => {
        mut_log.push(`doubled: ${value}`);
      });

      onCleanup(() => {
        mut_log.push('cleaned up');
      });

      return d;
    });

    setCount(1);

    owner.dispose();

    // The subscription and the derived node went with the owner.
    setCount(2);

    assert.deepStrictEqual(mut_log, ['doubled: 0', 'doubled: 2', 'cleaned up']);

    assert.strictEqual(doubled.value, 2);

    // embed-sample-code-ignore-below
  });
}
