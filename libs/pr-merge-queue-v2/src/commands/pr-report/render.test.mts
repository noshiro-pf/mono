import dedent from 'dedent';
import { ageOf, renderMarkdown, renderTerminal } from './render.mjs';
import type { PrReport, ReportEntry } from './report.mjs';

const entry = (
  number: number,
  fields: Partial<ReportEntry> = {},
): ReportEntry =>
  ({
    number,
    title: `pull ${number}`,
    body: '',
    author: 'author',
    isDraft: false,
    labels: [],
    autoMerge: false,
    headRef: `b${number}`,
    headSha: 'a'.repeat(40),
    baseRef: 'main',
    fromFork: false,
    url: `https://github.com/o/n/pull/${number}`,
    updatedAt: '2026-11-02T00:00:00Z',
    headCommittedAt: undefined,
    comparison: { aheadBy: 1, behindBy: 0 },
    reported: {},
    checksRunning: false,
    linkedIssues: [],
    mergeAfter: [],
    stackedOn: undefined,
    inheritedMergeAfter: [],
    notStartedIssues: [],
    blockedBy: [],
    checks: {
      verdict: 'passed',
      passed: ['ci'],
      failed: [],
      pending: [],
      skipped: [],
      missing: [],
      notRun: [],
      required: 1,
    },
    setAside: undefined,
    claim: undefined,
    owner: undefined,
    ...fields,
  }) as const;

const report = (fields: Partial<PrReport> = {}): PrReport =>
  ({
    repo: { owner: 'o', name: 'n' },
    defaultBranch: 'main',
    generatedAt: '2026-11-10T00:00:00Z',
    authenticated: true,
    required: ['ci'],
    entries: [
      entry(1),
      entry(2, {
        stackedOn: 1,
        isDraft: true,
        autoMerge: true,
        comparison: undefined,
        labels: [{ name: 'skip-ci', color: 'ffffff', description: '' }],
        checks: {
          verdict: 'paused',
          passed: [],
          failed: ['ci'],
          pending: [],
          skipped: [],
          missing: [],
          notRun: [],
          required: 1,
        },
      }),
      entry(3, { inheritedMergeAfter: [1], notStartedIssues: [9] }),
      entry(4),
      entry(5),
    ],
    roots: [
      {
        number: 1,
        repeated: false,
        children: [
          { number: 2, repeated: false, children: [] },
          { number: 3, repeated: false, children: [] },
        ],
      },
    ],
    cycles: [[4, 5]],
    merged: [
      {
        number: 6,
        title: 'pull 6',
        author: 'author',
        url: 'https://github.com/o/n/pull/6',
        headRef: 'b6',
        baseRef: 'main',
        mergedAt: '2026-11-09T00:00:00Z',
        labels: [],
        linkedIssues: [
          {
            number: 8,
            title: '',
            url: 'https://github.com/o/n/issues/8',
            state: 'unknown',
          },
        ],
      },
    ],
    mergedWithinDays: 1,
    issues: [],
    issuesLimit: 30,
    ...fields,
  }) as const;

describe(renderTerminal, () => {
  test('draws the tree, the cycles and what merged', () => {
    assert.strictEqual(
      renderTerminal(report()),
      `${dedent`
        Open pull requests — o/n
        5 open · 0 queued · 1 draft · 0 failing · 0 behind · generated 2026-11-10T00:00:00Z

        ✓ #1 pull 1 · +1 / -0
        ├─ ⏸ #2 pull 2 · draft · stacked on #1 · ahead/behind unread · [skip-ci] · auto-merge · checks paused, stale red: ci
        └─ ✓ #3 pull 3 · after #1 (Start-After) · #9 (issue) not done · +1 / -0

        Merge-After cycles

        Each of these waits, in the end, for itself. Nothing can pick them up
        until one of the declarations goes.

        - #4 → #5 → #4

        Merged in the last 1 day

        - #6 pull 6 · 2026-11-09T00:00:00Z · by author · closes #8
      `}\n`,
    );
  });

  test('nothing open, and read without a token', () => {
    assert.strictEqual(
      renderTerminal(
        report({ entries: [], roots: [], cycles: [], merged: [] }),
      ),
      'Open pull requests — o/n\n\nNo open pull requests.\n',
    );

    assert.include(
      renderTerminal(report({ authenticated: false })),
      'Read without a token',
    );
  });

  test('says it read without a token with nothing open, too', () => {
    const empty = report({
      entries: [],
      roots: [],
      cycles: [],
      merged: [],
      authenticated: false,
    });

    assert.include(
      renderTerminal(empty),
      '\nRead without a token: the linked issues',
    );

    assert.include(
      renderMarkdown(empty),
      '\n> Read without a token: the linked issues',
    );
  });
});

describe(renderMarkdown, () => {
  test('links and bolds, and nests the tree as a list', () => {
    const lines = renderMarkdown(report()).split('\n');

    assert.include(
      lines,
      '  - ⏸️ [#2](https://github.com/o/n/pull/2) **pull 2** · draft · stacked on #1 · ahead/behind unread · `skip-ci` · auto-merge · checks paused, stale red: ci',
    );

    assert.include(lines, '## Merge order');
  });

  test('an issue: its start, tier slips, claim and misplaced Merge-After', () => {
    const text = renderMarkdown(
      report({
        issuesLimit: 1,
        issues: [
          {
            number: 9,
            title: 'issue 9',
            author: 'author',
            url: 'https://github.com/o/n/issues/9',
            labels: [{ name: 'pending', color: 'ffffff', description: '' }],
            createdAt: '2026-11-01T00:00:00Z',
            updatedAt: '2026-11-02T00:00:00Z',
            comments: 0,
            startAfter: [4],
            misplacedMergeAfter: [5],
            start: 'in-progress',
            named: [{ number: 4, status: 'waiting' }],
            claim: {
              state: 'started',
              by: 'session-b',
              at: '2026-11-07T00:00:00Z',
            },
          },
        ],
      }),
    );

    assert.include(
      text,
      dedent`
        ## Open issues (1+)

        - [#9](https://github.com/o/n/issues/9) **issue 9** · in progress · started by session-b 3d ago · after #4 (open) · Merge-After: #5 is not read on an issue; use Start-After: · no priority tier · pending is for pull requests; hold with priority:hold · updated 2026-11-02T00:00:00Z · by author · \`pending\`
      `,
    );
  });
});

describe(ageOf, () => {
  test('minutes, then hours up to two days, then days', () => {
    const now = Date.parse('2026-11-10T00:00:00Z');

    assert.strictEqual(ageOf(now - 59 * 60_000, now), '59m');

    assert.strictEqual(ageOf(now - 47 * 3_600_000, now), '47h');

    assert.strictEqual(ageOf(now - 48 * 3_600_000, now), '2d');

    assert.strictEqual(ageOf(now + 60_000, now), '0m');
  });
});
