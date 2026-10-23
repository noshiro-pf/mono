/**
 * Runs the README samples, which mount into `document.body` when imported, and
 * checks that they do what the README says they do.
 */
describe('README samples', () => {
  test('01-date-input unmounts everything it mounted', async () => {
    document.body.replaceChildren();

    await import('../../samples/readme/01-date-input.js');

    assert.strictEqual(document.body.getHTML(), '');
  });
});

export {};
