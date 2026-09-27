// cspell:ignore retarget retargeted

import {
  nativeStackNote,
  restackable,
  retargetedFrom,
  retargetedLayers,
  stackedNote,
  stackedOnAfter,
  stackParentsOf,
} from './stack.mjs';
import {
  type PullRequest,
  type TimelineEvent,
  type TriageContext,
} from './types.mjs';

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
  cyclic: ReadonlySet<number> = new Set(),
): TriageContext =>
  ({
    defaultBranch: 'main',
    baseSha: 'b'.repeat(40),
    skipped: new Map(),
    demoted: new Map(),
    requiredContexts: [],
    reviewRequirements: {
      requireCodeOwnerReview: false,
      requireConversationResolution: false,
    },
    openNumbers: new Set(),
    dependencies: new Map(),
    stackParents,
    cyclic,
    releaseBlockers: [],
  }) as const;

const retarget = (from: string, to = 'main'): TimelineEvent =>
  ({ kind: 'base-changed', from, to }) as const;

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

  test('reads the last change of base, whatever came between', () => {
    assert.strictEqual(
      retargetedFrom(
        [
          retarget('feature/1', 'feature/2'),
          { kind: 'auto-merge-enabled' },
          retarget('feature/2'),
        ],
        'main',
      ),
      'feature/2',
    );
  });
});

describe(stackedNote, () => {
  test('says which layer it waits for', () => {
    assert.deepStrictEqual(
      stackedNote(pullRequest({ number: 2 }), 1, context(new Map([[2, 1]]))),
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
        new Map([
          [2, 1],
          [1, 2],
        ]),
        new Set([1, 2]),
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
  test('is nothing for a pull request in no native stack', () => {
    assert.isUndefined(nativeStackNote(pullRequest({ number: 2 }), undefined));
  });

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
      new Map([
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
      new Map([[2, 'feature/1']]),
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
        new Map([[2, 'feature/1']]),
        pulls,
        stackParentsOf(pulls, 'main'),
      ),
      new Map([[2, 'feature/1']]),
    );
  });

  test('forgets a layer once it is on another base', () => {
    const pulls = [pullRequest({ number: 2 })] as const;

    assert.deepStrictEqual(
      stackedOnAfter(
        new Map([[2, 'feature/1']]),
        pulls,
        stackParentsOf(pulls, 'main'),
      ),
      new Map(),
    );
  });

  test('forgets a layer that is no longer open', () => {
    assert.deepStrictEqual(
      stackedOnAfter(new Map([[2, 'feature/1']]), [], new Map()),
      new Map(),
    );
  });
});

describe(retargetedLayers, () => {
  test('names a layer that was stacked and is now on the default branch', () => {
    const layer = pullRequest({ number: 2 });

    assert.deepStrictEqual(
      retargetedLayers(new Map([[2, 'feature/1']]), [layer], 'main'),
      [{ pr: layer, from: 'feature/1' }],
    );
  });

  test('is nothing for a layer GitHub has not moved yet', () => {
    assert.deepStrictEqual(
      retargetedLayers(
        new Map([[2, 'feature/1']]),
        [pullRequest({ number: 2, baseRefName: 'feature/1' })],
        'main',
      ),
      [],
    );
  });

  test('is nothing for a pull request that was never seen stacked', () => {
    assert.deepStrictEqual(
      retargetedLayers(new Map(), [pullRequest({ number: 2 })], 'main'),
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
        new Map([[2, 'feature/1']]),
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
