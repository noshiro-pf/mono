/**
 * Finding the rebases a merged pull request went through that conflicted:
 * each head it had is cherry-picked onto the base of the head that replaced it,
 * with `git merge-tree --write-tree`, which needs no worktree. A head that
 * moved base and conflicted is a conflict someone resolved, by hand or by
 * regenerating, whether or not `unblock-prs` ever set it aside.
 */

import { git, sh } from 'pr-merge-queue';
import { Arr, Num, Result } from 'ts-data-forge';
import { runFile } from '../../lib/child-process.mjs';
import type { ConflictEvent } from './report.mjs';

/**
 * Fetches whichever of `shas` this clone does not have, by SHA, and resolves to
 * the ones it could not: a head force-pushed over long ago may no longer be
 * served. A chunk that fails is fetched one SHA at a time, so one such head
 * costs only itself; the replay passes over a pair it cannot read.
 */
export const ensureCommits = async (
  shas: readonly string[],
): Promise<readonly string[]> => {
  const present = await Promise.all(
    Arr.uniq(shas).map(async (sha) => ({
      sha,
      present: Result.isOk(await git(`git cat-file -e ${sha}`)),
    })),
  );

  const missing = present.filter((each) => !each.present).map(({ sha }) => sha);

  const mut_unreachable: string[] = [];

  for (const chunk of Arr.chunk(missing, FETCH_CHUNK)) {
    if (Result.isOk(await git(`git fetch --quiet origin ${chunk.join(' ')}`))) {
      continue;
    }

    for (const sha of chunk) {
      if (Result.isErr(await git(`git fetch --quiet origin ${sha}`))) {
        mut_unreachable.push(sha);
      }
    }
  }

  return mut_unreachable;
};

/**
 * The conflicting rebases of pull request `pr`, whose heads were `heads` and
 * which merged as `mergeSha`. Its session is the `Claude-Session:` trailer of
 * the squash commit; a partner is a commit between the two bases that changed a
 * conflicted path, named by the `(#N)` its subject ends with.
 */
export const replayPull = async (
  pr: number,
  heads: readonly string[],
  mergeSha: string,
): Promise<readonly ConflictEvent[]> => {
  const dated = await Promise.all(
    heads.map(async (sha) => ({
      sha,
      at: Result.unwrapOkOr(
        Num.safeParseInt(
          Result.unwrapOkOr(
            await git(`git show -s --format=%ct ${sha}`),
            '0',
          ).trim(),
        ),
        0,
      ),
    })),
  );

  const ordered = dated.toSorted((a, b) => a.at - b.at).map(({ sha }) => sha);

  const session = await sessionOf(mergeSha);

  const mut_events: ConflictEvent[] = [];

  for (const [index, from] of ordered.entries()) {
    const to = ordered[index + 1];

    if (to === undefined) {
      continue;
    }

    const before = await parentOf(from);

    const after = await parentOf(to);

    if (before === undefined || after === undefined || before === after) {
      continue;
    }

    const paths = await conflictsOfPick(before, after, from);

    if (!Arr.isNonEmpty(paths)) {
      continue;
    }

    const partners = await changedBetween(before, after, paths);

    mut_events.push({
      pr,
      paths,
      partners: partners.map(({ number }) => number),
      sameSession:
        session !== undefined &&
        partners.some((partner) => partner.session === session),
    });
  }

  return mut_events;
};

/** How many SHAs one `git fetch` names. */
const FETCH_CHUNK = 32;

const parentOf = async (sha: string): Promise<string | undefined> => {
  const parent = await git(`git rev-parse ${sha}^`);

  return Result.isOk(parent) ? parent.value.trim() : undefined;
};

const sessionOf = async (sha: string): Promise<string | undefined> => {
  const message = await git(`git show -s --format=%B ${sha}`);

  return Result.isOk(message)
    ? SESSION_TRAILER.exec(message.value)?.groups?.['session']
    : undefined;
};

/**
 * The files cherry-picking `commit` (its parent as the merge base) onto `onto`
 * conflicts in. `git merge-tree` exits 1 on a conflict and prints the paths on
 * stdout after the tree id, which a failed `git()` does not keep, so it is run
 * directly: an argument vector, no shell.
 */
const conflictsOfPick = async (
  base: string,
  onto: string,
  commit: string,
): Promise<readonly string[]> => {
  const picked = await runFile(
    'git',
    [
      'merge-tree',
      '--write-tree',
      '--name-only',
      '--no-messages',
      `--merge-base=${base}`,
      onto,
      commit,
    ],
    { maxBuffer: 64 * 1024 * 1024 },
  );

  return picked.status === 1
    ? Arr.uniq(
        Arr.tail(picked.stdout.split('\n')).filter((line) => line !== ''),
      )
    : [];
};

/** The pull requests merged between `before` and `after` that changed `paths`. */
const changedBetween = async (
  before: string,
  after: string,
  paths: readonly string[],
): Promise<
  readonly Readonly<{ number: number; session: string | undefined }>[]
> => {
  const log = await git(
    `git log --format=%H ${before}..${after} -- ${paths.map(sh).join(' ')}`,
  );

  if (Result.isErr(log)) {
    return [];
  }

  const commits = log.value.split('\n').filter((line) => line !== '');

  const found = await Promise.all(
    commits.map(async (sha) => {
      const message = await git(`git show -s --format=%B ${sha}`);

      if (Result.isErr(message)) {
        return undefined;
      }

      const number = SQUASH_SUBJECT.exec(message.value.split('\n', 1)[0] ?? '')
        ?.groups?.['number'];

      return number === undefined
        ? undefined
        : {
            number: Result.unwrapOkOr(Num.safeParseInt(number), 0),
            session: SESSION_TRAILER.exec(message.value)?.groups?.['session'],
          };
    }),
  );

  return found.filter((each) => each !== undefined);
};

const SQUASH_SUBJECT = /\(#(?<number>\d+)\)$/u;

const SESSION_TRAILER = /^Claude-Session: (?<session>\S+)/mu;
