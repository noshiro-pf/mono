import type {
  ContextState,
  QueueComments,
  QueueOwner,
  ReportEntry,
} from 'pr-report-core';
import { Arr } from 'ts-data-forge';
import { surveyQueue } from './survey.mjs';

const HEAD = 'c'.repeat(40);

const BASE = 'b'.repeat(40);

const entry = (
  number: number,
  headSha: string = HEAD,
  extraLabels: readonly string[] = [],
): ReportEntry =>
  ({
    number,
    title: 'fix: a thing',
    body: '',
    author: 'someone',
    isDraft: false,
    labels: Arr.toUnshifted('merge-queued')(extraLabels).map((name) => ({
      name,
      color: '',
      description: '',
    })),
    autoMerge: false,
    headRef: `fix/${number}`,
    headSha,
    baseRef: 'main',
    fromFork: false,
    url: '',
    updatedAt: '2026-10-15T00:00:00Z',
    headCommittedAt: undefined,
    comparison: undefined,
    reported: new Map<string, ContextState>(),
    checksRunning: false,
    linkedIssues: [],
    mergeAfter: [],
    stackedOn: undefined,
    inheritedMergeAfter: [],
    notStartedIssues: [],
    blockedBy: [],
    checks: {
      verdict: 'failing',
      passed: [],
      failed: [],
      pending: [],
      skipped: [],
      missing: [],
      notRun: [],
      required: 0,
    },
  }) as const;

const setAsideAt = (
  headSha: string,
  reason: string = 'checks-failed',
  baseSha: string = BASE,
): QueueComments =>
  ({
    setAside: {
      commentId: 1,
      says: {
        kind: 'standing',
        setAside: { reason, headSha, baseSha },
        retry: false,
      },
      applies: true,
    },
    claim: undefined,
  }) as const;

const claimedAt = (headSha: string, applies: boolean): QueueComments =>
  ({
    ...setAsideAt(headSha),
    claim: {
      commentId: 2,
      says: {
        kind: 'standing',
        claim: { headSha, by: 'someone-else', at: '2026-10-30T00:00:00Z' },
      },
      applies,
    },
  }) as const;

const skill: QueueOwner = {
  owner: 'skill',
  reason: 'set aside `checks-failed` at its head; the skill fixes it',
} as const;

const state = (
  rows: readonly Readonly<{
    entry: ReportEntry;
    owner: QueueOwner | undefined;
    comments: QueueComments | undefined;
  }>[],
) =>
  ({
    decided: {
      entries: rows.map((row) => row.entry),
      roots: [],
      cycles: [],
    },
    owners: new Map(
      Arr.generate(function* () {
        for (const { entry: e, owner } of rows) {
          if (owner !== undefined) {
            yield [e.number, owner] as const;
          }
        }
      }),
    ),
    queue: new Map(
      Arr.generate(function* () {
        for (const { entry: e, comments } of rows) {
          if (comments !== undefined) {
            yield [e.number, comments] as const;
          }
        }
      }),
    ),
  }) as const;

describe(surveyQueue, () => {
  test('hands the skill what is its own and unclaimed', () => {
    const survey = surveyQueue(
      state([
        { entry: entry(10), owner: skill, comments: setAsideAt(HEAD) },
        {
          entry: entry(11),
          owner: { owner: 'worker', reason: 'in the queue' },
          comments: { setAside: undefined, claim: undefined },
        },
        {
          entry: entry(12),
          owner: { owner: 'human', reason: 'a draft' },
          comments: { setAside: undefined, claim: undefined },
        },
      ]),
      new Set<string>(),
    );

    assert.deepStrictEqual(
      survey.fresh.map(({ number }) => number),
      [10],
    );

    assert.deepStrictEqual(survey.left, []);

    assert.deepStrictEqual(survey.claimed, []);

    assert.deepStrictEqual(survey.unowned, []);
  });

  test('takes them in the order the skill does', () => {
    const survey = surveyQueue(
      state([
        {
          entry: entry(20, HEAD, ['priority:low']),
          owner: skill,
          comments: setAsideAt(HEAD),
        },
        { entry: entry(31), owner: skill, comments: setAsideAt(HEAD) },
        { entry: entry(30), owner: skill, comments: setAsideAt(HEAD) },
        {
          entry: entry(40, HEAD, ['priority:high']),
          owner: skill,
          comments: setAsideAt(HEAD),
        },
      ]),
      new Set<string>(),
    );

    assert.deepStrictEqual(
      survey.fresh.map(({ number }) => number),
      [40, 30, 31, 20],
    );
  });

  test('leaves one someone holds a claim on', () => {
    const survey = surveyQueue(
      state([
        { entry: entry(10), owner: skill, comments: claimedAt(HEAD, true) },
        { entry: entry(11), owner: skill, comments: claimedAt(HEAD, false) },
      ]),
      new Set<string>(),
    );

    assert.deepStrictEqual(
      survey.fresh.map(({ number }) => number),
      [11],
    );

    assert.deepStrictEqual(survey.claimed, [10]);
  });

  test('does not hand an earlier round the same set-aside again', () => {
    const first = surveyQueue(
      state([{ entry: entry(10), owner: skill, comments: setAsideAt(HEAD) }]),
      new Set<string>(),
    );

    const attempted = new Set(first.fresh.map(({ key }) => key));

    const again = surveyQueue(
      state([{ entry: entry(10), owner: skill, comments: setAsideAt(HEAD) }]),
      attempted,
    );

    assert.deepStrictEqual(again.fresh, []);

    assert.deepStrictEqual(
      again.left.map(({ number }) => number),
      [10],
    );
  });

  test('hands it on again once the head or the set-aside moves', () => {
    const attempted = new Set<string>(
      surveyQueue(
        state([{ entry: entry(10), owner: skill, comments: setAsideAt(HEAD) }]),
        new Set<string>(),
      ).fresh.map(({ key }) => key),
    );

    const moved = 'd'.repeat(40);

    const pushed = surveyQueue(
      state([
        {
          entry: entry(10, moved),
          owner: skill,
          comments: setAsideAt(moved),
        },
      ]),
      attempted,
    );

    assert.deepStrictEqual(
      pushed.fresh.map(({ number }) => number),
      [10],
    );

    const rebased = surveyQueue(
      state([
        {
          entry: entry(10),
          owner: skill,
          comments: setAsideAt(HEAD, 'rebase-failed'),
        },
      ]),
      attempted,
    );

    assert.deepStrictEqual(
      rebased.fresh.map(({ number }) => number),
      [10],
    );
  });

  test('does not pay again for the same conflict on a newer base', () => {
    const attempted = new Set<string>(
      surveyQueue(
        state([
          {
            entry: entry(10),
            owner: skill,
            comments: setAsideAt(HEAD, 'rebase-failed'),
          },
        ]),
        new Set<string>(),
      ).fresh.map(({ key }) => key),
    );

    const again = surveyQueue(
      state([
        {
          entry: entry(10),
          owner: skill,
          comments: setAsideAt(HEAD, 'rebase-failed', 'e'.repeat(40)),
        },
      ]),
      attempted,
    );

    assert.deepStrictEqual(again.fresh, []);

    assert.deepStrictEqual(
      again.left.map(({ number }) => number),
      [10],
    );
  });

  test('counts what nobody owns, and skips what has no owner read', () => {
    const survey = surveyQueue(
      state([
        {
          entry: entry(10),
          owner: { owner: 'none', reason: 'set aside for `mystery`' },
          comments: setAsideAt(HEAD, 'mystery'),
        },
        { entry: entry(11), owner: undefined, comments: undefined },
      ]),
      new Set<string>(),
    );

    assert.deepStrictEqual(survey.unowned, [10]);

    assert.deepStrictEqual(survey.fresh, []);
  });
});
