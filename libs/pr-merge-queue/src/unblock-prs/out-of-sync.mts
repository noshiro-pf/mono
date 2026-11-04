/**
 * Pull requests whose branch is not at the head GitHub reports for them, and
 * since when.
 *
 * A rebase starts from the head the survey saw and pushes with a lease on it,
 * so a branch found anywhere else is left alone: normally that is someone else
 * — the skill, a person — pushing in the moment between the survey and the
 * rebase, and the loop surveys again rather than pick the next candidate and
 * start a second matrix beside theirs. GitHub takes such a push in within
 * seconds, and the next survey sees it.
 *
 * Sometimes GitHub drops a push instead: the branch moves, and the pull
 * request's head, `refs/pull/<n>/head` and its merge state never follow. Then
 * the next survey picks the same pull request, finds the branch elsewhere
 * again, and surveys again — for as long as it lasts, with nothing behind it in
 * the queue ever moving. So the first sighting is remembered here, and the same
 * mismatch still there {@link OUT_OF_SYNC_GRACE_MS} later sets the pull request
 * aside as `head-out-of-sync`, a person's to clear with a new push.
 * Nothing here pushes to it: the branch holds commits nobody surveyed.
 */

import { Arr } from 'ts-data-forge';
import { isoSeconds } from '../lib/index.mjs';
import { OUT_OF_SYNC_GRACE_MS } from './constants.mjs';
import { isMergeQueued } from './labels.mjs';
import { withSkip } from './skips.mjs';
import type {
  OutOfSync,
  OutOfSyncSighting,
  PullRequest,
  SkipRecord,
  SkipRecords,
  Survey,
} from './types.mjs';

/**
 * {@link observeOutOfSync} for a pull request whose branch was found at
 * `branchAt` before a rebase, with what to log and, once the mismatch has
 * lasted, the record that sets it aside. Every path that rebases a pull request
 * it surveyed reads a branch found elsewhere through this, so that none of them
 * goes on taking GitHub's dropped push for someone else's work.
 */
export const outOfSyncVerdict = (
  seen: OutOfSync,
  pr: Readonly<{ number: number; headRefOid: string }>,
  branchAt: string,
  { baseSha, nowEpochMs }: Readonly<{ baseSha: string; nowEpochMs: number }>,
): Readonly<{
  seen: OutOfSync;
  /** The mismatch and since when, for the log. */
  mismatch: string;
  /** The set-aside, once the same mismatch has lasted. */
  setAside: SkipRecord | undefined;
}> => {
  const observed = observeOutOfSync(
    seen,
    { number: pr.number, headSha: pr.headRefOid, branchSha: branchAt },
    nowEpochMs,
  );

  const mismatch =
    `its branch is at ${branchAt.slice(0, 10)} while GitHub shows ${pr.headRefOid.slice(0, 10)} as its head, and has been since ${isoSeconds(observed.sinceEpochMs)}` as const;

  return {
    seen: observed.seen,
    mismatch,
    setAside: observed.persisted
      ? {
          number: pr.number,
          headSha: pr.headRefOid,
          baseSha,
          reason: 'head-out-of-sync',
          detail: `${mismatch} — a push GitHub never took in, so nothing can rebase or merge it until the branch is pushed again`,
        }
      : undefined,
  };
};

/**
 * {@link outOfSyncVerdict} for each pull request a survey found armed and
 * `UNKNOWN` with its branch elsewhere (`Survey['outOfSync']`). The sighting is
 * what lets the next survey stop waiting on it (`awaitsMergeState`), and one
 * labelled `merge-queued` is set aside once the mismatch has lasted, as much
 * far down the queue as the next candidate is. One without the label is not
 * this script's to set aside or log, so it is only recorded. One already set
 * aside as `head-out-of-sync` at that head is left alone: there is nothing more
 * to observe. `notes` is what to log, one line each.
 */
export const observeAtSurvey = (
  seen: OutOfSync,
  skipped: SkipRecords,
  found: Survey['outOfSync'],
  at: Readonly<{ baseSha: string; nowEpochMs: number }>,
): Readonly<{
  seen: OutOfSync;
  skipped: SkipRecords;
  notes: readonly string[];
}> =>
  found.reduce<
    Readonly<{
      seen: OutOfSync;
      skipped: SkipRecords;
      notes: readonly string[];
    }>
  >(
    (acc, { pr, branchAt }) => {
      const standing = acc.skipped.get(pr.number);

      if (
        standing?.reason === 'head-out-of-sync' &&
        standing.headSha === pr.headRefOid
      ) {
        return acc;
      }

      const verdict = outOfSyncVerdict(acc.seen, pr, branchAt, at);

      if (!isMergeQueued(pr)) {
        return { ...acc, seen: verdict.seen };
      }

      return {
        seen: verdict.seen,
        skipped:
          verdict.setAside === undefined
            ? acc.skipped
            : withSkip(acc.skipped, verdict.setAside),
        notes: Arr.toPushed(
          acc.notes,
          `#${pr.number}: ${verdict.setAside?.detail ?? verdict.mismatch}`,
        ),
      };
    },
    { seen, skipped, notes: [] },
  );

/**
 * Records that `sighting.number`'s branch was found at `branchSha` while GitHub
 * reported `headSha`, and says since when the same mismatch has been seen and
 * whether that has now lasted {@link OUT_OF_SYNC_GRACE_MS}. Any other mismatch
 * starts the wait over: a branch that keeps moving is a writer at work.
 */
export const observeOutOfSync = (
  seen: OutOfSync,
  sighting: Readonly<{ number: number; headSha: string; branchSha: string }>,
  nowEpochMs: number,
): Readonly<{ seen: OutOfSync; sinceEpochMs: number; persisted: boolean }> => {
  const before = seen.get(sighting.number);

  if (
    before?.headSha === sighting.headSha &&
    before.branchSha === sighting.branchSha
  ) {
    return {
      seen,
      sinceEpochMs: before.sinceEpochMs,
      persisted: nowEpochMs - before.sinceEpochMs >= OUT_OF_SYNC_GRACE_MS,
    };
  }

  return {
    seen: new Map<number, OutOfSyncSighting>([
      ...seen,
      [
        sighting.number,
        {
          headSha: sighting.headSha,
          branchSha: sighting.branchSha,
          sinceEpochMs: nowEpochMs,
        },
      ],
    ]),
    sinceEpochMs: nowEpochMs,
    persisted: false,
  };
};

/**
 * Drops the sightings of pull requests that are gone or whose head GitHub now
 * reports differently — it took a push in, so whatever was out of sync is not.
 */
export const pruneOutOfSync = (
  seen: OutOfSync,
  pullRequests: readonly PullRequest[],
): OutOfSync =>
  new Map(
    Arr.generate(function* () {
      for (const pr of pullRequests) {
        const sighting = seen.get(pr.number);

        if (sighting?.headSha === pr.headRefOid) {
          yield [pr.number, sighting] as const;
        }
      }
    }),
  );
