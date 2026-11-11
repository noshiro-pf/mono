// cspell:ignore unlabel
import { Arr, Result } from 'ts-data-forge';
import { skipped } from '../read/index.mjs';
import {
  decideReworkStanding,
  doneSteps,
  isUntouchedSince,
  startSteps,
  uncommittedRefusal,
  type ReworkFacts,
  type ReworkPullRequest,
  type ReworkState,
} from './rework-pr.mjs';
import type { QueueComments } from './set-aside.mjs';

const HEAD = 'c'.repeat(40);

const claimed = (by: string, applies = true): QueueComments['claim'] =>
  ({
    commentId: 2,
    says: {
      kind: 'standing',
      claim: { headSha: HEAD, by, at: '2026-11-10T00:00:00Z' },
    },
    applies,
  }) as const;

const pr = (
  number: number,
  fields: Partial<
    Readonly<{
      owner: ReworkPullRequest<ReworkFacts>['owner'];
      comments: ReworkPullRequest<ReworkFacts>['comments'];
      stackedOn: number;
    }>
  > = {},
): ReworkPullRequest<ReworkFacts> =>
  ({
    facts: { number },
    owner: fields.owner ?? Result.ok({ owner: 'human', reason: 'a draft' }),
    comments:
      fields.comments ??
      Result.ok({ setAside: undefined, claim: undefined } as const),
    stackedOn: fields.stackedOn,
  }) as const;

const STATE: ReworkState = {
  number: 1,
  nodeId: 'PR_1',
  labels: ['skip-ci'],
  isDraft: true,
  isArmed: false,
} as const;

describe(decideReworkStanding, () => {
  test('carries the layers above along, but one a claim holds on or whose comments are unread, and what is on it', () => {
    const standing = decideReworkStanding(
      [
        pr(1),
        pr(2, { stackedOn: 1 }),
        pr(3, {
          stackedOn: 1,
          comments: Result.ok({ setAside: undefined, claim: claimed('them') }),
        }),
        pr(4, {
          stackedOn: 2,
          comments: Result.err(skipped('comments', 'not read')),
        }),
        pr(5, {
          stackedOn: 2,
          comments: Result.ok({
            setAside: undefined,
            claim: claimed('them', false),
          }),
        }),
      ],
      1,
    );

    assert.isTrue(Result.isOk(standing));

    assert.deepStrictEqual(
      [
        standing.value.pr.number,
        standing.value.layers.map(({ number }) => number),
        standing.value.held,
      ],
      [1, [2, 5], [3, 4]],
    );
  });

  test.each([
    [
      'one not in the queue',
      [pr(2)],
      'it is not among the open pull requests the queue reads',
    ],
    [
      'one whose comments are unread',
      [pr(1, { comments: Result.err(skipped('comments', 'not read')) })],
      'its queue comments could not be read (comments: not read), so whether someone has claimed it is not known',
    ],
    [
      'one claimed',
      [
        pr(1, {
          comments: Result.ok({ setAside: undefined, claim: claimed('them') }),
        }),
      ],
      'them claimed it at 2026-11-10T00:00:00Z. A fix under a claim goes through push-fixed-pr; otherwise wait for the claim to end',
    ],
    [
      "a skill's",
      [
        pr(1, {
          owner: Result.ok({ owner: 'skill', reason: 'set aside: x' }),
        }),
      ],
      "it is a skill's (set aside: x). Claim it with claim-pr and hand it back with push-fixed-pr",
    ],
  ] as const)('refuses %s', (_, pullRequests, reason) => {
    assert.deepStrictEqual(
      decideReworkStanding(pullRequests, 1),
      Result.err(reason),
    );
  });
});

describe(startSteps, () => {
  test('holds, dequeues, disarms and drafts, each only when not so already', () => {
    assert.deepStrictEqual(
      [
        startSteps({
          ...STATE,
          labels: ['merge-queued'],
          isDraft: false,
          isArmed: true,
        }),
        startSteps(STATE),
      ],
      [['hold', 'dequeue', 'disarm', 'draft'], []],
    );
  });
});

describe(doneSteps, () => {
  test('pushes, restacks, marks ready, requeues only an untouched record, and forgets any', () => {
    assert.deepStrictEqual(
      [
        doneSteps(STATE, 'requeue', 'untouched', true),
        doneSteps(STATE, 'review', 'untouched', false),
        doneSteps({ ...STATE, isDraft: false }, 'requeue', 'moved', false),
        doneSteps({ ...STATE, isDraft: false }, 'requeue', 'none', false),
      ],
      [
        Result.ok(['push', 'restack', 'ready', 'requeue', 'forget']),
        Result.ok(['push', 'ready', 'forget']),
        Result.ok(['push', 'forget']),
        Result.ok(['push']),
      ],
    );
  });

  test('refuses one not held, saying each way it is not', () => {
    assert.deepStrictEqual(
      doneSteps(
        { ...STATE, labels: ['merge-queued'], isArmed: true },
        'review',
        'none',
        false,
      ),
      Result.err(
        'a push now may go straight into the merge. skip-ci is off: run rework-pr start; merge-queued is on: if the author queued it again, ask them first; otherwise run rework-pr start; auto-merge is armed: run rework-pr start, or, where GraphQL is refused, ask the author to disarm it.',
      ),
    );
  });
});

describe(uncommittedRefusal, () => {
  test('refuses anything git status says', () => {
    assert.deepStrictEqual(
      [uncommittedRefusal(' \n'), uncommittedRefusal('?? a.txt\n')],
      [
        undefined,
        'the working tree has uncommitted changes or untracked files; amend them into the commit, or remove them:\n?? a.txt',
      ],
    );
  });
});

describe(isUntouchedSince, () => {
  test('holds only while the recorded unlabel is the last event', () => {
    const events = [
      { id: 1, event: 'labeled' },
      { id: 2, event: 'unlabeled' },
    ] as const;

    assert.deepStrictEqual(
      [
        isUntouchedSince(events, 2),
        isUntouchedSince(Arr.toPushed(events, { id: 3, event: 'labeled' }), 2),
        isUntouchedSince(events, 1),
        isUntouchedSince([], 2),
      ],
      [true, false, false, false],
    );
  });
});
