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

  // The combination `unblock-prs` passes over with "auto-merge is not
  // enabled": queued, so the author asked for it to land, and nothing that
  // would land it.
  test('names a queued pull request that has no auto-merge', () => {
    const rendered = renderMarkdown(
      report([
        facts({
          number: 1901,
          labels: labelled('merge-queued'),
          autoMerge: false,
        }),
      ]),
    );

    assert.isTrue(rendered.includes('no auto-merge'));
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
