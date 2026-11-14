// cspell:ignore unstub
import { queueGraph, RE_RUN_GRACE_MS } from 'pr-report-core';
import { Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { ReadonlyRecord } from 'ts-type-forge';
import { parseJson, type ApiContext } from '../lib/index.mjs';
import {
  latestMergedHead,
  listPullRequests,
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

describe(listPullRequests, () => {
  test('reads every page, following the cursor, newest first', async () => {
    const asked = stubOpenPages([[openNode(3), openNode(2)], [openNode(1)]]);

    try {
      const listed = await listPullRequests(LIST_API);

      assert.isTrue(Result.isOk(listed));

      assert.deepStrictEqual(
        listed.value.map(({ number }) => number),
        [3, 2, 1],
      );

      assert.deepStrictEqual(asked, [null, 'c1']);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  test('fails the whole list when a later page cannot be read, rather than give the first pages as the whole', async () => {
    stubOpenPages([[openNode(3), openNode(2)], undefined]);

    try {
      assert.isTrue(Result.isErr(await listPullRequests(LIST_API)));
    } finally {
      vi.unstubAllGlobals();
    }
  });

  // The oldest pull requests are on the last page. Read as the whole, the first
  // page made one there merged: what named it in `Merge-After` went first, and
  // its `blocks-release` no longer held the version pull request.
  test('keeps a pull request on a later page open to the order the queue reads', async () => {
    stubOpenPages([
      [
        openNode(3, { body: 'Merge-After: #1' }),
        openNode(2, { labels: ['merge-queued', 'skip-ci'] }),
      ],
      [openNode(1, { labels: ['merge-queued', 'blocks-release'] })],
    ]);

    try {
      const listed = await listPullRequests(LIST_API);

      assert.isTrue(Result.isOk(listed));

      const graph = queueGraph(
        listed.value.map((pr) => ({
          number: pr.number,
          body: pr.body,
          isDraft: pr.isDraft,
          labels: pr.labels.map(({ name }) => name),
          headRef: pr.headRefName,
          baseRef: pr.baseRefName,
          fromFork: pr.isCrossRepository,
        })),
        'main',
      );

      assert.isTrue(graph.openNumbers.has(1));

      assert.deepStrictEqual(graph.dependencies.get(3), [1]);

      assert.deepStrictEqual(
        graph.releaseBlockers.map(({ number }) => number),
        [1],
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

const LIST_API: ApiContext = {
  repo: { owner: 'noshiro-pf', name: 'mono' },
  token: 'token',
} as const;

/** An open pull request as `listPullRequests`'s query answers it. */
const openNode = (
  number: number,
  overrides: Readonly<{ body?: string; labels?: readonly string[] }> = {},
): ReadonlyRecord<string, unknown> =>
  ({
    number,
    id: `PR_${number.toString()}`,
    title: `pull request ${number.toString()}`,
    body: overrides.body ?? '',
    state: 'OPEN',
    headRefName: `branch-${number.toString()}`,
    headRefOid: 'a'.repeat(40),
    baseRefName: 'main',
    isCrossRepository: false,
    isDraft: false,
    mergeStateStatus: 'BEHIND',
    autoMergeRequest: null,
    labels: {
      nodes: (overrides.labels ?? ['merge-queued']).map((name) => ({ name })),
    },
  }) as const;

/**
 * `fetch` answering the open pull requests in pages, newest first: `pages[0]`
 * for no cursor, `pages[i]` for the cursor `c<i>`, and an error for a page that
 * is `undefined`. Resolves to the cursors asked for, in order.
 */
const stubOpenPages = (
  pages: readonly (readonly ReadonlyRecord<string, unknown>[] | undefined)[],
): readonly (string | null)[] => {
  const cursors = pages.map((_, index) =>
    index === 0 ? null : `c${index.toString()}`,
  );

  const mut_asked: (string | null)[] = [];

  vi.stubGlobal(
    'fetch',
    (_url: string, init?: Readonly<{ body?: unknown }>): Promise<Response> => {
      const sent = parseJson(
        typeof init?.body === 'string' ? init.body : '',
        t.record({
          variables: t.record({ after: t.optional(t.string()) }),
        }),
        'the request',
      );

      const after = Result.isOk(sent)
        ? (sent.value.variables.after ?? null)
        : null;

      mut_asked.push(after);

      const index = cursors.indexOf(after);

      const page = pages[index];

      return Promise.resolve(
        new Response(
          JSON.stringify(
            page === undefined
              ? { errors: [{ message: 'boom' }] }
              : {
                  data: {
                    repository: {
                      pullRequests: {
                        pageInfo: {
                          hasNextPage: index + 1 < pages.length,
                          endCursor: cursors[index + 1] ?? null,
                        },
                        nodes: page,
                      },
                    },
                  },
                },
          ),
          { status: 200 },
        ),
      );
    },
  );

  return mut_asked;
};

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
