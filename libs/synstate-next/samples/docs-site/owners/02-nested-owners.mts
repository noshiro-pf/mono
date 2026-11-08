import {
  createOwner,
  createRootOwner,
  getOwner,
  onCleanup,
} from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('owners nest', () => {
    // embed-sample-code-ignore-above
    const mut_log: string[] = [];

    const page = createRootOwner();

    const dialog = page.run(() => {
      onCleanup(() => {
        mut_log.push('page');
      });

      // A child of the owner that is running: `page`.
      const child = createOwner();

      child.run(() => {
        onCleanup(() => {
          mut_log.push('dialog');
        });
      });

      return child;
    });

    assert.strictEqual(dialog.parent, page);

    // Closing the dialog alone.
    dialog.dispose();

    // Disposing the page disposes what is left of it.
    page.dispose();

    assert.deepStrictEqual(mut_log, ['dialog', 'page']);

    // Outside every `run`, there is no current owner.
    assert.isUndefined(getOwner());

    // embed-sample-code-ignore-below
  });
}
