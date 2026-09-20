import { presentVerdict } from './verdict.mjs';

describe(presentVerdict, () => {
  test('never leaves the colour to carry the meaning on its own', () => {
    for (const verdict of ['failing', 'passed', 'paused', 'pending'] as const) {
      const presented = presentVerdict(verdict);

      assert.isTrue(presented.glyph !== '');

      assert.isTrue(presented.label !== '');
    }
  });

  test('treats a held pull request as held rather than as broken', () => {
    // While `skip-ci` is on nothing has run, and colouring that as a failure
    // would make a queue of held pull requests read as a wall of red.
    expect(presentVerdict('paused').status).toBe('neutral');

    expect(presentVerdict('failing').status).toBe('critical');
  });
});
