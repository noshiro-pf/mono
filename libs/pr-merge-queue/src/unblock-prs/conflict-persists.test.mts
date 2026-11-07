import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import { git } from '../lib/index.mjs';
import type { RegenerateConfig } from './config.mjs';
import {
  conflictsOnTip,
  stillConflicted,
  whetherConflictStays,
} from './conflict-persists.mjs';
import type { OwnSetAsideComment, PullRequest } from './types.mjs';

describe(conflictsOnTip, () => {
  test('names the files one commit still conflicts in', async () => {
    const dir = await repo([
      String.raw`printf 'pr\n' > a.txt && git commit --quiet -am pr`,
      'git checkout --quiet main',
      String.raw`printf 'main\n' > a.txt && git commit --quiet -am main`,
    ]);

    assert.deepStrictEqual(
      await conflictsOnTip('main', 'pr', dir),
      Result.ok(['a.txt']),
    );
  });

  test('answers nothing once the other side has left the tip', async () => {
    const dir = await repo([
      String.raw`printf 'pr\n' > a.txt && git commit --quiet -am pr`,
      'git checkout --quiet main',
      String.raw`printf 'main\n' > a.txt && git commit --quiet -am main`,
      'git revert --no-edit HEAD',
    ]);

    assert.deepStrictEqual(
      await conflictsOnTip('main', 'pr', dir),
      Result.ok([]),
    );
  });

  test('replays each commit on the one before it, as a rebase does', async () => {
    // The second commit conflicts with main only on top of the first.
    const dir = await repo([
      String.raw`printf 'pr\n' > b.txt && git add b.txt && git commit --quiet -m first`,
      String.raw`printf 'pr2\n' > a.txt && git commit --quiet -am second`,
      'git checkout --quiet main',
      String.raw`printf 'main\n' > a.txt && git commit --quiet -am main`,
    ]);

    assert.deepStrictEqual(
      await conflictsOnTip('main', 'pr', dir),
      Result.ok(['a.txt']),
    );
  });

  test('skips a commit whose patch the tip already has, as a rebase does', async () => {
    // A merge conflicts here, because main reworded the file afterwards.
    const dir = await repo([
      String.raw`printf 'pr\n' > a.txt && git commit --quiet -am pr`,
      'git checkout --quiet main',
      String.raw`printf 'pr\n' > a.txt && git commit --quiet -am same-patch`,
      String.raw`printf 'later\n' > a.txt && git commit --quiet -am later`,
    ]);

    assert.deepStrictEqual(
      await conflictsOnTip('main', 'pr', dir),
      Result.ok([]),
    );
  });

  test('fails on what git cannot read, rather than answering nothing', async () => {
    const dir = await repo([]);

    assert.isTrue(
      Result.isErr(await conflictsOnTip('main', 'no-such-branch', dir)),
    );
  });
});

describe(whetherConflictStays, () => {
  const config: RegenerateConfig = {
    before: [],
    generators: [{ path: /^gen\.txt$/u, run: 'pnpm run gen' }],
  } as const;

  test('stays on a conflict, with nothing configured to resolve it', () => {
    assert.isTrue(whetherConflictStays(['a.txt'], undefined));

    assert.isTrue(whetherConflictStays(['a.txt', 'gen.txt'], config));
  });

  test('goes once there is no conflict', () => {
    assert.isFalse(whetherConflictStays([], undefined));

    assert.isFalse(whetherConflictStays([], config));
  });

  test('goes when the worker can write every conflicted file again itself', () => {
    assert.isFalse(whetherConflictStays(['gen.txt'], config));
  });
});

describe(stillConflicted, () => {
  const pr: PullRequest = {
    number: 7,
    id: 'PR_7',
    title: 'pull request #7',
    body: '',
    state: 'OPEN',
    headRefName: 'feature/7',
    headRefOid: HEAD,
    baseRefName: 'main',
    isCrossRepository: false,
    isDraft: false,
    mergeStateStatus: 'DIRTY',
    autoMergeRequest: {},
    labels: [{ name: 'merge-queued' }],
  } as const;

  const read = async (
    comment: OwnSetAsideComment,
    pullRequest: PullRequest = pr,
    conflicts: Result<readonly string[], string> = Result.ok(['a.txt']),
  ): Promise<readonly (readonly [number, readonly string[]])[]> => {
    const found = await stillConflicted({
      comments: new Map<number, OwnSetAsideComment>([[7, comment]]),
      pullRequests: [pullRequest],
      baseSha: MOVED,
      defaultBranch: 'main',
      regenerate: undefined,
      fetchLatest: () => Promise.resolve(Result.ok(undefined)),
      conflicts: () => Promise.resolve(conflicts),
      log: () => {},
    });

    return Array.from(found);
  };

  test('names a rebase-failed comment on a moved base that still conflicts', async () => {
    assert.deepStrictEqual(await read(standing()), [[7, ['a.txt']]]);
  });

  test('leaves out one whose conflict is gone, or cannot be told', async () => {
    assert.deepStrictEqual(await read(standing(), pr, Result.ok([])), []);

    assert.deepStrictEqual(
      await read(standing(), pr, Result.err('no such object')),
      [],
    );
  });

  test('asks nothing of what a base move would not end, or a retry ends', async () => {
    assert.deepStrictEqual(await read(standing({ baseSha: MOVED })), []);

    assert.deepStrictEqual(await read(standing({ reason: 'push-failed' })), []);

    assert.deepStrictEqual(await read(standing({ headSha: OTHER })), []);

    assert.deepStrictEqual(await read(standing({}, true)), []);
  });

  test('asks nothing of a stacked layer: the worker carries it along', async () => {
    assert.deepStrictEqual(
      await read(standing(), { ...pr, baseRefName: 'feature/6' }),
      [],
    );
  });

  test('a fetch that fails tells nothing, for every comment', async () => {
    const found = await stillConflicted({
      comments: new Map<number, OwnSetAsideComment>([[7, standing()]]),
      pullRequests: [pr],
      baseSha: MOVED,
      defaultBranch: 'main',
      regenerate: undefined,
      fetchLatest: () => Promise.resolve(Result.err('network')),
      conflicts: () => Promise.resolve(Result.ok(['a.txt'])),
      log: () => {},
    });

    assert.strictEqual(found.size, 0);
  });
});

const HEAD = 'c'.repeat(40);

const BASE = 'a'.repeat(40);

const MOVED = 'b'.repeat(40);

const OTHER = 'd'.repeat(40);

const standing = (
  fields: Partial<
    Readonly<{ reason: string; headSha: string; baseSha: string }>
  > = {},
  retry = false,
): OwnSetAsideComment =>
  ({
    databaseId: 107,
    says: {
      kind: 'standing',
      setAside: {
        reason: 'rebase-failed',
        headSha: HEAD,
        baseSha: BASE,
        ...fields,
      },
      retry,
    },
    body: '',
  }) as const;

/** A repository with `a.txt` on `main`, on branch `pr`, after `steps`. */
const repo = async (steps: readonly string[]): Promise<string> => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'conflict-persists-'));

  for (const step of [
    'git init --quiet --initial-branch=main',
    'git config user.email t@example.com && git config user.name t',
    String.raw`printf 'a\n' > a.txt && git add --all && git commit --quiet -m base`,
    'git checkout --quiet -b pr',
    ...steps,
  ]) {
    assert.isTrue(Result.isOk(await git(step, dir)));
  }

  return dir;
};
