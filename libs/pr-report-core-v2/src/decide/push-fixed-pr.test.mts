import { Result } from 'ts-data-forge';
import { skipped } from '../read/index.mjs';
import {
  decidePushFixedPr,
  type PushFixedPrFacts,
  type PushFixedPrPullRequest,
} from './push-fixed-pr.mjs';
import type { QueueComments } from './set-aside.mjs';

const HEAD = 'c'.repeat(40);

const FIX = 'f'.repeat(40);

const BASE = 'e'.repeat(40);

const claimed = (by: string, applies = true): QueueComments['claim'] =>
  ({
    commentId: 2,
    says: {
      kind: 'standing',
      claim: { headSha: HEAD, by, at: '2026-11-10T00:00:00Z' },
    },
    applies,
  }) as const;

const setAside = (reason: string): QueueComments['setAside'] =>
  ({
    commentId: 1,
    says: {
      kind: 'standing',
      record: { reason, headSha: HEAD, baseSha: BASE },
      retry: false,
    },
    applies: true,
  }) as const;

const pr = (
  number: number,
  fields: Partial<
    Readonly<{
      owner: PushFixedPrPullRequest<PushFixedPrFacts>['owner'];
      comments: Partial<QueueComments>;
      stackedOn: number;
      facts: Partial<PushFixedPrFacts>;
    }>
  > = {},
): PushFixedPrPullRequest<PushFixedPrFacts> =>
  ({
    facts: {
      number,
      headRef: `feature/${number}`,
      headSha: HEAD,
      fromFork: false,
      labels: [{ name: 'skip-ci', color: '', description: '' }],
      ...fields.facts,
    },
    owner:
      fields.owner ??
      Result.ok({ owner: 'skill', reason: 'set aside: checks-failed' }),
    comments: Result.ok({
      setAside: setAside('checks-failed'),
      claim: claimed('me'),
      ...fields.comments,
    }),
    stackedOn: fields.stackedOn,
  }) as const;

const ASK = { number: 1, by: 'me', head: FIX, generated: [] } as const;

describe(decidePushFixedPr, () => {
  test('pushes a claimed fix and carries the layers above, but one a claim holds on, its own included', () => {
    const decided = decidePushFixedPr(
      [
        pr(1),
        pr(2, { stackedOn: 1, comments: { claim: undefined } }),
        pr(3, { stackedOn: 1, comments: { claim: claimed('them') } }),
        pr(4, { stackedOn: 2, comments: { claim: claimed('them', false) } }),
        pr(5, { stackedOn: 4, comments: { claim: claimed('me') } }),
        {
          ...pr(6, { stackedOn: 2 }),
          comments: Result.err(skipped('comments', 'not read')),
        },
      ],
      ASK,
    );

    assert.isTrue(decided.kind === 'push');

    assert.deepStrictEqual(
      [
        decided.pr.number,
        decided.addSkipCi,
        decided.layers.map(({ number }) => number),
        decided.claimed.map(({ layer, by }) => [layer.number, by]),
        decided.unread.map(({ number }) => number),
      ],
      [
        1,
        false,
        [2, 4],
        [
          [3, 'them'],
          [5, 'me'],
        ],
        [6],
      ],
    );
  });

  test('puts skip-ci on first when it is off', () => {
    const decided = decidePushFixedPr([pr(1, { facts: { labels: [] } })], ASK);

    assert.isTrue(decided.kind === 'push' && decided.addSkipCi);
  });

  test.each([
    ['one not open', [pr(2)], 'it is not open'],
    [
      "the worker's",
      [
        pr(1, {
          owner: Result.ok({ owner: 'worker', reason: 'in the queue' }),
        }),
      ],
      "it is the worker's (in the queue), not a skill's",
    ],
    [
      'one whose owner is unread',
      [pr(1, { owner: Result.err(skipped('owner', 'not read')) })],
      'who owns it could not be read (owner: not read)',
    ],
    [
      'one claimed by someone else',
      [pr(1, { comments: { claim: claimed('them') } })],
      'me holds no claim on it at its head; claim it first (claim-pr)',
    ],
    [
      'one whose claim lapsed',
      [pr(1, { comments: { claim: claimed('me', false) } })],
      'me holds no claim on it at its head; claim it first (claim-pr)',
    ],
    [
      'its own head',
      [pr(1, { facts: { headSha: FIX } })],
      `${FIX} is already its head`,
    ],
    [
      "a fork's",
      [pr(1, { facts: { fromFork: true } })],
      'its branch is in a fork',
    ],
  ] as const)('refuses %s', (_, pullRequests, reason) => {
    assert.deepStrictEqual(decidePushFixedPr(pullRequests, ASK), {
      kind: 'refuse',
      reason,
    });
  });

  test('refuses a conflict on a generated branch resolved by hand, naming its rebuild', () => {
    const generated = [
      { branch: 'feature/1', rebuild: 'pnpm run rebuild-deps' },
    ] as const;

    assert.deepStrictEqual(
      decidePushFixedPr(
        [pr(1, { comments: { setAside: setAside('rebase-failed') } })],
        { ...ASK, generated },
      ),
      {
        kind: 'refuse',
        reason:
          'feature/1 is generated, so a conflict on it is resolved by building it again: pnpm run rebuild-deps',
      },
    );

    // A failing check on it is fixed and pushed as any other.
    assert.strictEqual(
      decidePushFixedPr([pr(1)], { ...ASK, generated }).kind,
      'push',
    );
  });
});
