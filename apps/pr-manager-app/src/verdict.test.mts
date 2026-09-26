import { type ChecksSummary } from 'pr-report-core';
import {
  describeCheckBreakdown,
  describeCheckCounts,
  presentVerdict,
} from './verdict.mjs';

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

/** #2031 as the page came to see it: one failed, one not reported yet. */
const checks: ChecksSummary = {
  verdict: 'failing',
  passed: ['style-check-result / result', 'no-skip-ci-label'],
  failed: ['code-check-result / result'],
  pending: [],
  skipped: ['test-node-versions-result / result'],
  missing: ['spell-check-result / result'],
  required: 5,
} as const;

describe(describeCheckCounts, () => {
  test('counts each state, worst first, leaving out the empty ones', () => {
    // A context nothing has reported on yet is still coming, so it is
    // counted with the pending ones.
    expect(describeCheckCounts(checks)).toBe(
      '1\u{2717} 1\u{2026} 1\u{2013} 2\u{2713}',
    );

    expect(
      describeCheckCounts({
        ...checks,
        verdict: 'passed',
        failed: [],
        skipped: [],
        missing: [],
      }),
    ).toBe('2\u{2713}');
  });
});

describe(describeCheckBreakdown, () => {
  test('names every required context under the state it is in', () => {
    expect(describeCheckBreakdown(checks)).toBe(
      [
        'over the 5 contexts the ruleset requires:',
        'failed — code-check-result / result',
        'pending — spell-check-result / result',
        'skipped — test-node-versions-result / result',
        'passed — style-check-result / result, no-skip-ci-label',
      ].join('\n'),
    );
  });
});
