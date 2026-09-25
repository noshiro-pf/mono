import { buildEntries } from './report.mjs';
import { type PullRequestFacts } from './types.mjs';

const facts = (
  number: number,
  overrides: Partial<PullRequestFacts> = {},
): PullRequestFacts =>
  ({
    number,
    title: `pull request ${number}`,
    body: '',
    author: 'someone',
    isDraft: false,
    labels: [],
    autoMerge: false,
    headRef: `branch-${number}`,
    headSha: `sha-${number}`,
    baseRef: 'main',
    fromFork: false,
    url: `https://github.com/o/r/pull/${number}`,
    updatedAt: '2026-09-26T00:00:00Z',
    comparison: undefined,
    reported: new Map(),
    linkedIssues: [],
    ...overrides,
  }) as const;

const decide = (
  pulls: readonly PullRequestFacts[],
): ReturnType<typeof buildEntries> =>
  buildEntries({ required: [], defaultBranch: 'main', pulls });

describe(buildEntries, () => {
  test('a stacked pull request waits for the one below it', () => {
    const { entries, roots } = decide([
      facts(1),
      facts(2, { baseRef: 'branch-1' }),
    ]);

    assert.deepStrictEqual(
      entries.map(({ stackedOn, blockedBy }) => ({ stackedOn, blockedBy })),
      [
        { stackedOn: undefined, blockedBy: [] },
        { stackedOn: 1, blockedBy: [1] },
      ],
    );

    // Drawn under it, as a `Merge-After: #1` would be.
    assert.deepStrictEqual(
      roots.map(({ number, children }) => [
        number,
        children.map((child) => child.number),
      ]),
      [[1, [2]]],
    );
  });

  test('a declaration naming the parent as well adds nothing', () => {
    const { entries, roots } = decide([
      facts(1),
      facts(2, { baseRef: 'branch-1', body: 'Merge-After: #1' }),
    ]);

    assert.deepStrictEqual(entries[1]?.blockedBy, [1]);

    assert.deepStrictEqual(roots[0]?.children.length, 1);
  });

  test('a stack and a declaration both constrain', () => {
    const { entries } = decide([
      facts(1),
      facts(3),
      facts(2, { baseRef: 'branch-1', body: 'Merge-After: #3' }),
    ]);

    assert.deepStrictEqual(entries[1]?.blockedBy, [1, 3]);
  });

  test('a base whose pull request has merged constrains nothing', () => {
    // GitHub moves such a pull request onto the default branch, but until it
    // has, its base names a branch nothing open heads.
    const { entries, roots } = decide([facts(2, { baseRef: 'branch-1' })]);

    assert.deepStrictEqual(entries[0]?.stackedOn, undefined);

    assert.deepStrictEqual(
      roots.map(({ number }) => number),
      [2],
    );
  });
});
