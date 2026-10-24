import { buildEntries } from './report.mjs';
import type { ContextState, LinkedIssue, PullRequestFacts } from './types.mjs';

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
    headCommittedAt: undefined,
    comparison: undefined,
    reported: new Map(),
    checksRunning: false,
    linkedIssues: [],
    ...overrides,
  }) as const;

const linked = (number: number, state: LinkedIssue['state']): LinkedIssue =>
  ({
    number,
    title: `issue ${number}`,
    url: `https://github.com/o/r/issues/${number}`,
    state,
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

    assert.strictEqual(roots[0]?.children.length, 1);
  });

  test('a stack and a declaration both constrain', () => {
    const { entries } = decide([
      facts(1),
      facts(3),
      facts(2, { baseRef: 'branch-1', body: 'Merge-After: #3' }),
    ]);

    assert.deepStrictEqual(entries[1]?.blockedBy, [1, 3]);
  });

  test('a pull request merges after what the issues it closes start after', () => {
    const { entries, cycles } = buildEntries({
      required: [],
      defaultBranch: 'main',
      pulls: [
        facts(1, { linkedIssues: [linked(11, 'open')] }),
        facts(2, { linkedIssues: [linked(12, 'open')] }),
        facts(3, { body: 'Merge-After: #2' }),
      ],
      issues: {
        // #11 waits for #12, which #2 is closing, and for the open #3; #13
        // is open and nobody has started it.
        startAfter: new Map([[11, [12, 3, 13]]]),
        open: new Set([11, 12, 13]),
      },
    });

    assert.deepStrictEqual(
      entries.map(
        ({ number, inheritedMergeAfter, notStartedIssues, blockedBy }) => ({
          number,
          inheritedMergeAfter,
          notStartedIssues,
          blockedBy,
        }),
      ),
      [
        {
          number: 1,
          inheritedMergeAfter: [2, 3],
          notStartedIssues: [13],
          blockedBy: [2, 3],
        },
        {
          number: 2,
          inheritedMergeAfter: [],
          notStartedIssues: [],
          blockedBy: [],
        },
        {
          number: 3,
          inheritedMergeAfter: [],
          notStartedIssues: [],
          blockedBy: [2],
        },
      ],
    );

    assert.deepStrictEqual(cycles, []);
  });

  test('what the body declares already is counted once, and not as inherited', () => {
    const { entries } = buildEntries({
      required: [],
      defaultBranch: 'main',
      pulls: [
        facts(1, {
          body: 'Merge-After: #2',
          linkedIssues: [linked(11, 'open')],
        }),
        facts(2),
      ],
      issues: { startAfter: new Map([[11, [2]]]), open: new Set() },
    });

    assert.deepStrictEqual(entries[0]?.inheritedMergeAfter, []);

    assert.deepStrictEqual(entries[0]?.blockedBy, [2]);
  });

  test('an inherited order runs into the cycles like a declared one', () => {
    const { cycles } = buildEntries({
      required: [],
      defaultBranch: 'main',
      pulls: [
        facts(1, { linkedIssues: [linked(11, 'open')] }),
        facts(2, { body: 'Merge-After: #1' }),
      ],
      issues: { startAfter: new Map([[11, [2]]]), open: new Set() },
    });

    assert.deepStrictEqual(cycles, [[1, 2]]);
  });

  test('a closed issue it names as closing declares nothing', () => {
    const { entries } = buildEntries({
      required: [],
      defaultBranch: 'main',
      pulls: [facts(1, { linkedIssues: [linked(11, 'closed')] }), facts(2)],
      issues: { startAfter: new Map([[11, [2]]]), open: new Set() },
    });

    assert.deepStrictEqual(entries[0]?.blockedBy, []);
  });

  test('a base whose pull request has merged constrains nothing', () => {
    // GitHub moves such a pull request onto the default branch, but until it
    // has, its base names a branch nothing open heads.
    const { entries, roots } = decide([facts(2, { baseRef: 'branch-1' })]);

    assert.strictEqual(entries[0]?.stackedOn, undefined);

    assert.deepStrictEqual(
      roots.map(({ number }) => number),
      [2],
    );
  });

  test('only a pull request into the default branch waits for every context', () => {
    // `Validate PR title` runs on pull requests into `main` only, and the
    // ruleset that requires it covers nothing else.
    const reported = new Map<string, ContextState>([
      ['code-check-result / result', 'passed'],
    ]);

    const { entries } = buildEntries({
      required: ['code-check-result / result', 'Validate PR title'],
      defaultBranch: 'main',
      pulls: [
        facts(1, { reported }),
        facts(2, { baseRef: 'branch-1', reported }),
      ],
    });

    assert.deepStrictEqual(
      entries.map(({ checks }) => [
        checks.verdict,
        checks.missing,
        checks.notRun,
      ]),
      [
        ['pending', ['Validate PR title'], []],
        ['passed', [], ['Validate PR title']],
      ],
    );
  });

  // A repository that declares no ruleset still has checks, and calling every
  // pull request passed over none of them would hide the failing ones.
  test('without a ruleset, judges every context reported on the head', () => {
    const { entries } = buildEntries({
      required: undefined,
      defaultBranch: 'main',
      pulls: [
        facts(1, {
          reported: new Map<string, ContextState>([
            ['test', 'failed'],
            ['build', 'passed'],
          ]),
        }),
        facts(2, {
          baseRef: 'branch-1',
          reported: new Map<string, ContextState>([['build', 'passed']]),
        }),
        facts(3),
      ],
    });

    assert.deepStrictEqual(
      entries.map(({ checks }) => [
        checks.verdict,
        checks.failed,
        checks.passed,
        checks.required,
      ]),
      [
        ['failing', ['test'], ['build'], 2],
        ['passed', [], ['build'], 1],
        ['passed', [], [], 0],
      ],
    );
  });
});
