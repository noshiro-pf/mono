import { SKIP_CI_LABEL } from 'pr-report-core';
import { Arr, Result } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { STALE_STATE_PAUSE_MS } from './constants.mjs';
import {
  checkPreflight,
  postSetAsideStatus,
  viewPullRequest,
} from './github.mjs';
import { HELP, parseOptions, type Options } from './options.mjs';
import {
  idleWaitSec,
  initialQuiet,
  observeSurvey,
  surveyFingerprint,
} from './quiet.mjs';
import { advance } from './rebase.mjs';
import {
  firstInReleaseOrder,
  pauseAllBut,
  settleAfterRelease,
} from './release.mjs';
import { describeFailedChecks } from './set-aside-detail.mjs';
import { newSkips, pruneSkips, withSkip } from './skips.mjs';
import { describeAction, reportTriage, survey, triage } from './triage.mjs';
import {
  type CycleResult,
  type LoopState,
  type PullRequest,
  type SkipRecord,
  type SkipRecords,
  type Watched,
  type WatchOutcome,
} from './types.mjs';
import { installStopHandlers, log, pause, stopRequested } from './util.mjs';
import { watch } from './watch.mjs';

/**
 * Keeps the pull requests that already have auto-merge enabled moving, one at
 * a time, by rebasing the one that is out-of-date with the default branch and
 * waiting for GitHub to merge it.
 *
 * This is the mechanical half of the `/unblock-prs` skill. The skill also
 * reads failing checks and fixes what they complain about; this script does
 * not, and it never merges anything — auto-merge does that once the checks
 * are green.
 *
 * One cycle:
 *
 * 1. List the open pull requests labelled `merge-queued` with auto-merge
 *    enabled (`autoMergeRequest` is not null) whose base is the default
 *    branch. Everything else is not this script's business: an unlabelled
 *    pull request is passed over in silence, and a labelled one that cannot
 *    be acted on — a draft, no auto-merge, a base that is not the default
 *    branch — is reported, because the label asked for something and the
 *    answer is no. Drafts and anything a previous cycle gave up on are set
 *    aside.
 * 2. If one of them is already up to date and its checks are running, or it
 *    is clean and about to merge, watch that one instead of rebasing another:
 *    the merge will move `main` and put every other branch back to `BEHIND`,
 *    so a second rebase now would only run a CI matrix to throw it away.
 * 3. Otherwise take the lowest-numbered pull request that is `BEHIND` —
 *    or, once those are exhausted, one GitHub calls `DIRTY` — rebase it onto
 *    `origin/<default branch>` in a throwaway worktree, and push with
 *    `--force-with-lease` against the head the survey saw. A rebase that
 *    conflicts, or a push that is refused, drops that pull request for as
 *    long as its head and the base stay where they are, and the next
 *    candidate is tried in the same cycle. A branch that moved under the
 *    rebase is not one of those: someone else — the skill, or a person — is
 *    moving it, so nothing is recorded and the cycle surveys again rather
 *    than start a second matrix on the next candidate.
 * 4. Poll the rebased pull request until it merges, or until something says
 *    it will not: a required check failed, auto-merge was switched off, the
 *    `skip-ci` label went on, the branch was pushed by someone else, or every
 *    required context reported
 *    green and it still did not merge. "Green" means the whole list the
 *    ruleset requires, not the part of it that has reported — a required
 *    context with no check run on the head commit is absent from
 *    `gh pr checks` rather than pending in it, so reading its absence as
 *    success is what used to write a pull request off three minutes into a
 *    twenty-five minute matrix.
 * 5. Remember the verdict against the head *and* the base it was reached on,
 *    so the pull request is left alone until someone pushes to it or the
 *    base moves. The base moving is exactly what a pull request that sat
 *    green without merging was waiting for: it is `BEHIND` now, and a rebase
 *    is this script's job.
 * 6. Survey again, saying what became of the pull requests this run has
 *    touched. One that merges after the watch gave up simply stops appearing
 *    in the list, and this is the only place that gets recorded. When there
 *    is nothing to do the script sleeps before looking again —
 *    `--active-interval` seconds while the list keeps changing, so a pull
 *    request queued a moment ago is not left for minutes, and
 *    `--idle-interval` once `--idle-after` surveys in a row have seen the
 *    same list — and keeps going until it is interrupted or `--once` was
 *    given.
 *
 * The rebase happens in a `git worktree` under the OS temp directory, so the
 * checkout this runs from is never touched — its working tree may be dirty,
 * and the pull request's branch may even be checked out somewhere else.
 *
 * ## The order, and `skip-ci`
 *
 * Three things the pull requests themselves declare shape that loop.
 *
 * - **`Merge-After: #1234` in the body** adds an ordering constraint: the
 *   pull request is not *picked* while any pull request it names is still
 *   open. It constrains picking and nothing else — one that is already up to
 *   date and merging is watched as ever, because auto-merge is going to merge
 *   it whatever this script thinks, and passing it over would only send the
 *   cycle off to rebase a branch that merge is about to invalidate. Several
 *   numbers may be named, on one line or several, so the declarations form a
 *   graph rather than a chain; a cycle in it is reported by name and
 *   everything caught in it is left alone, because nothing here can move it.
 * - **The `skip-ci` label** pauses a queued pull request rather than removing
 *   it: every check workflow skips while it is on and `no-skip-ci-label`
 *   holds the merge, so taking it off is the action, and it is taken off one
 *   pull request at a time. The rebase comes *first* and the label removal
 *   *second*: while the label is on, the push fires a `synchronize` whose
 *   every check is skipped, and taking the label off then fires `unlabeled`,
 *   which runs the matrix once, on the head that will actually be merged. The
 *   other order starts a full matrix on the pre-rebase head and has the push
 *   cancel it.
 * - **The `blocks-release` label** says the next release must contain this
 *   pull request: while it is open the version pull request — the one
 *   `changesets/action` opens from `changeset-release/<base>` — is not
 *   picked. It exists because that is the one pull request whose body cannot
 *   declare anything: its title and body are overwritten on every push to the
 *   base, so a `Merge-After:` written there is wiped exactly while several
 *   queued pull requests made it matter. The same branch is rebuilt from the
 *   tip and force-pushed by the same workflow, so nothing here rebases it
 *   either: taking `skip-ci` off, once the release workflow has rebuilt it on
 *   the current tip, is all it is ever given, and it is picked last so that a
 *   queued change goes into the release rather than after it.
 *
 * Releasing one is as far as it goes. From there it is an ordinary queued
 * pull request, and if its checks fail it is set aside like any other — with
 * its `skip-ci` off. Everything that declared `Merge-After` on it then waits,
 * because it has not merged, which is what a declared order is for.
 *
 * **One queued pull request is released at a time.** Before releasing one,
 * and while watching the one in flight, every other open `merge-queued` pull
 * request without `skip-ci` is given the label, set-aside ones included: a
 * second released pull request is a matrix run to be thrown away. After
 * releasing, it looks again, because the skill may have released another in
 * the same moment; the one first in the pick order keeps its release.
 *
 * ## Where the rest of it is
 *
 * This file is the loop and the command line. Reading order, roughly outside
 * in:
 *
 * - `triage.mts` — what one survey says about each pull request, and why.
 * - `merge-after.mts` — the declared order: the trailer parser and the cycle
 *   detection.
 * - `version-pr.mts` — the version pull request, and what holds it back.
 * - `rebase.mts` — moving a branch: the rebase in a throwaway worktree, and
 *   taking `skip-ci` off.
 * - `release.mts` — holding the queue to one released pull request.
 * - `watch.mts` — polling one pull request until it merges, or until it will
 *   not.
 * - `quiet.mts` — how long to sleep when there is nothing to do.
 * - `checks.mts` — what the merge is waiting for, judged against the contexts
 *   the ruleset requires.
 * - `github.mts` — everything that shells out to `gh` or `git`, and nothing
 *   that decides.
 * - `labels.mts`, `skips.mts`, `options.mts`, `types.mts`, `constants.mts`,
 *   `util.mts` — the vocabulary.
 */
const unblockPrs = async (
  options: Options,
): Promise<Result<undefined, string>> => {
  const preflight = await checkPreflight();

  if (Result.isErr(preflight)) {
    return preflight;
  }

  const { defaultBranch } = preflight.value;

  log(
    `Watching pull requests into ${defaultBranch}${options.dryRun ? ' (dry run)' : ''}.`,
  );

  installStopHandlers();

  let mut_state: LoopState = {
    skipped: new Map(),
    tracked: new Set(),
    baseSha: undefined,
    quiet: initialQuiet,
  };

  while (!stopRequested()) {
    const cycle = await runCycle(defaultBranch, mut_state, options);

    if (!options.dryRun) {
      await announceSetAside(newSkips(mut_state.skipped, cycle.state.skipped));
    }

    mut_state = cycle.state;

    if (cycle.next === 'stop' || options.once || options.dryRun) {
      break;
    }

    if (cycle.next !== 'idle') {
      continue;
    }

    const waitSec = idleWaitSec(mut_state.quiet, options);

    log(`Nothing to do. Checking again in ${waitSec}s.`);

    await pause(waitSec * 1000);
  }

  return Result.ok(undefined);
};

/**
 * Says on each newly set-aside pull request why, where GitHub keeps it, so
 * that finding out does not mean finding the terminal this ran in. A status
 * that could not be written is reported and nothing more: the job is to land
 * pull requests, and this is not a reason to stop.
 */
const announceSetAside = async (
  skips: readonly SkipRecord[],
): Promise<void> => {
  for (const skip of skips) {
    const posted = await postSetAsideStatus(
      skip.headSha,
      { reason: skip.reason, baseSha: skip.baseSha, detail: skip.detail },
      skip.link,
    );

    if (Result.isErr(posted)) {
      log(
        `#${skip.number}: could not leave a status saying why: ${posted.value}`,
      );
    }
  }
};

const runCycle = async (
  defaultBranch: string,
  before: LoopState,
  options: Options,
): Promise<CycleResult> => {
  const surveyed = await survey(defaultBranch);

  if (Result.isErr(surveyed)) {
    log(`Survey failed: ${surveyed.value}`);

    return { state: before, next: 'idle' };
  }

  const { pullRequests, baseSha, requiredContexts } = surveyed.value;

  if (before.baseSha !== undefined && before.baseSha !== baseSha) {
    log(`${defaultBranch} moved to ${baseSha.slice(0, 10)}.`);
  }

  // A pull request this run acted on and can no longer see is one that ended
  // while nothing was watching it — including one the watch had given up on,
  // whose merge would otherwise go unrecorded.
  const tracked = await reportDeparted(before.tracked, pullRequests);

  const quiet = observeSurvey(
    before.quiet,
    surveyFingerprint({ pullRequests, baseSha }),
  );

  const state = (
    nextSkipped: SkipRecords,
    nextTracked: ReadonlySet<number> = tracked,
  ): LoopState =>
    ({
      skipped: nextSkipped,
      tracked: nextTracked,
      baseSha,
      quiet,
    }) as const;

  const skipped = pruneSkips(before.skipped, pullRequests, baseSha);

  const triaged = await triage(pullRequests, {
    defaultBranch,
    baseSha,
    skipped,
    requiredContexts,
  });

  reportTriage(triaged, pullRequests.length, defaultBranch);

  // A pull request that is up to date and already failing gets remembered
  // now, so that it is not rebased the moment `main` moves and put through
  // the same failing matrix again.
  let mut_skipped: SkipRecords = triaged.failing.reduce(
    (acc, { pr, summary }) =>
      withSkip(acc, {
        number: pr.number,
        headSha: pr.headRefOid,
        baseSha,
        reason: 'checks-failed',
        ...describeFailedChecks(summary),
      }),
    skipped,
  );

  if (stopRequested()) {
    return { state: state(mut_skipped), next: 'stop' };
  }

  // Normally the only one. Two are what a pull request opened already
  // released looks like, and the one that is not first is paused below.
  const watched = firstInReleaseOrder(triaged.inFlight, defaultBranch);

  if (watched !== undefined) {
    log(
      `#${watched.number} is up to date (${watched.mergeStateStatus}); watching it rather than rebasing another.`,
    );

    if (options.dryRun) {
      return { state: state(mut_skipped), next: 'stop' };
    }

    await pauseAllBut(watched.number);

    const ended = await watch(
      watched,
      watched.headRefOid,
      requiredContexts,
      options,
    );

    return {
      state: state(
        applyWatchOutcome(mut_skipped, watched, baseSha, ended),
        trackAfterWatch(tracked, watched.number, ended.outcome),
      ),
      next: ended.outcome === 'stopped' ? 'stop' : 'survey',
    };
  }

  if (options.dryRun) {
    if (Arr.isNonEmpty(triaged.candidates)) {
      const first = triaged.candidates[0];

      log(
        `Would ${describeAction(first, defaultBranch)} for #${first.number}.`,
      );
    }

    return { state: state(mut_skipped), next: 'stop' };
  }

  for (const target of triaged.candidates) {
    if (stopRequested()) {
      return { state: state(mut_skipped), next: 'stop' };
    }

    log(
      `#${target.number} (${target.headRefName}) is next: ${describeAction(target, defaultBranch)}.`,
    );

    // Before the push or the label removal that starts its matrix, so that
    // at no point are two queued pull requests released.
    await pauseAllBut(target.number);

    const advanced = await advance(target, defaultBranch);

    if (Result.isErr(advanced)) {
      log(`#${target.number}: ${advanced.value.detail}`);

      mut_skipped = withSkip(mut_skipped, {
        number: target.number,
        headSha: target.headRefOid,
        baseSha,
        reason: advanced.value.reason,
        detail: advanced.value.detail,
      });

      continue;
    }

    if (advanced.value.kind === 'moved') {
      // Someone else is moving this one — the skill, or a person. Whatever
      // they pushed is likely to start a matrix, so rather than start a
      // second on the next candidate, survey again and take what is there.
      log(
        `#${target.number} moved while this run was moving it; leaving it to whoever pushed, and surveying again.`,
      );

      return { state: state(mut_skipped), next: 'survey' };
    }

    if (advanced.value.kind === 'stale-merge-state') {
      // GitHub said BEHIND or DIRTY but the rebase changed nothing, and there
      // was no label to take off either — the merge state was stale. The next
      // survey will say what is actually there; wait first, because a state
      // GitHub is still recomputing would otherwise send this straight back
      // here, and each turn costs a fetch and a worktree.
      log(
        `#${target.number} was already on top of ${defaultBranch}; its ${target.mergeStateStatus} was stale.`,
      );

      await pause(STALE_STATE_PAUSE_MS);

      return { state: state(mut_skipped), next: 'survey' };
    }

    const { head } = advanced.value;

    if ((await settleAfterRelease(target, defaultBranch)) === 'yielded') {
      log(
        `#${target.number} was released at the same moment as another, which goes first; paused it again.`,
      );

      return { state: state(mut_skipped), next: 'survey' };
    }

    log(
      `#${target.number} is at ${head.slice(0, 10)}; waiting for it to merge.`,
    );

    const ended = await watch(target, head, requiredContexts, options);

    return {
      state: state(
        applyWatchOutcome(
          mut_skipped,
          { ...target, headRefOid: head },
          baseSha,
          ended,
        ),
        trackAfterWatch(tracked, target.number, ended.outcome),
      ),
      next: ended.outcome === 'stopped' ? 'stop' : 'survey',
    };
  }

  // Nothing to act on, or every candidate failed to rebase or push.
  return { state: state(mut_skipped), next: 'idle' };
};

/**
 * A pull request the run has acted on is worth remembering while it might
 * still end without anything watching it; once it has ended there is nothing
 * left to report.
 */
const trackAfterWatch = (
  tracked: ReadonlySet<number>,
  prNumber: number,
  outcome: WatchOutcome,
): ReadonlySet<number> =>
  outcome === 'merged' || outcome === 'closed'
    ? new Set(Array.from(tracked).filter((number) => number !== prNumber))
    : new Set([...tracked, prNumber]);

/**
 * Says what became of the pull requests this run acted on that have left the
 * open list, and returns the ones that are still on it.
 *
 * Nothing else notices: a pull request the watch gave up on merges minutes
 * later, and the only trace is that it stops being listed. Without this the
 * run that pushed the merge commit never mentions it.
 */
const reportDeparted = async (
  tracked: ReadonlySet<number>,
  pullRequests: readonly PullRequest[],
): Promise<ReadonlySet<number>> => {
  const isOpen = (prNumber: number): boolean =>
    pullRequests.some((pr) => pr.number === prNumber);

  const departed = Array.from(tracked).filter((prNumber) => !isOpen(prNumber));

  const viewed = await Promise.all(
    departed.map(async (prNumber) => ({
      prNumber,
      result: await viewPullRequest(prNumber),
    })),
  );

  for (const { prNumber, result } of viewed) {
    if (Result.isErr(result)) {
      const detail =
        `left the open list; cannot read it: ${result.value}` as const;

      log(`#${prNumber} has ${detail}`);
    } else if (result.value.state === 'MERGED') {
      log(`#${prNumber} merged — ${result.value.title}`);
    } else {
      const detail = `no longer open (${result.value.state})` as const;

      log(`#${prNumber} is ${detail} — ${result.value.title}`);
    }
  }

  return new Set(Array.from(tracked).filter(isOpen));
};

const applyWatchOutcome = (
  skipped: SkipRecords,
  pr: PullRequest,
  baseSha: string,
  ended: Watched,
): SkipRecords => {
  switch (ended.outcome) {
    case 'merged':
      log(`#${pr.number} merged.`);

      return skipped;

    case 'closed':
      log(`#${pr.number} was closed without merging.`);

      return skipped;

    case 'auto-merge-disabled':
      log(`#${pr.number}: auto-merge was switched off; leaving it alone.`);

      return skipped;

    case 'skip-ci-labelled':
      log(
        `#${pr.number}: ${SKIP_CI_LABEL} went on while waiting; leaving it alone.`,
      );

      return skipped;

    case 'head-moved':
      log(`#${pr.number}: someone else pushed to the branch; surveying again.`);

      return skipped;

    case 'behind-again':
      log(`#${pr.number}: the base moved while waiting; surveying again.`);

      return skipped;

    case 'checks-failed':
      return withSkip(skipped, {
        number: pr.number,
        headSha: pr.headRefOid,
        baseSha,
        reason: 'checks-failed',
        detail: ended.detail ?? 'a required check failed',
        link: ended.link,
      });

    case 'not-merging':
      log(
        `#${pr.number}: every required check reported green and it is still open; something other than the checks holds it — a review, an unresolved conversation, or auto-merge armed by someone who may not merge.`,
      );

      return withSkip(skipped, {
        number: pr.number,
        headSha: pr.headRefOid,
        baseSha,
        reason: 'not-merging',
        detail: ended.detail ?? 'green but not merged',
      });

    case 'timeout':
      log(`#${pr.number}: gave up waiting.`);

      return withSkip(skipped, {
        number: pr.number,
        headSha: pr.headRefOid,
        baseSha,
        reason: 'watch-timeout',
        detail: ended.detail ?? 'checks did not finish in time',
      });

    case 'error':
      log(`#${pr.number}: polling kept failing; surveying again later.`);

      return skipped;

    case 'stopped':
      return skipped;
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  const options = parseOptions(Arr.skip(process.argv, 2));

  if (Result.isErr(options)) {
    console.error(`${options.value}\n\n${HELP}`);

    process.exit(2);
  }

  if (options.value === 'help') {
    console.info(HELP);
  } else {
    const result = await unblockPrs(options.value);

    if (Result.isErr(result)) {
      console.error(result.value);

      process.exit(1);
    }
  }
}
