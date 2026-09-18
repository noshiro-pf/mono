import { renderMarkdown, renderTerminal } from './render.mjs';
import { buildReport } from './report.mjs';
import { type PrReport, type PullRequestFacts } from './types.mjs';

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
    comparison: { aheadBy: 1, behindBy: 0 },
    reported: new Map(),
    linkedIssues: [],
    ...overrides,
  }) as const;

const report = (pulls: readonly PullRequestFacts[]): PrReport =>
  buildReport({
    repo: { owner: 'noshiro-pf', name: 'mono' },
    generatedAt: '2026-09-18T09:00:00Z',
    required: ['code-check-result', 'no-skip-ci-label'],
    authenticated: false,
    pulls,
  });

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
          labels: ['skip-ci', 'merge-queued'],
          comparison: { aheadBy: 3, behindBy: 12 },
        }),
      ]),
    );

    assert.isTrue(rendered.includes('+3'));

    assert.isTrue(rendered.includes('-12'));

    assert.isTrue(rendered.includes('skip-ci'));

    assert.isTrue(rendered.includes('merge-queued'));
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
