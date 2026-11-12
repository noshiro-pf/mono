import {
  instantOf,
  writeIssueClaimComment,
  writePullRequestClaimComment,
  writeSetAsideComment,
  type CheckRunFacts,
  type HeadChecks,
  type IssueFacts,
  type Label,
  type MergedPullRequestFacts,
  type PullRequestFacts,
  type Snapshot,
} from 'pr-report-core-v2';
import { Result } from 'ts-data-forge';
import {
  todayOf,
  weekBefore,
  type ReportRead,
  type RunningWorkflow,
  type WeeklyActivity,
} from '../../src/index.mjs';
import { issue, pull, snapshot, TIP } from '../snapshot-fixture.mjs';

/** A made-up week, the same every day. */
export const demoActivity = (nowMs: number): Result<WeeklyActivity, never> => {
  const merged = [12, 7, 0, 3, 18, 9, 14] as const;

  const closed = [4, 2, 0, 1, 6, 11, 3] as const;

  return Result.ok({
    days: weekBefore(nowMs).map((day, index) => ({
      ...day,
      merged: merged[index] ?? 0,
      closed: closed[index] ?? 0,
    })),
    today: { ...todayOf(nowMs), merged: 5, closed: 2 },
    countedAtMs: nowMs,
  });
};

/**
 * A made-up repository for the demo page and screenshots: stacks, a
 * `Merge-After:` cycle, every checks verdict, a set-aside and a claimed pull
 * request, code owners waiting, issues with `Start-After:`, tiers and claims,
 * merged pull requests and running workflows. Every time is relative to `nowMs`.
 */
export const demoRead = (nowMs: number): ReportRead =>
  ({
    snapshot: Result.ok(demoSnapshot(nowMs)),
    runs: Result.ok({ runs: demoRuns(nowMs), complete: true }),
  }) as const;

const REQUIRED = 'code-check-result / result';

const label = (name: string, color: string): Label =>
  ({
    name,
    color,
    description: '',
  }) as const;

const L = {
  queued: label('merge-queued', '0e8a16'),
  skipCi: label('skip-ci', 'fbca04'),
  high: label('priority:high', 'b60205'),
  mid: label('priority:mid', 'd93f0b'),
  low: label('priority:low', 'c5def5'),
  pending: label('pending', 'ededed'),
  bug: label('bug', 'd73a4a'),
  docs: label('documentation', '0075ca'),
  S: label('priority:S', 'b60205'),
  A: label('priority:A', 'd93f0b'),
  B: label('priority:B', 'fbca04'),
  C: label('priority:C', 'c5def5'),
  D: label('priority:D', 'ededed'),
  hold: label('priority:hold', '5319e7'),
  inProgress: label('in-progress', '1d76db'),
  planned: label('planned', 'bfd4f2'),
} as const;

const shaOf = (number: number): string => number.toString(16).padStart(40, '0');

const mergedPull = (
  number: number,
  title: string,
  mergedAt: string,
  closingIssues: readonly number[],
): MergedPullRequestFacts =>
  ({
    number,
    title,
    author: 'noshiro-pf',
    url: `https://github.com/noshiro-pf/mono/pull/${number}`,
    headRef: `claude/${number}`,
    baseRef: 'main',
    mergedAt,
    headSha: shaOf(number),
    mergeCommitSha: shaOf(number + 1),
    labels: [],
    closingIssues,
  }) as const;

const demoSnapshot = (nowMs: number): Snapshot => {
  const ago = (minutes: number): string => instantOf(nowMs - minutes * 60_000);

  const checks = (
    number: number,
    state: 'failed' | 'passed' | 'running',
  ): HeadChecks => {
    const sha = shaOf(number);

    const run: CheckRunFacts = {
      name: REQUIRED,
      status:
        state === 'running' ? ('in_progress' as const) : ('completed' as const),
      conclusion:
        state === 'running'
          ? undefined
          : state === 'passed'
            ? ('success' as const)
            : ('failure' as const),
      checkSuiteId: number * 10,
      id: number * 100,
      startedAt: ago(30),
      completedAt: state === 'running' ? undefined : ago(20),
      annotationTitles: undefined,
      url: '',
    } as const;

    return {
      sha,
      runs: [
        run,
        {
          ...run,
          name: 'lint',
          id: run.id + 1,
          status: 'completed',
          conclusion: 'success',
          completedAt: ago(25),
        },
      ],
      statuses: [],
      rounds: [
        {
          checkSuiteId: number * 10,
          runId: number * 1000,
          workflowId: 1,
          completed: state !== 'running',
          attemptStartedAt: ago(30),
          headBranch: `feature/${number}`,
        },
      ],
    };
  };

  const pr = (
    number: number,
    title: string,
    fields: Partial<PullRequestFacts> &
      Readonly<{
        state?: 'failed' | 'passed' | 'running';
      }> = {},
  ): PullRequestFacts => {
    const { state = 'passed', ...rest } = fields;

    return pull(number, {
      title,
      headSha: shaOf(number),
      checks: Result.ok(checks(number, state)),
      headCommittedAt: Result.ok(ago(number * 7)),
      updatedAt: ago(number * 3),
      author: 'noshiro-pf',
      ...rest,
    });
  };

  const pulls = [
    pr(3801, 'feat(pr-manager-v2): draw the merge order', {
      labels: [L.queued, L.skipCi, L.high],
      body: 'Closes #3790\n\nClaude-Session: [Rebuild PR Manager](https://claude.ai/code/session_demo1)',
      closingIssues: Result.ok([
        { number: 3790, title: 'Rebuild PR Manager', url: '', state: 'open' },
      ]),
      comparison: Result.ok({ aheadBy: 4, behindBy: 0 }),
    }),
    pr(3802, 'feat(pr-manager-v2): draw the queue', {
      labels: [L.queued, L.skipCi],
      headRef: 'claude/queue',
      baseRef: 'feature/3801',
      comparison: Result.ok({ aheadBy: 2, behindBy: 1 }),
      state: 'running',
    }),
    pr(3803, 'feat(pr-manager-v2): draw the open issues', {
      labels: [L.queued, L.mid],
      headRef: 'claude/issues',
      baseRef: 'claude/queue',
      comparison: Result.ok({ aheadBy: 6, behindBy: 3 }),
    }),
    pr(3810, 'fix(synstate): keep a scope alive across a re-mount', {
      labels: [L.queued, L.bug],
      state: 'failed',
      comparison: Result.ok({ aheadBy: 1, behindBy: 12 }),
      comments: Result.ok([
        {
          id: 1,
          body: writeSetAsideComment(
            { reason: 'checks-failed', headSha: shaOf(3810), baseSha: TIP },
            'A required check failed.',
          ),
          createdAt: ago(40),
        },
      ]),
    }),
    pr(3811, 'docs: explain the review loop', {
      labels: [L.docs, L.low],
      body: 'Merge-After: #3810',
      comparison: Result.ok({ aheadBy: 1, behindBy: 2 }),
    }),
    pr(3812, 'refactor(ts-data-forge): split the array module', {
      labels: [L.queued, L.skipCi],
      comments: Result.ok([
        {
          id: 2,
          body: writePullRequestClaimComment(
            {
              headSha: shaOf(3812),
              by: 'https://claude.ai/code/session_demo2',
              at: ago(15),
            },
            'Claimed to fix a failing check.',
          ),
          createdAt: ago(15),
        },
      ]),
      review: Result.ok({
        latestReviews: [],
        files: [
          {
            path: '.github/workflows/ci.yml',
            change: 'modified',
            previousPath: undefined,
          },
        ],
        filesComplete: true,
        unresolvedConversations: 0,
        pushers: ['noshiro-pf'],
      }),
    }),
    pr(3815, 'chore: try a new formatter', {
      isDraft: true,
      labels: [L.pending],
      comparison: Result.ok({ aheadBy: 9, behindBy: 30 }),
    }),
    pr(3820, 'feat(eslint-config-typed): a rule for phantom keys', {
      labels: [L.queued],
      body: 'Merge-After: #3821',
    }),
    pr(3821, 'test(eslint-config-typed): fixtures for phantom keys', {
      labels: [L.queued],
      body: 'Merge-After: #3820',
    }),
  ] as const;

  const queueTail = [
    pr(3830, 'fix(pr-merge-queue): wait for the rebase to land', {
      labels: [L.queued],
      mergeState: 'CLEAN',
      autoMerge: true,
      state: 'running',
    }),
    pr(3831, 'ci: pin the actions to their digests', {
      labels: [L.queued],
      mergeState: 'BEHIND',
      review: Result.ok({
        latestReviews: [],
        files: [
          {
            path: '.github/actions/setup/action.yml',
            change: 'modified',
            previousPath: undefined,
          },
        ],
        filesComplete: true,
        unresolvedConversations: 0,
        pushers: ['noshiro-pf'],
      }),
    }),
    ...[3832, 3833, 3834, 3835, 3836, 3837, 3838].map((number, index) =>
      pr(number, `chore: tidy part ${index + 1}`, {
        labels: index === 2 ? [L.queued, L.high] : [L.queued],
        mergeState: 'BEHIND',
      }),
    ),
  ] as const;

  const issues: readonly IssueFacts[] = [
    issue(3790, {
      title: 'Rebuild PR Manager from its specification',
      labels: [L.A, L.inProgress],
      updatedAt: ago(5),
      comments: Result.ok([
        {
          id: 10,
          body: writeIssueClaimComment(
            {
              state: 'started',
              by: 'https://claude.ai/code/session_demo1',
              at: ago(60 * 30),
            },
            'Started.',
          ),
          createdAt: ago(60 * 30),
        },
      ]),
    }),
    issue(3791, {
      title: 'Draw the issue graph left to right',
      labels: [L.B],
      body: 'Start-After: #3790',
      updatedAt: ago(50),
    }),
    issue(3792, {
      title: 'Activity dialog: count by the reader’s time zone',
      labels: [L.C],
      body: 'Start-After: #3791',
      updatedAt: ago(120),
    }),
    issue(3793, {
      title: 'Queue: mark a bypass with the reason',
      labels: [L.S, L.planned],
      updatedAt: ago(8),
      comments: Result.ok([
        {
          id: 11,
          body: writeIssueClaimComment(
            { state: 'planned', by: 'noshiro-pf', at: ago(90) },
            'Planned.',
          ),
          createdAt: ago(90),
        },
      ]),
    }),
    issue(3794, {
      title: 'Split view: open the session too',
      labels: [L.D],
      updatedAt: ago(300),
    }),
    issue(3795, {
      title: 'A question nobody has answered',
      labels: [L.hold],
      updatedAt: ago(900),
    }),
    issue(3796, {
      title: 'Phone width: the queue map overlaps',
      labels: [L.B, L.bug],
      updatedAt: ago(30),
    }),
    issue(3797, {
      title: 'Document the poll pacing',
      labels: [],
      updatedAt: ago(2000),
    }),
  ] as const;

  const merged: readonly MergedPullRequestFacts[] = [
    mergedPull(
      3780,
      'feat(pr-report-core-v2): add the GraphQL reader',
      ago(60 * 20),
      [3770],
    ),
    mergedPull(
      3778,
      'docs(synstate-next-docs): add a benchmark page',
      ago(60 * 26),
      [],
    ),
    mergedPull(
      3771,
      'fix(unblock-prs): keep the claim through a rebase',
      ago(60 * 50),
      [],
    ),
  ] as const;

  return snapshot([...pulls, ...queueTail], issues, {
    readAt: instantOf(nowMs),
    repository: {
      repo: { owner: 'noshiro-pf', name: 'mono' },
      defaultBranch: 'main',
      defaultBranchTip: TIP,
      viewer: Result.ok('noshiro-pf'),
      codeOwners: Result.ok(
        '/.github/ @someone-else\n/.github/actions/ @noshiro-pf\n',
      ),
      hasQueueLabel: Result.ok(true),
    },
    requirements: Result.ok({
      requiredContexts: [REQUIRED],
      requireCodeOwnerReview: true,
      requireConversationResolution: false,
    }),
    merged: Result.ok(merged),
    queueLayers: Result.ok([
      {
        branch: 'queue/pr-3832',
        origin: { number: 3832, builtFromHead: shaOf(3832) },
        sha: 'a'.repeat(40),
        tree: 'b'.repeat(40),
        parentTree: 'c'.repeat(40),
        committedAt: ago(4),
        checks: Result.ok(checks(3832, 'running')),
      },
    ]),
  });
};

const demoRuns = (nowMs: number): readonly RunningWorkflow[] =>
  [
    {
      id: 1,
      title: 'feat(pr-manager-v2): draw the queue',
      workflow: 'code-check',
      runNumber: 9120,
      event: 'pull_request',
      branch: 'claude/queue',
      status: 'in_progress',
      startedAt: instantOf(nowMs - 4 * 60_000),
      actor: 'noshiro-pf',
      url: 'https://github.com/noshiro-pf/mono/actions',
    },
    {
      id: 2,
      title: 'chore: update pnpm',
      workflow: 'pnpm-update',
      runNumber: 311,
      event: 'schedule',
      branch: 'main',
      status: 'queued',
      startedAt: instantOf(nowMs - 60_000),
      actor: 'github-actions',
      url: 'https://github.com/noshiro-pf/mono/actions',
    },
  ] as const;
