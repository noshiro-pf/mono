import { RE_RUN_GRACE_MS } from 'pr-report-core';
import {
  latestMergedHead,
  pullRequestOfNode,
  pushersOfPage,
  rerunOf,
  RUN_TIMEOUT_MS,
} from './github.mjs';

describe(pushersOfPage, () => {
  // Newest first, as `readPushers` asks for it.
  test('replays a page oldest first from its last creation', () => {
    assert.deepStrictEqual(
      pushersOfPage(
        [
          entry('push', 'b', 'c', 'helper'),
          entry('force_push', 'a', 'b', 'owner'),
          entry('branch_creation', '0', 'a', 'owner'),
          entry('branch_deletion', 'x', '0', 'stranger'),
        ],
        'c',
      ),
      ['owner', 'helper'],
    );
  });

  test('cannot tell from a page without the creation', () => {
    assert.strictEqual(
      pushersOfPage([entry('push', 'b', 'c', 'owner')], 'c'),
      'unknown',
    );
  });
});

describe(pullRequestOfNode, () => {
  const node = {
    number: 12,
    id: 'PR_kwDO',
    title: 'feat: x',
    body: 'Merge-After: #11',
    state: 'OPEN',
    headRefName: 'feat/x',
    headRefOid: 'a'.repeat(40),
    baseRefName: 'main',
    isCrossRepository: false,
    isDraft: false,
    mergeStateStatus: 'BEHIND',
    autoMergeRequest: null,
    labels: { nodes: [{ name: 'merge-queued' }, { name: 'skip-ci' }] },
  } as const;

  test('flattens the labels to the shape every module here reads', () => {
    assert.deepStrictEqual(pullRequestOfNode(node).labels, [
      { name: 'merge-queued' },
      { name: 'skip-ci' },
    ]);
  });

  test('keeps every other field as GitHub answered it', () => {
    const { labels: _labels, ...rest } = pullRequestOfNode(node);

    const { labels: _nodeLabels, ...expected } = node;

    assert.deepStrictEqual(rest, expected);
  });

  test('keeps an armed auto-merge a record, which is what is read of it', () => {
    const armed = pullRequestOfNode({
      ...node,
      autoMergeRequest: { enabledAt: '2026-10-25T00:00:00Z' },
    });

    assert.deepStrictEqual(armed.autoMergeRequest, {
      enabledAt: '2026-10-25T00:00:00Z',
    });
  });
});

describe(latestMergedHead, () => {
  test('is the pull request merged last, and ignores one closed unmerged', () => {
    assert.deepStrictEqual(
      latestMergedHead([
        pull(1, '2026-10-01T00:00:00Z'),
        pull(3, null),
        pull(2, '2026-10-02T00:00:00Z'),
      ]),
      {
        number: 2,
        headSha: '2'.padStart(40, 'h'),
        mergeCommit: '2'.padStart(40, 'c'),
      },
    );
  });

  test('is undefined when none was merged', () => {
    assert.isUndefined(latestMergedHead([pull(3, null)]));
  });

  test('leaves the merge commit out while GitHub has none', () => {
    assert.isUndefined(
      latestMergedHead([pull(1, '2026-10-01T00:00:00Z', null)])?.mergeCommit,
    );
  });
});

const pull = (
  number: number,
  mergedAt: string | null,
  mergeCommit: string | null = number.toString().padStart(40, 'c'),
): Parameters<typeof latestMergedHead>[0][number] =>
  ({
    number,
    head: { sha: number.toString().padStart(40, 'h') },
    merge_commit_sha: mergeCommit,
    merged_at: mergedAt,
  }) as const;

describe(rerunOf, () => {
  const run = {
    run_attempt: 1,
    status: 'completed',
    run_started_at: '2026-11-01T00:00:00Z',
  } as const;

  const startedMs = Date.parse(run.run_started_at);

  test('re-runs a completed run with re-runs left', () => {
    assert.strictEqual(rerunOf(run, startedMs), 'rerun');

    assert.strictEqual(rerunOf({ ...run, run_attempt: 2 }, startedMs), 'rerun');
  });

  test('re-runs nothing once the budget is spent', () => {
    assert.strictEqual(
      rerunOf({ ...run, run_attempt: 3 }, startedMs),
      'already',
    );
  });

  test('waits for a run that has not completed, within the timeout', () => {
    assert.strictEqual(
      rerunOf({ ...run, status: 'in_progress' }, startedMs + RUN_TIMEOUT_MS),
      'running',
    );
  });

  test('stops waiting for a run past the timeout', () => {
    assert.strictEqual(
      rerunOf({ ...run, status: 'queued' }, startedMs + RUN_TIMEOUT_MS + 1),
      'stuck',
    );
  });

  test('waits for a run whose start GitHub does not give', () => {
    assert.strictEqual(
      rerunOf(
        { ...run, status: null, run_started_at: null },
        startedMs + RUN_TIMEOUT_MS * 2,
      ),
      'running',
    );
  });
});

// A red held back for a re-run, and a re-run waited for before it is called
// stuck, are one wait: two numbers would let the two verdicts drift apart.
describe('RUN_TIMEOUT_MS', () => {
  test('is the grace pr-report-core gives a re-run', () => {
    assert.strictEqual(RUN_TIMEOUT_MS, RE_RUN_GRACE_MS);
  });
});

const entry = (
  activityType: string,
  before: string,
  after: string,
  login: string,
): Parameters<typeof pushersOfPage>[0][number] =>
  ({
    activity_type: activityType,
    before,
    after,
    actor: { login },
  }) as const;
