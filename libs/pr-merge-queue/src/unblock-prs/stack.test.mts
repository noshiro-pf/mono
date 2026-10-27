// cspell:ignore retarget retargeted

import type { Claim, QueueOwner } from 'pr-report-core';
import { Arr } from 'ts-data-forge';
import { ownerOf } from './owner.mjs';
import {
  autoRebaseTargets,
  nativeStackNote,
  restackable,
  retargetedFrom,
  retargetedLayers,
  stackedNote,
  stackedOnAfter,
  stackParentsOf,
} from './stack.mjs';
import type {
  BaseChange,
  PullRequest,
  SkipRecord,
  TriageContext,
} from './types.mjs';

const NOW = Date.parse('2026-10-15T00:30:00Z');

const pullRequest = (
  fields: Partial<PullRequest> & Readonly<{ number: number }>,
): PullRequest =>
  ({
    id: `PR_${fields.number}`,
    title: `pull request #${fields.number}`,
    body: '',
    state: 'OPEN',
    headRefName: `feature/${fields.number}`,
    headRefOid: 'a'.repeat(40),
    baseRefName: 'main',
    isCrossRepository: false,
    isDraft: false,
    mergeStateStatus: 'BLOCKED',
    autoMergeRequest: null,
    labels: [],
    ...fields,
  }) as const;

const context = (
  stackParents: ReadonlyMap<number, number>,
  cyclic: ReadonlySet<number> = new Set<number>(),
): TriageContext =>
  ({
    defaultBranch: 'main',
    baseSha: 'b'.repeat(40),
    skipped: new Map<number, SkipRecord>(),
    claimed: new Map<number, Claim>(),
    owners: new Map<number, QueueOwner>(),
    demoted: new Map<number, string>(),
    requiredContexts: [],
    issueOrder: {
      closes: new Map<number, readonly number[]>(),
      startAfter: new Map<number, readonly number[]>(),
    },
    reviewRequirements: {
      requireCodeOwnerReview: false,
      requireConversationResolution: false,
    },
    openNumbers: new Set<number>(),
    dependencies: new Map<number, readonly number[]>(),
    inherited: new Map<number, readonly number[]>(),
    stackParents,
    cycles: [],
    cyclic,
    releaseBlockers: [],
  }) as const;

const retarget = (from: string, to = 'main'): BaseChange =>
  ({ from, to }) as const;

describe(retargetedFrom, () => {
  test('names the branch the last change of base moved it off', () => {
    assert.strictEqual(
      retargetedFrom([retarget('feature/1')], 'main'),
      'feature/1',
    );
  });

  test('is nothing for a pull request that never changed base', () => {
    assert.isUndefined(retargetedFrom([], 'main'));
  });

  test('is nothing when the last change was away from the default branch', () => {
    assert.isUndefined(
      retargetedFrom(
        [retarget('feature/1'), retarget('main', 'feature/2')],
        'main',
      ),
    );
  });

  test('reads the last change of base, not the first', () => {
    assert.strictEqual(
      retargetedFrom(
        [retarget('feature/1', 'feature/2'), retarget('feature/2')],
        'main',
      ),
      'feature/2',
    );
  });
});

describe(stackedNote, () => {
  test('says which layer it waits for', () => {
    assert.deepStrictEqual(
      stackedNote(
        pullRequest({ number: 2 }),
        1,
        context(new Map<number, number>([[2, 1]])),
      ),
      {
        kind: 'note',
        note: '#2: stacked on #1, which merges first',
      },
    );
  });

  test('says when the stack loops back on itself', () => {
    const note = stackedNote(
      pullRequest({ number: 2 }),
      1,
      context(
        new Map<number, number>([
          [2, 1],
          [1, 2],
        ]),
        new Set<number>([1, 2]),
      ),
    );

    assert.isTrue(note.kind === 'note' && note.note.includes('cycle'));
  });
});

describe(restackable, () => {
  test('keeps a layer this repository can push to', () => {
    assert.isUndefined(restackable(pullRequest({ number: 2 })));
  });

  test("refuses a fork's branch", () => {
    assert.isDefined(
      restackable(pullRequest({ number: 2, isCrossRepository: true })),
    );
  });

  test('refuses a branch name it will not pass to a shell', () => {
    assert.isDefined(
      restackable(pullRequest({ number: 2, headRefName: "it's" })),
    );
  });

  test('refuses one that is not open', () => {
    assert.isDefined(restackable(pullRequest({ number: 2, state: 'CLOSED' })));
  });
});

describe(nativeStackNote, () => {
  test('says why one in a native stack is not armed, and what to do', () => {
    // GitHub keeps the layer in the stack after the one below it merged and
    // it was moved onto `main`, and refuses auto-merge for as long.
    assert.deepStrictEqual(
      nativeStackNote(pullRequest({ number: 2 }), {
        stack: 3,
        position: 2,
        size: 2,
      }),
      {
        kind: 'note',
        note: "#2: layer 2 of 2 of GitHub's native stack #3, on which GitHub refuses auto-merge; merge it by hand (a stack made by the base alone needs no native stack)",
      },
    );
  });
});

describe(stackParentsOf, () => {
  test('reads which open pull request each layer is on from the bases', () => {
    assert.deepStrictEqual(
      stackParentsOf(
        [
          pullRequest({ number: 1 }),
          pullRequest({ number: 2, baseRefName: 'feature/1' }),
          pullRequest({ number: 3, baseRefName: 'feature/2' }),
        ],
        'main',
      ),
      new Map<number, number>([
        [2, 1],
        [3, 2],
      ]),
    );
  });
});

describe(stackedOnAfter, () => {
  test('remembers the branch each layer is stacked on', () => {
    const pulls = [
      pullRequest({ number: 1 }),
      pullRequest({ number: 2, baseRefName: 'feature/1' }),
    ] as const;

    assert.deepStrictEqual(
      stackedOnAfter(undefined, pulls, stackParentsOf(pulls, 'main')),
      new Map<number, string>([[2, 'feature/1']]),
    );
  });

  test('keeps a layer whose parent merged until GitHub moves it', () => {
    // #1 merged and left the open list, and GitHub has not moved #2 yet: the
    // bases no longer make a stack, but #2 has still to come off one.
    const pulls = [
      pullRequest({ number: 2, baseRefName: 'feature/1' }),
    ] as const;

    assert.deepStrictEqual(
      stackedOnAfter(
        new Map<number, string>([[2, 'feature/1']]),
        pulls,
        stackParentsOf(pulls, 'main'),
      ),
      new Map<number, string>([[2, 'feature/1']]),
    );
  });

  test('forgets a layer once it is on another base', () => {
    const pulls = [pullRequest({ number: 2 })] as const;

    assert.deepStrictEqual(
      stackedOnAfter(
        new Map<number, string>([[2, 'feature/1']]),
        pulls,
        stackParentsOf(pulls, 'main'),
      ),
      new Map<number, string>(),
    );
  });

  test('forgets a layer that is no longer open', () => {
    assert.deepStrictEqual(
      stackedOnAfter(
        new Map<number, string>([[2, 'feature/1']]),
        [],
        new Map<number, number>(),
      ),
      new Map<number, string>(),
    );
  });
});

describe(retargetedLayers, () => {
  test('names a layer that was stacked and is now on the default branch', () => {
    const layer = pullRequest({ number: 2 });

    assert.deepStrictEqual(
      retargetedLayers(
        new Map<number, string>([[2, 'feature/1']]),
        [layer],
        'main',
      ),
      [{ pr: layer, from: 'feature/1' }],
    );
  });

  test('is nothing for a layer GitHub has not moved yet', () => {
    assert.deepStrictEqual(
      retargetedLayers(
        new Map<number, string>([[2, 'feature/1']]),
        [pullRequest({ number: 2, baseRefName: 'feature/1' })],
        'main',
      ),
      [],
    );
  });

  test('is nothing for a pull request that was never seen stacked', () => {
    assert.deepStrictEqual(
      retargetedLayers(
        new Map<number, string>(),
        [pullRequest({ number: 2 })],
        'main',
      ),
      [],
    );
  });

  test('before the first survey, offers every pull request on the default branch, with the branch to be read from its timeline', () => {
    const layer = pullRequest({ number: 2 });

    assert.deepStrictEqual(
      retargetedLayers(
        undefined,
        [layer, pullRequest({ number: 3, baseRefName: 'feature/2' })],
        'main',
      ),
      [{ pr: layer, from: undefined }],
    );
  });

  test('leaves a queued pull request to its own rebase when it is picked', () => {
    assert.deepStrictEqual(
      retargetedLayers(
        new Map<number, string>([[2, 'feature/1']]),
        [pullRequest({ number: 2, labels: [{ name: 'merge-queued' }] })],
        'main',
      ),
      [],
    );
  });

  test("leaves a fork's branch and the version pull request alone", () => {
    assert.deepStrictEqual(
      retargetedLayers(
        undefined,
        [
          pullRequest({ number: 2, isCrossRepository: true }),
          pullRequest({ number: 3, headRefName: 'changeset-release/main' }),
        ],
        'main',
      ),
      [],
    );
  });
});

const labelled = (...names: readonly string[]): PullRequest['labels'] =>
  names.map((name) => ({ name }));

const targets = (
  pullRequests: readonly PullRequest[],
  skipped: ReadonlyMap<number, SkipRecord> = new Map<number, SkipRecord>(),
  claimed: ReadonlyMap<number, Claim> = new Map<number, Claim>(),
): readonly number[] =>
  autoRebaseTargets(pullRequests, 'main', {
    owners: new Map(
      Arr.generate(function* () {
        for (const pr of pullRequests) {
          const owner = ownerOf(pr, {
            defaultBranch: 'main',
            skipped,
            claimed,
            stackParents: new Map<number, number>(),
            cyclic: new Set<number>(),
            nowEpochMs: NOW,
          });

          if (owner !== undefined) {
            yield [pr.number, owner] as const;
          }
        }
      }),
    ),
  }).map((pr) => pr.number);

describe(autoRebaseTargets, () => {
  test('takes a paused pull request labelled auto-rebase, and a paused queued one', () => {
    assert.deepStrictEqual(
      targets([
        pullRequest({ number: 1, labels: labelled('skip-ci', 'auto-rebase') }),
        pullRequest({ number: 2, labels: labelled('skip-ci', 'merge-queued') }),
      ]),
      [1, 2],
    );
  });

  test('leaves a paused pull request that asked for neither', () => {
    assert.deepStrictEqual(
      targets([pullRequest({ number: 1, labels: labelled('skip-ci') })]),
      [],
    );
  });

  test('leaves one that skip-ci is not on, since a push would run the matrix', () => {
    assert.deepStrictEqual(
      targets([
        pullRequest({ number: 1, labels: labelled('auto-rebase') }),
        pullRequest({ number: 2, labels: labelled('merge-queued') }),
      ]),
      [],
    );
  });

  test('leaves a draft, a layer, a fork and the version pull request', () => {
    assert.deepStrictEqual(
      targets([
        pullRequest({
          number: 1,
          isDraft: true,
          labels: labelled('skip-ci', 'auto-rebase'),
        }),
        pullRequest({
          number: 2,
          baseRefName: 'feature/1',
          labels: labelled('skip-ci', 'auto-rebase'),
        }),
        pullRequest({
          number: 3,
          isCrossRepository: true,
          labels: labelled('skip-ci', 'auto-rebase'),
        }),
        pullRequest({
          number: 4,
          headRefName: 'changeset-release/main',
          labels: labelled('skip-ci', 'merge-queued'),
        }),
      ]),
      [],
    );
  });

  test('leaves one set aside at its head, whatever the base', () => {
    const given = pullRequest({
      number: 1,
      labels: labelled('skip-ci', 'auto-rebase'),
    });

    assert.deepStrictEqual(
      targets(
        [given],
        new Map<number, SkipRecord>([
          [
            1,
            {
              number: 1,
              headSha: given.headRefOid,
              baseSha: 'b'.repeat(40),
              reason: 'rebase-failed',
              detail: 'conflict',
            },
          ],
        ]),
      ),
      [],
    );
  });

  test('leaves one a session has claimed, until its claim ends', () => {
    assert.deepStrictEqual(
      targets(
        [
          pullRequest({
            number: 1,
            labels: labelled('skip-ci', 'auto-rebase'),
          }),
          pullRequest({
            number: 2,
            labels: labelled('skip-ci', 'auto-rebase'),
          }),
        ],
        new Map<number, SkipRecord>(),
        new Map<number, Claim>([
          [
            1,
            {
              headSha: pullRequest({ number: 1 }).headRefOid,
              by: 'unblock-wren',
              at: '2026-10-15T00:00:00Z',
            },
          ],
        ]),
      ),
      [2],
    );
  });
});
