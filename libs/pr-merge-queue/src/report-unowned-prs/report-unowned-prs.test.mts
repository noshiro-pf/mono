import type { ContextState, ReportEntry } from 'pr-report-core';
import { planUnownedReports } from './report-unowned-prs.mjs';

const entry = (number: number): ReportEntry =>
  ({
    number,
    title: 'fix: a thing',
    body: '',
    author: 'someone',
    isDraft: false,
    labels: [{ name: 'merge-queued', color: '', description: '' }],
    autoMerge: false,
    headRef: `fix/${number}`,
    headSha: 'c'.repeat(40),
    baseRef: 'main',
    fromFork: false,
    url: '',
    updatedAt: '2026-10-15T00:00:00Z',
    headCommittedAt: undefined,
    comparison: undefined,
    reported: new Map<string, ContextState>(),
    checksRunning: false,
    linkedIssues: [],
    mergeAfter: [],
    stackedOn: undefined,
    inheritedMergeAfter: [],
    notStartedIssues: [],
    blockedBy: [],
    checks: {
      verdict: 'paused',
      passed: [],
      failed: [],
      pending: [],
      skipped: [],
      missing: [],
      notRun: [],
      required: 0,
    },
  }) as const;

const unowned = (number: number) =>
  ({
    entry: entry(number),
    owner: { owner: 'none', reason: 'set aside for `mystery`' },
    comments: undefined,
  }) as const;

describe(planUnownedReports, () => {
  test('files one issue per pull request, marked so it is found again', () => {
    const plan = planUnownedReports([unowned(2267)], []);

    assert.deepStrictEqual(plan.reported, []);

    assert.lengthOf(plan.toFile, 1);

    const [report] = plan.toFile;

    assert.strictEqual(
      report?.title,
      'unblock-prs: #2267 is in the queue with no owner',
    );

    assert.match(
      report?.body ?? '',
      /^<!-- unblock-prs:unowned pr=2267 -->\n/u,
    );

    assert.include(report?.body ?? '', 'set aside for `mystery`');
  });

  test('does not file again what an open issue already reports', () => {
    const plan = planUnownedReports(
      [unowned(2267), unowned(2273)],
      [
        { number: 2300, body: '<!-- unblock-prs:unowned pr=2267 -->\n\nprose' },
        { number: 2301, body: '<!-- unblock-prs:unowned pr=22670 -->' },
      ],
    );

    assert.deepStrictEqual(plan.reported, [{ pr: 2267, issue: 2300 }]);

    assert.deepStrictEqual(
      plan.toFile.map(({ pr }) => pr),
      [2273],
    );
  });
});
