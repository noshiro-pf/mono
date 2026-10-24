// cspell:ignore ededed

import {
  buildReport,
  type Label,
  type OpenIssue,
  type PrReport,
  type PullRequestFacts,
} from 'pr-report-core';
import { renderMarkdown, renderTerminal } from './render.mjs';

/** Labels by name alone, for the tests that do not care what colour they are. */
const labelled = (...names: readonly string[]): readonly Label[] =>
  names.map((name) => ({ name, color: 'ededed', description: '' }));

const facts = (
  overrides: Partial<PullRequestFacts> & Readonly<{ number: number }>,
): PullRequestFacts =>
  ({
    title: `pull request ${overrides.number}`,
    body: '',
    author: 'noshiro-pf',
    isDraft: false,
    labels: [],
    headRef: `branch-${overrides.number}`,
    headSha: '0'.repeat(40),
    baseRef: 'main',
    fromFork: false,
    url: `https://github.com/noshiro-pf/mono/pull/${overrides.number}`,
    updatedAt: '2026-09-18T00:00:00Z',
    headCommittedAt: '2026-09-17T00:00:00Z',
    comparison: { aheadBy: 1, behindBy: 0 },
    autoMerge: false,
    reported: new Map(),
    checksRunning: false,
    linkedIssues: [],
    ...overrides,
  }) as const;

const report = (
  pulls: readonly PullRequestFacts[],
  issues: readonly OpenIssue[] = [],
): PrReport =>
  buildReport({
    repo: { owner: 'noshiro-pf', name: 'mono' },
    defaultBranch: 'main',
    generatedAt: '2026-09-18T09:00:00Z',
    required: ['code-check-result / result', 'no-skip-ci-label'],
    merged: [],
    mergedWithinDays: 7,
    issues,
    issuesLimit: 3,
    authenticated: false,
    pulls,
  });

const issue = (number: number): OpenIssue =>
  ({
    number,
    title: `issue ${number}`,
    author: 'noshiro-pf',
    url: `https://github.com/noshiro-pf/mono/issues/${number}`,
    labels: labelled('bug'),
    createdAt: '2026-09-10T00:00:00Z',
    updatedAt: '2026-09-17T00:00:00Z',
    comments: 2,
    startAfter: [],
    misplacedMergeAfter: [],
  }) as const;

describe('renderMarkdown', () => {
  test('says so plainly when there is nothing open', () => {
    const rendered = renderMarkdown(report([]));

    assert.isTrue(rendered.includes('No open pull requests.'));
  });

  test('nests a pull request under the one it declares it merges after', () => {
    const rendered = renderMarkdown(
      report([
        facts({ number: 1901 }),
        facts({ number: 1903, body: 'Merge-After: #1901' }),
      ]),
    );

    const lines = rendered.split('\n');

    const parent = lines.findIndex((l) => l.includes('#1901'));

    const child = lines.findIndex((l) => l.includes('#1903'));

    assert.isTrue(parent !== -1 && child === parent + 1);

    // Two spaces of indent is one level of a Markdown list.
    assert.isTrue(lines[child]?.startsWith('  - ') === true);

    assert.isTrue(lines[parent]?.startsWith('- ') === true);
  });

  test('nests a stacked pull request under the one it is on, and says so', () => {
    const rendered = renderMarkdown(
      report([
        facts({ number: 1901 }),
        facts({ number: 1903, baseRef: 'branch-1901' }),
      ]),
    );

    const lines = rendered.split('\n');

    const child = lines.findIndex((l) => l.includes('#1903'));

    assert.isTrue(lines[child]?.startsWith('  - ') === true);

    assert.include(lines[child] ?? '', 'stacked on #1901');
  });

  test('says what the issues it closes add to the order', () => {
    const rendered = renderMarkdown(
      buildReport({
        repo: { owner: 'noshiro-pf', name: 'mono' },
        defaultBranch: 'main',
        generatedAt: '2026-09-18T09:00:00Z',
        required: [],
        merged: [],
        mergedWithinDays: 7,
        issues: [],
        issuesLimit: 3,
        authenticated: false,
        pulls: [
          facts({
            number: 1903,
            linkedIssues: [
              {
                number: 1800,
                title: '',
                url: 'https://github.com/noshiro-pf/mono/issues/1800',
                state: 'open',
              },
            ],
          }),
          facts({ number: 1901 }),
        ],
        issueDeclarations: {
          startAfter: new Map([[1800, [1901, 1700]]]),
          open: new Set([1700]),
        },
      }),
    );

    const lines = rendered.split('\n');

    const child = lines.findIndex((l) => l.includes('#1903'));

    // Drawn under the one it inherited, as a declared one would be.
    assert.isTrue(lines[child]?.startsWith('  - ') === true);

    assert.include(lines[child] ?? '', 'after #1901 (Start-After)');

    assert.include(lines[child] ?? '', '#1700 (issue) not done');
  });

  test('links the pull request and every issue it closes', () => {
    const rendered = renderMarkdown(
      report([
        facts({
          number: 1901,
          linkedIssues: [
            {
              number: 1880,
              title: 'the bug',
              url: 'https://github.com/noshiro-pf/mono/issues/1880',
              state: 'open',
            },
          ],
        }),
      ]),
    );

    assert.isTrue(
      rendered.includes(
        '[#1901](https://github.com/noshiro-pf/mono/pull/1901)',
      ),
    );

    assert.isTrue(
      rendered.includes(
        '[#1880](https://github.com/noshiro-pf/mono/issues/1880)',
      ),
    );
  });

  test('reports labels, the commit counts and a branch that is behind', () => {
    const rendered = renderMarkdown(
      report([
        facts({
          number: 1901,
          labels: labelled('skip-ci', 'merge-queued'),
          comparison: { aheadBy: 3, behindBy: 12 },
        }),
      ]),
    );

    assert.isTrue(rendered.includes('+3'));

    assert.isTrue(rendered.includes('-12'));

    assert.isTrue(rendered.includes('skip-ci'));

    assert.isTrue(rendered.includes('merge-queued'));
  });

  test('says a queued pull request has auto-merge armed', () => {
    const rendered = renderMarkdown(
      report([
        facts({
          number: 1901,
          labels: labelled('merge-queued'),
          autoMerge: true,
        }),
      ]),
    );

    assert.isTrue(rendered.includes('auto-merge'));

    assert.isFalse(rendered.includes('no auto-merge'));
  });

  // The ordinary state of a queued pull request: `unblock-prs` arms it when
  // it picks it, so its absence until then is not news.
  test('says nothing about a queued pull request not yet armed', () => {
    const rendered = renderMarkdown(
      report([
        facts({
          number: 1901,
          labels: labelled('merge-queued'),
          autoMerge: false,
        }),
      ]),
    );

    assert.isFalse(rendered.includes('auto-merge'));
  });

  test('says nothing about auto-merge on a pull request that is not queued', () => {
    const rendered = renderMarkdown(
      report([facts({ number: 1901, autoMerge: false })]),
    );

    assert.isFalse(rendered.includes('auto-merge'));
  });

  test('names the pull requests on a `Merge-After` cycle', () => {
    const rendered = renderMarkdown(
      report([
        facts({ number: 1, body: 'Merge-After: #2' }),
        facts({ number: 2, body: 'Merge-After: #1' }),
      ]),
    );

    assert.isTrue(rendered.includes('Merge-After cycle'));

    assert.isTrue(rendered.includes('#1'));

    assert.isTrue(rendered.includes('#2'));
  });
});

describe('the open issues section', () => {
  test('lists every open issue with a link, its labels and its comments', () => {
    const rendered = renderMarkdown(
      report([facts({ number: 1901 })], [issue(2036)]),
    );

    assert.isTrue(rendered.includes('## Open issues (1)'));

    assert.isTrue(
      rendered.includes(
        '- [#2036](https://github.com/noshiro-pf/mono/issues/2036) **issue 2036**',
      ),
    );

    assert.isTrue(rendered.includes('`bug`'));

    assert.isTrue(rendered.includes('2 comments'));
  });

  test('says how each issue stands for being started, and what it waits for', () => {
    const rendered = renderMarkdown(
      buildReport({
        repo: { owner: 'noshiro-pf', name: 'mono' },
        defaultBranch: 'main',
        generatedAt: '2026-09-18T09:00:00Z',
        required: [],
        merged: [],
        mergedWithinDays: 7,
        issues: [
          { ...issue(2001), startAfter: [1901, 1700] },
          { ...issue(2002), startAfter: [1700] },
          { ...issue(2003), misplacedMergeAfter: [1901] },
          issue(2004),
        ],
        issuesLimit: 30,
        authenticated: false,
        pulls: [facts({ number: 1901 })],
        references: new Map([[1700, 'done']]),
      }),
    );

    const line = (number: number): string =>
      rendered.split('\n').find((each) => each.includes(`#${number}]`)) ?? '';

    assert.include(line(2001), 'waiting · after #1901 (open), #1700 (done)');

    assert.include(line(2002), 'ready · after #1700 (done)');

    assert.include(
      line(2003),
      'Merge-After: #1901 is not read on an issue; use Start-After:',
    );

    // Free is the ordinary case, and is not said.
    assert.notInclude(line(2004), 'free');
  });

  test('says when the list is full, so that it may not be all of them', () => {
    const rendered = renderMarkdown(
      report([facts({ number: 1901 })], [issue(1), issue(2), issue(3)]),
    );

    assert.isTrue(rendered.includes('## Open issues (3+)'));
  });

  test('is left out when no issue is open', () => {
    const rendered = renderMarkdown(report([facts({ number: 1901 })]));

    assert.isFalse(rendered.includes('Open issues'));
  });

  test('is there even when no pull request is open', () => {
    const rendered = renderMarkdown(report([], [issue(2036)]));

    assert.isTrue(rendered.includes('No open pull requests.'));

    assert.isTrue(rendered.includes('#2036'));
  });

  test('drops the Markdown in a terminal', () => {
    const rendered = renderTerminal(
      report([facts({ number: 1901 })], [issue(2036)]),
    );

    assert.isTrue(rendered.includes('Open issues (1)'));

    assert.isFalse(rendered.includes('## Open issues'));

    assert.isTrue(rendered.includes('#2036 issue 2036'));

    assert.isTrue(rendered.includes('[bug]'));
  });
});

describe('renderTerminal', () => {
  test('draws the same nesting without Markdown', () => {
    const rendered = renderTerminal(
      report([
        facts({ number: 1901 }),
        facts({ number: 1903, body: 'Merge-After: #1901' }),
      ]),
    );

    assert.isFalse(rendered.includes(']('));

    assert.isTrue(rendered.includes('#1901'));

    assert.isTrue(rendered.includes('#1903'));

    assert.isTrue(/[└├]/u.test(rendered));
  });
});
