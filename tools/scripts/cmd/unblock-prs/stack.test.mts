// cspell:ignore retarget retargeted

import { restackable, retargetedFrom, stackedNote } from './stack.mjs';
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
    requiredContexts: [],
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
