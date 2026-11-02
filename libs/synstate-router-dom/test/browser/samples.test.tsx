/**
 * Runs the README samples, which mount into `document.body` when imported, and
 * checks that they unmount everything they mounted.
 */
describe('README samples', () => {
  test('01-routes unmounts everything it mounted', async () => {
    document.body.replaceChildren();

    await import('../../samples/readme/01-routes.js');

    assert.strictEqual(document.body.getHTML(), '');
  });
});

export {};
