import {
  BLOCKS_RELEASE_LABEL,
  MERGE_QUEUED_LABEL,
  PRIORITY_HIGH_LABEL,
  PRIORITY_LOW_LABEL,
  PRIORITY_MID_LABEL,
  SKIP_CI_LABEL,
  writeClaimComment,
  writeSetAsideComment,
  type ChecksSummary,
  type ContextState,
  type ReportEntry,
} from 'pr-report-core';
import { queueViewOf, type QueuePull, type QueueView } from './queue-view.mjs';

describe(queueViewOf, () => {
  test('leaves out what never asked to be queued', () => {
    assert.deepStrictEqual(
      shape(queueViewOf(input([pull(1, { labels: [] })]))),
      { slots: [], outside: [] },
    );
  });

  test('puts the running one first, then the candidates in the order the worker picks them', () => {
    const view = queueViewOf(
      input([
        pull(1, { labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL] }),
        pull(2, { labels: [MERGE_QUEUED_LABEL], verdict: 'pending' }),
        pull(3, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL, PRIORITY_HIGH_LABEL],
        }),
        pull(4, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          mergeable: 'CONFLICTING',
        }),
      ]),
    );

    assert.deepStrictEqual(shape(view).slots, [
      [2, 'running', undefined],
      [3, 'next', undefined],
      [1, 'next', undefined],
      [4, 'next', 'conflicts'],
    ]);
  });

  test('takes one behind its base as a candidate, and one up to date with a failed check as failing', () => {
    const view = queueViewOf(
      input([
        pull(1, { labels: [MERGE_QUEUED_LABEL], behindBy: 2 }),
        pull(2, { labels: [MERGE_QUEUED_LABEL], verdict: 'failing' }),
      ]),
    );

    assert.deepStrictEqual(shape(view).slots, [
      [1, 'next', undefined],
      [2, 'failing', 'failing'],
    ]);
  });

  test('puts what waits for another pull request after the candidates, saying what for', () => {
    const view = queueViewOf(
      input([
        pull(1, { labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL] }),
        pull(2, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          body: 'Merge-After: #1',
        }),
        pull(3, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          baseRef: 'branch-1',
        }),
      ]),
    );

    assert.deepStrictEqual(shape(view).slots, [
      [1, 'next', undefined],
      [2, 'waiting', 'after #1'],
      [3, 'waiting', 'after #1'],
    ]);
  });

  test('marks the release, and holds it for what blocks it', () => {
    const release = pull(1, {
      labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
      headRef: 'changeset-release/main',
    });

    assert.deepStrictEqual(shape(queueViewOf(input([release]))).slots, [
      [1, 'next', 'release'],
    ]);

    assert.deepStrictEqual(
      shape(
        queueViewOf(
          input([release, pull(2, { labels: [BLOCKS_RELEASE_LABEL] })]),
        ),
      ).slots,
      [[1, 'waiting', 'after #2']],
    );

    assert.deepStrictEqual(
      shape(queueViewOf(input([{ ...release, behindBy: 1 }]))).slots,
      [[1, 'waiting', 'rebuilding']],
    );
  });

  test('holds one its review holds', () => {
    const view = queueViewOf(
      input(
        [
          pull(1, {
            labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
            unresolvedConversations: 1,
          }),
        ],
        { requireConversationResolution: true },
      ),
    );

    assert.deepStrictEqual(
      view.slots.map(({ kind, note, detail }) => [kind, note, detail]),
      [['waiting', 'review', '1 unresolved review conversation']],
    );
  });

  test('passes over one in a native stack', () => {
    assert.deepStrictEqual(
      shape(
        queueViewOf(
          input([
            pull(1, {
              labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
              autoMerge: false,
              nativeStack: { stack: 9, position: 1, size: 2 },
            }),
          ]),
        ),
      ).slots,
      [[1, 'waiting', 'native stack']],
    );
  });

  test('puts what is set aside, claimed or a draft outside the queue, with whose it is', () => {
    const view = queueViewOf(
      input([
        pull(1, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          comments: [
            writeSetAsideComment(
              { reason: 'rebase-failed', headSha: sha(1), baseSha: BASE_TIP },
              'Conflicts.',
            ),
          ],
        }),
        pull(2, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          comments: [
            writeSetAsideComment(
              {
                reason: 'awaiting-bypass',
                headSha: sha(2),
                baseSha: OLDER_BASE,
              },
              'Green.',
            ),
          ],
        }),
        pull(3, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          comments: [
            writeClaimComment(
              {
                headSha: sha(3),
                by: 'https://claude.ai/code/session_1',
                at: NOW_ISO,
              },
              'Fixing it.',
            ),
          ],
        }),
        pull(4, { labels: [MERGE_QUEUED_LABEL], isDraft: true }),
      ]),
    );

    assert.deepStrictEqual(
      view.outside.map(({ number, reason, owner }) => [number, reason, owner]),
      [
        [1, 'conflict', 'skill'],
        [2, 'bypass', 'you'],
        [3, 'claimed', 'skill'],
        [4, 'draft', 'you'],
      ],
    );

    assert.deepStrictEqual(view.slots, []);
  });

  // A conflict recorded against a base that has since moved is the worker's
  // to try again, as its next survey does.
  test('takes back one set aside for a reason the base moved under', () => {
    const view = queueViewOf(
      input([
        pull(1, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
          comments: [
            writeSetAsideComment(
              { reason: 'rebase-failed', headSha: sha(1), baseSha: OLDER_BASE },
              'Conflicts.',
            ),
          ],
        }),
      ]),
    );

    assert.deepStrictEqual(shape(view), {
      slots: [[1, 'next', undefined]],
      outside: [],
    });
  });

  test('reads every priority label for its pill, mid included', () => {
    const view = queueViewOf(
      input([
        pull(1, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL, PRIORITY_MID_LABEL],
        }),
        pull(2, {
          labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL, PRIORITY_LOW_LABEL],
        }),
      ]),
    );

    assert.deepStrictEqual(
      view.slots.map(({ number, priority }) => [number, priority]),
      [
        [1, 'mid'],
        [2, 'low'],
      ],
    );
  });
});

/** Each slot as number, kind and note; each node outside as number. */
const shape = (
  view: QueueView,
): Readonly<{
  slots: readonly (readonly [number, string, string | undefined])[];
  outside: readonly number[];
}> =>
  ({
    slots: view.slots.map(({ number, kind, note }) => [number, kind, note]),
    outside: view.outside.map(({ number }) => number),
  }) as const;

const BASE_TIP = 'b'.repeat(40);

const OLDER_BASE = 'a'.repeat(40);

/** A head, as the 40 hexadecimal digits the comments' records insist on. */
const sha = (number: number): string => number.toString(16).padStart(40, '0');

const NOW_ISO = '2026-10-16T00:00:00Z';

/** {@link NOW_ISO}, in milliseconds. */
const NOW_MS = 1_792_108_800_000;

const entry = (fields: PullFields): ReportEntry =>
  ({
    number: fields.number,
    title: `Pull request ${fields.number}`,
    body: fields.body,
    author: 'someone',
    isDraft: fields.isDraft,
    labels: fields.labels.map((labelName) => ({
      name: labelName,
      color: 'ededed',
      description: '',
    })),
    autoMerge: fields.autoMerge,
    headRef: fields.headRef,
    headSha: sha(fields.number),
    baseRef: fields.baseRef,
    fromFork: false,
    url: `https://github.com/noshiro-pf/mono/pull/${fields.number}`,
    updatedAt: NOW_ISO,
    headCommittedAt: undefined,
    comparison: { aheadBy: 1, behindBy: fields.behindBy },
    reported: new Map<string, ContextState>(),
    checksRunning: false,
    linkedIssues: [],
    mergeAfter: [],
    stackedOn: undefined,
    inheritedMergeAfter: [],
    notStartedIssues: [],
    blockedBy: [],
    checks: {
      verdict: fields.verdict,
      passed: [],
      failed: [],
      pending: [],
      skipped: [],
      missing: [],
      notRun: [],
      required: 0,
    },
  }) as const;

const queuePull = (fields: PullFields): QueuePull =>
  ({
    entry: entry(fields),
    baseTip: BASE_TIP,
    mergeable: fields.mergeable,
    nativeStack: fields.nativeStack,
    review: {
      author: 'someone',
      approvers: [],
      files: [],
      filesComplete: true,
      unresolvedConversations: fields.unresolvedConversations,
    },
    ownComments: fields.comments,
  }) as const;

const input = (
  pulls: readonly PullFields[],
  rules: Partial<Parameters<typeof queueViewOf>[0]['rules']> = {},
): Parameters<typeof queueViewOf>[0] =>
  ({
    defaultBranch: 'main',
    nowEpochMs: NOW_MS,
    rules: {
      requireCodeOwnerReview: false,
      requireConversationResolution: false,
      codeOwners: [],
      ...rules,
    },
    pulls: pulls.map(queuePull),
  }) as const;

type PullFields = Readonly<{
  number: number;
  labels: readonly string[];
  isDraft: boolean;
  body: string;
  headRef: string;
  baseRef: string;
  autoMerge: boolean;
  verdict: ChecksSummary['verdict'];
  behindBy: number;
  mergeable: string;
  nativeStack: QueuePull['nativeStack'];
  unresolvedConversations: number;
  comments: readonly string[];
}>;

const pull = (number: number, fields: Partial<PullFields> = {}): PullFields =>
  ({
    number,
    labels: [MERGE_QUEUED_LABEL],
    isDraft: false,
    body: '',
    headRef: `branch-${number}`,
    baseRef: 'main',
    autoMerge: true,
    verdict: 'passed',
    behindBy: 0,
    mergeable: 'MERGEABLE',
    nativeStack: undefined,
    unresolvedConversations: 0,
    comments: [],
    ...fields,
  }) as const;
