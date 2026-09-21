import { presentVerdict } from './verdict.mjs';

describe(presentVerdict, () => {
  test('never leaves the colour to carry the meaning on its own', () => {
    for (const verdict of ['failing', 'passed', 'paused', 'pending'] as const) {
      const presented = presentVerdict(verdict);

      assert.isTrue(presented.icon !== '');

      assert.isTrue(presented.label !== '');
    }
  });

  // Four verdicts that look alike is the failure this is guarding against,
  // and it is the one a reader would put down to their own eyesight.
  test('draws something different for each of them', () => {
    const icons = (['failing', 'passed', 'paused', 'pending'] as const).map(
      (verdict) => presentVerdict(verdict).icon,
    );

    const distinct = new Set(icons);

    expect(distinct.size).toBe(icons.length);
  });

  test('treats a held pull request as held rather than as broken', () => {
    // While `skip-ci` is on nothing has run, and colouring that as a failure
    // would make a queue of held pull requests read as a wall of red.
    expect(presentVerdict('paused').status).toBe('neutral');

    expect(presentVerdict('failing').status).toBe('critical');
  });
});
