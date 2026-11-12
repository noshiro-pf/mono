/**
 * The labels the queue is made of (`spec/conventions.md`, "Labels"). They exist
 * only on GitHub, so these strings and the ones in `.github/workflows/` are the
 * whole of their declaration.
 */

/**
 * Whether `labels` holds `name`, whatever its case: GitHub's label names are
 * case-insensitive, so adding `in-progress` to a repository that has
 * `In-Progress` puts that one on.
 */
export const hasLabel = (labels: readonly string[], name: string): boolean => {
  const wanted = name.toLowerCase();

  return labels.some((label) => label.toLowerCase() === wanted);
};

export const pickPriorityOf = (labels: readonly string[]): PickPriority => {
  const high = hasLabel(labels, PullRequestLabel.priorityHigh);

  const low = hasLabel(labels, PullRequestLabel.priorityLow);

  return high && low ? 'conflicting' : high ? 'high' : low ? 'low' : 'normal';
};

/** The pull request labels the worker, the commands and the page read. */
export const PullRequestLabel = {
  /** The author says it is reviewed and may merge: the worker's whole scope. */
  mergeQueued: 'merge-queued',
  /** Run no checks yet; `no-skip-ci-label` holds the merge while it is on. */
  skipCi: 'skip-ci',
  /** Keep it on the default branch while it waits, honoured with `skip-ci`. */
  autoRebase: 'auto-rebase',
  /** The version pull request waits while this one is open. */
  blocksRelease: 'blocks-release',
  /** Picked before unlabelled candidates. */
  priorityHigh: 'priority:high',
  /** Picked after them. */
  priorityLow: 'priority:low',
  /** Read by the page only: the same as no priority to the worker. */
  priorityMid: 'priority:mid',
  /** Read by the page only: the author holds it back. */
  pending: 'pending',
} as const;

/** The issue labels the commands and the page read. */
export const IssueLabel = {
  /** Someone started it (`start-issue`). */
  inProgress: 'in-progress',
  /** Someone means to start it next (`start-issue --plan`). */
  planned: 'planned',
} as const;

/**
 * Issue labels that keep an issue from `run-issue-resolver` whatever its tier.
 */
export const NOT_FOR_RESOLVER_LABELS = [
  'duplicate',
  'invalid',
  'question',
  'wontfix',
  'pending',
] as const;

/**
 * Where a pull request's priority labels put it in the pick order. One carrying
 * both `priority:high` and `priority:low` is `conflicting`, which orders as
 * `normal` and is reported.
 */
export type PickPriority = 'conflicting' | 'high' | 'low' | 'normal';

if (import.meta.vitest !== undefined) {
  describe(hasLabel, () => {
    test('ignores case', () => {
      assert.isTrue(hasLabel(['In-Progress'], 'in-progress'));
    });

    test('does not match a prefix', () => {
      assert.isFalse(hasLabel(['skip-ci-later'], 'skip-ci'));
    });
  });

  describe(pickPriorityOf, () => {
    test.each([
      [[], 'normal'],
      [['priority:high'], 'high'],
      [['Priority:Low'], 'low'],
      [['priority:mid'], 'normal'],
      [['priority:high', 'priority:low'], 'conflicting'],
    ] as const)('%j is %s', (labels, expected) => {
      assert.strictEqual(pickPriorityOf(labels), expected);
    });
  });
}
