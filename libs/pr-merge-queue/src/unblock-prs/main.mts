// cspell:ignore retargeted

import {
  MERGE_QUEUED_LABEL,
  SKIP_CI_LABEL,
  stackDescendants,
  type Claim,
} from 'pr-report-core';
import { Arr, Result } from 'ts-data-forge';
import { currentEpochMs, log, type ApiContext } from '../lib/index.mjs';
import { autoFix } from './auto-fix.mjs';
import { standingClaims } from './claims.mjs';
import { CONFIG_PATH, readConfig, type AutoFixConfig } from './config.mjs';
import { STALE_STATE_PAUSE_MS } from './constants.mjs';
import { afterWatch, followHead, pruneDemotions } from './demotions.mjs';
import {
  checkPreflight,
  readIssueOrder,
  readOwnComments,
  readSetAsideComments,
  viewPullRequest,
  writeSetAsideCommentOn,
} from './github.mjs';
import { isSkipCiLabelled, wantsAutoRebase } from './labels.mjs';
import type { Options } from './options.mjs';
import {
  idleWaitSec,
  initialQuiet,
  observeSurvey,
  surveyFingerprint,
} from './quiet.mjs';
import {
  advance,
  armOnPick,
  restackBehind,
  restackRetargeted,
} from './rebase.mjs';
import { firstInReleaseOrder, settleAfterRelease } from './release.mjs';
import {
  describeResolvedBy,
  resolvedCommentBody,
  setAsideCommentBody,
} from './set-aside-comment.mjs';
import { describeFailedChecks } from './set-aside-detail.mjs';
import {
  newSkips,
  pruneSkips,
  settleSkips,
  unannouncedSkips,
  withSkip,
} from './skips.mjs';
import { stackedOnAfter, stackParentsOf } from './stack.mjs';
import {
  bypassPhrase,
  describeAction,
  reportTriage,
  survey,
  triage,
} from './triage.mjs';
import type {
  CycleResult,
  Demotions,
  IssueOrder,
  LoopState,
  PullRequest,
  SkipRecord,
  SkipRecords,
  Watched,
  WatchOutcome,
} from './types.mjs';
import { installStopHandlers, pause, stopRequested } from './util.mjs';
import { watch } from './watch.mjs';

/**
 * Keeps the pull requests labelled `merge-queued` moving, one at a time, by
 * rebasing the one that is out-of-date with the default branch, arming its
 * auto-merge, and waiting for GitHub to merge it.
 *
 * The `/unblock-prs` skill fixes what this script sets aside — a failing check
 * that needs reading, a conflict — after claiming it, so that this script
 * leaves it alone meanwhile (`claims.mts`). This script fixes only the one
 * kind that needs no reading — a fixer's diff, see step 4 — and it never
 * merges anything: auto-merge does that once the checks are green.
 *
 * One cycle:
 *
 * 1. List the open pull requests labelled `merge-queued` whose base is the
 *    default branch. Everything else is not this script's business: an
 *    unlabelled pull request is passed over in silence, and a labelled one
 *    that cannot be acted on — a draft, a base that is neither the default
 *    branch nor another open pull request's — is reported, because the label
 *    asked for something and the answer is no. A stacked one waits for the
 *    layer below it (`stack.mts`). Auto-merge is this script's to arm, when
 *    it picks a pull request (`armOnPick` in `rebase.mts`), whether or not
 *    it was armed before: the label is the only permission read. Drafts and
 *    anything a previous cycle gave up on are set aside, and so is one whose
 *    review holds its merge — a code owner has not approved it, or a
 *    conversation is unresolved — because no check reports that, and
 *    releasing it would only run a matrix to sit green. One whose waiting
 *    paths only its author owns is the exception, since no approval will
 *    ever come: it is released and watched with auto-merge left off, and
 *    once its checks are green it is set aside `awaiting-bypass` for a
 *    person to merge by a ruleset bypass (`pr-report-core`'s
 *    `review-hold.mts`). The one thing done without the label comes first:
 *    a layer GitHub moved onto the default branch when the one below it
 *    merged, still carrying that one's commits, is rebased off them and the
 *    list read again (`stack.mts`).
 * 2. If one of them is already up to date and its checks are running, or it
 *    is clean and about to merge, watch that one instead of rebasing another:
 *    the merge will move `main` and put every other branch back to `BEHIND`,
 *    so a second rebase now would only run a CI matrix to throw it away.
 * 3. Otherwise take the lowest-numbered pull request that is `BEHIND` —
 *    or, once those are exhausted, one GitHub calls `DIRTY`, then the version
 *    pull request, then one a watch saw sit green — rebase it onto
 *    `origin/<default branch>` in a throwaway worktree, and push with
 *    `--force-with-lease` against the head the survey saw, carrying the
 *    layers stacked on it along. A rebase that conflicts, or a push that is
 *    refused, drops that pull request for as long as its head and the base
 *    stay where they are, and the next
 *    candidate is tried in the same cycle. A branch that moved under the
 *    rebase is not one of those: someone else — the skill, or a person — is
 *    moving it, so nothing is recorded and the cycle surveys again rather
 *    than start a second matrix on the next candidate.
 *    When there is no candidate and nothing in flight, a pull request paused
 *    by `skip-ci` and labelled `auto-rebase` or `merge-queued` that is behind
 *    is rebased onto the tip instead, with its layers — under the label the
 *    push runs no checks, and it keeps the diff under review its own. Anything
 *    that moved sends the cycle back to the survey.
 * 4. Poll the rebased pull request until it merges, or until something says
 *    it will not: a required check failed, auto-merge was switched off, the
 *    `skip-ci` label went on, the branch was pushed by someone else, or every
 *    required context reported
 *    green and it still did not merge. "Green" means the whole list the
 *    ruleset requires, not the part of it that has reported — a required
 *    context with no check run on the head commit is absent from the
 *    head's checks rather than pending in them, so reading its absence as
 *    success is what used to write a pull request off three minutes into a
 *    twenty-five minute matrix.
 *    When a required check failed and every job that failed under it is a
 *    `fix:` or `gen:` entry of the check matrices, run those commands, amend
 *    what they wrote onto the branch's one commit, push, and watch the new
 *    head instead — once, and only for the pull request this cycle is
 *    watching, never the others that are failing.
 * 5. Remember the verdict against the head *and* the base it was reached on,
 *    so the pull request is left alone until someone pushes to it or the
 *    base moves, and say so in its one set-aside comment: a person ticks the
 *    retry box there to have it tried anyway, the comment is rewritten as
 *    resolved once the verdict ends, and a later run takes up a verdict it
 *    finds still standing (`settleSkips`). A pull request that sat green
 *    without merging is also picked last from then on, until someone else
 *    pushes to it: the base moving makes it `BEHIND` and a candidate again,
 *    but whatever held it is something triage could not read, and it would
 *    otherwise go first each time anything else merged.
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
 * Five things the pull requests themselves declare shape that loop.
 *
 * - **A base that is another open pull request's branch** stacks the pull
 *   request on that one: it is not picked while that one is open, exactly as
 *   if it had declared `Merge-After:` on it. `stack.mts` says what happens
 *   when the layer below moves, and when it merges.
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
 * - **The `auto-rebase` label** asks for a pull request paused by `skip-ci`
 *   to be kept on the tip while it waits, as a queued one is (step 3). It is
 *   opt-in so that a branch left to sleep is never moved for want of a label.
 *
 * Releasing one is as far as it goes. From there it is an ordinary queued
 * pull request, and if its checks fail it is set aside like any other — with
 * its `skip-ci` off. Everything that declared `Merge-After` on it then waits,
 * because it has not merged, which is what a declared order is for.
 *
 * **One queued pull request is released at a time, from this side only.**
 * Nothing is picked while one is in flight, and after releasing it looks
 * again: when another the worker owns was released in the same moment and
 * goes first, it gives back the `skip-ci` it has just taken off its own. It
 * puts the label on no other pull request (`release.mts`).
 *
 * ## Where the rest of it is
 *
 * This file is the loop and the command line. Reading order, roughly outside
 * in:
 *
 * - `triage.mts` — what one survey says about each pull request, and why.
 * - `pr-report-core`'s `review-hold.mts` — whether a pull request's own review
 *   holds its merge.
 * - `merge-after.mts` — the declared order: the trailer parser and the cycle
 *   detection.
 * - `stack.mts` — stacked pull requests: when they wait, when they are armed,
 *   and what moves with them.
 * - `version-pr.mts` — the version pull request, and what holds it back.
 * - `rebase.mts` — moving a branch: the rebase in a throwaway worktree, and
 *   taking `skip-ci` off.
 * - `release.mts` — holding the queue to one released pull request.
 * - `watch.mts` — polling one pull request until it merges, or until it will
 *   not.
 * - `auto-fix.mts` — running the fixer a failed check names, and pushing
 *   what it wrote.
 * - `quiet.mts` — how long to sleep when there is nothing to do.
 * - `checks.mts` — what the merge is waiting for, judged against the contexts
 *   the ruleset requires.
 * - `github.mts` — everything that reads or writes GitHub or `git`, and
 *   nothing that decides. The API client, the runner and the quoting are
 *   `tools/scripts/lib/`'s.
 * - `labels.mts`, `skips.mts`, `demotions.mts`, `options.mts`, `types.mts`,
 *   `constants.mts`, `util.mts` — the vocabulary.
 */
export const unblockPrs = async (
  options: Options,
): Promise<Result<undefined, string>> => {
  const preflight = await checkPreflight(options.repo);

  if (Result.isErr(preflight)) {
    return preflight;
  }

  const { api, defaultBranch } = preflight.value;

  const config = await readConfig();

  if (Result.isErr(config)) {
    return config;
  }

  const autoFixConfig = options.autoFix ? config.value?.autoFix : undefined;

  if (autoFixConfig === undefined && options.autoFix) {
    log(
      `No autoFix in ${CONFIG_PATH}: a failed check is reported, never fixed here.`,
    );
  }

  log(
    `Watching pull requests into ${defaultBranch}${options.dryRun ? ' (dry run)' : ''}.`,
  );

  installStopHandlers();

  let mut_state: LoopState = {
    skipped: new Map(),
    demoted: new Map(),
    tracked: new Set(),
    baseSha: undefined,
    quiet: initialQuiet,
    stackedOn: undefined,
  };

  while (!stopRequested()) {
    const cycle = await runCycle(
      api,
      defaultBranch,
      mut_state,
      options,
      autoFixConfig,
    );

    if (!options.dryRun) {
      await announceSetAside(
        api,
        newSkips(cycle.settled, cycle.state.skipped),
        defaultBranch,
      );
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
 * that finding out does not mean finding the terminal this ran in: in its one
 * set-aside comment, written over the one it has or posted as its first. A
 * comment that could not be written is reported and nothing more: the job is
 * to land pull requests, and this is not a reason to stop.
 */
const announceSetAside = async (
  api: ApiContext,
  skips: readonly SkipRecord[],
  defaultBranch: string,
): Promise<void> => {
  for (const skip of skips) {
    const existing = await readSetAsideComments(api, [skip.number]);

    const written = Result.isErr(existing)
      ? existing
      : await writeSetAsideCommentOn(
          api,
          skip.number,
          existing.value.get(skip.number)?.databaseId,
          setAsideCommentBody(skip, defaultBranch),
        );

    if (Result.isErr(written)) {
      log(
        `#${skip.number}: could not leave a comment saying why: ${written.value}`,
      );
    }
  }
};

/**
 * Reads this account's set-aside comments on the pull requests that are queued or
 * ask for `auto-rebase`, and on
 * any other this run holds a record for, and settles the records with them
 * (`settleSkips`): a comment whose state has ended, or whose retry box a
 * person ticked, is rewritten as resolved — not under `--dry-run` — and one
 * an earlier run left standing becomes a record again. Comments that cannot
 * be read leave the records as they were.
 *
 * The claims sessions wrote on the same pull requests are read with them,
 * and those that still hold are returned beside the records (`claims.mts`).
 * Comments that cannot be read hold nothing: every push is leased anyway.
 */
const settleWithComments = async (
  api: ApiContext,
  skipped: SkipRecords,
  pullRequests: readonly PullRequest[],
  baseSha: string,
  defaultBranch: string,
  dryRun: boolean,
): Promise<
  Readonly<{ skipped: SkipRecords; claimed: ReadonlyMap<number, Claim> }>
> => {
  const read = await readOwnComments(
    api,
    pullRequests
      .filter((pr) => wantsAutoRebase(pr) || skipped.has(pr.number))
      .map((pr) => pr.number),
  );

  if (Result.isErr(read)) {
    log(`Cannot read the set-aside comments: ${read.value}`);

    return { skipped, claimed: new Map() };
  }

  const settled = settleSkips(
    skipped,
    read.value.setAside,
    pullRequests,
    baseSha,
  );

  for (const { number, databaseId, setAside, resolvedBy } of settled.resolved) {
    log(
      `#${number}: no longer set aside (${setAside.reason}) — ${describeResolvedBy(resolvedBy, defaultBranch)}${resolvedBy === 'retry' ? '; trying it again' : ''}.`,
    );

    if (dryRun) {
      continue;
    }

    const written = await writeSetAsideCommentOn(
      api,
      number,
      databaseId,
      resolvedCommentBody(
        setAside,
        resolvedBy,
        defaultBranch,
        currentEpochMs(),
      ),
    );

    if (Result.isErr(written)) {
      log(`#${number}: could not mark its comment resolved: ${written.value}`);
    }
  }

  // A record whose comment never got written is one every other reader of
  // the queue takes for the worker's while this run holds it aside.
  const unannounced = unannouncedSkips(settled.skipped, read.value.setAside);

  if (!dryRun && Arr.isNonEmpty(unannounced)) {
    log(
      `Writing the set-aside comment again on ${unannounced.map(({ number }) => `#${number}`).join(', ')}, which no comment says.`,
    );

    await announceSetAside(api, unannounced, defaultBranch);
  }

  return {
    skipped: settled.skipped,
    claimed: standingClaims(read.value.claims, pullRequests, currentEpochMs()),
  };
};

const runCycle = async (
  api: ApiContext,
  defaultBranch: string,
  before: LoopState,
  options: Options,
  autoFixConfig: AutoFixConfig | undefined,
): Promise<CycleResult> => {
  const listed = await survey(api, defaultBranch);

  if (Result.isErr(listed)) {
    log(`Survey failed: ${listed.value}`);

    return { state: before, next: 'idle', settled: before.skipped };
  }

  // What the next cycle compares its bases with. From this survey rather
  // than the one below, which a layer moving in between could skip.
  const stackedOn = stackedOnAfter(
    before.stackedOn,
    listed.value.pullRequests,
    stackParentsOf(listed.value.pullRequests, defaultBranch),
  );

  // A layer the one below merged from under goes first, labelled or not, and
  // the heads read before it are then read again. See `stack.mts`.
  const surveyed = (await restackRetargeted(
    api,
    before.stackedOn,
    listed.value.pullRequests,
    defaultBranch,
    options.dryRun,
  ))
    ? await survey(api, defaultBranch)
    : listed;

  if (Result.isErr(surveyed)) {
    log(`Survey failed: ${surveyed.value}`);

    return { state: before, next: 'idle', settled: before.skipped };
  }

  const { pullRequests, baseSha, requiredContexts, reviewRequirements } =
    surveyed.value;

  if (before.baseSha !== undefined && before.baseSha !== baseSha) {
    log(`${defaultBranch} moved to ${baseSha.slice(0, 10)}.`);
  }

  // A pull request this run acted on and can no longer see is one that ended
  // while nothing was watching it — including one the watch had given up on,
  // whose merge would otherwise go unrecorded.
  const tracked = await reportDeparted(api, before.tracked, pullRequests);

  const { skipped, claimed } = await settleWithComments(
    api,
    pruneSkips(before.skipped, pullRequests, baseSha),
    pullRequests,
    baseSha,
    defaultBranch,
    options.dryRun,
  );

  const demoted = pruneDemotions(before.demoted, pullRequests);

  const triaged = await triage(api, pullRequests, {
    defaultBranch,
    baseSha,
    skipped,
    claimed,
    demoted,
    requiredContexts,
    reviewRequirements,
    issueOrder: await issueOrderFor(api, pullRequests),
  });

  reportTriage(triaged, pullRequests.length, { defaultBranch, demoted });

  const quiet = observeSurvey(
    before.quiet,
    surveyFingerprint({ pullRequests, baseSha }, triaged.held),
  );

  const state = (
    nextSkipped: SkipRecords,
    nextDemoted: Demotions = demoted,
    nextTracked: ReadonlySet<number> = tracked,
  ): LoopState =>
    ({
      skipped: nextSkipped,
      demoted: nextDemoted,
      tracked: nextTracked,
      baseSha,
      quiet,
      stackedOn,
    }) as const;

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
    return { state: state(mut_skipped), next: 'stop', settled: skipped };
  }

  // Normally the only one. Two are what a pull request opened already
  // released looks like; the first is watched, and the other runs as it was
  // released, since nothing here labels a pull request it did not pick.
  const watched = firstInReleaseOrder(triaged.inFlight, defaultBranch);

  if (watched !== undefined) {
    const arm = triaged.toArm.has(watched.number);

    const bypassReason = triaged.bypass.get(watched.number);

    log(
      `#${watched.number} is up to date (${watched.mergeStateStatus}); ${arm ? 'arming auto-merge and ' : ''}watching it rather than rebasing another${bypassPhrase(bypassReason)}.`,
    );

    if (options.dryRun) {
      return { state: state(mut_skipped), next: 'stop', settled: skipped };
    }

    // Before the watch, which reads a pull request without auto-merge as one
    // someone switched it off on.
    if (arm) {
      const armed = await armOnPick(
        api,
        watched,
        watched.headRefOid,
        defaultBranch,
      );

      if (Result.isErr(armed)) {
        log(`#${watched.number}: ${armed.value.detail}`);

        return {
          state: state(
            withSkip(mut_skipped, {
              number: watched.number,
              headSha: watched.headRefOid,
              baseSha,
              reason: armed.value.reason,
              detail: armed.value.detail,
            }),
          ),
          next: 'survey',
          settled: skipped,
        };
      }

      if (armed.value === 'moved') {
        log(
          `#${watched.number}: its branch moved before it was armed; surveying again.`,
        );

        return { state: state(mut_skipped), next: 'survey', settled: skipped };
      }
    }

    const { ended, head } = await watchAndFix(
      api,
      watched,
      watched.headRefOid,
      { defaultBranch, requiredContexts, bypassReason, autoFixConfig },
      options,
    );

    return {
      state: state(
        applyWatchOutcome(
          mut_skipped,
          { ...watched, headRefOid: head },
          baseSha,
          ended,
        ),
        afterWatch(demoted, watched.number, head, ended.outcome),
        trackAfterWatch(tracked, watched.number, ended.outcome),
      ),
      next: ended.outcome === 'stopped' ? 'stop' : 'survey',
      settled: skipped,
    };
  }

  // One whose checks could not be read may be running a matrix as much as
  // one in flight is, and releasing another beside it starts a second; the
  // next survey reads them again.
  if (Arr.isNonEmpty(triaged.unreadReleased)) {
    log(
      `${triaged.unreadReleased.map((pr) => `#${pr.number}`).join(', ')}: released, and its checks could not be read; releasing nothing else until they can be.`,
    );

    return { state: state(mut_skipped), next: 'idle', settled: skipped };
  }

  // Only when the queue has nothing to do: `main` is about to move again
  // otherwise, and a push now would be undone by the next merge.
  if (Arr.isEmpty(triaged.candidates)) {
    const behind = await restackBehind(pullRequests, defaultBranch, {
      baseSha,
      skipped: mut_skipped,
      owners: triaged.owners,
      dryRun: options.dryRun,
    });

    mut_skipped = behind.skipped;

    if (behind.moved) {
      return { state: state(mut_skipped), next: 'survey', settled: skipped };
    }
  }

  if (options.dryRun) {
    if (Arr.isNonEmpty(triaged.candidates)) {
      const first = triaged.candidates[0];

      log(
        `Would ${describeAction(first, defaultBranch, triaged)} for #${first.number}.`,
      );
    }

    return { state: state(mut_skipped), next: 'stop', settled: skipped };
  }

  // What a release found afterwards can have happened in the same moment
  // only for these; see `release.mts`.
  const pausedAtSurvey: ReadonlySet<number> = new Set(
    pullRequests.filter(isSkipCiLabelled).map((pr) => pr.number),
  );

  for (const target of triaged.candidates) {
    if (stopRequested()) {
      return { state: state(mut_skipped), next: 'stop', settled: skipped };
    }

    log(
      `#${target.number} (${target.headRefName}) is next: ${describeAction(target, defaultBranch, triaged)}.`,
    );

    const advanced = await advance(api, target, defaultBranch, {
      arm: triaged.toArm.has(target.number),
      descendants: stackDescendants(
        triaged.stackParents,
        target.number,
      ).flatMap((number) => pullRequests.filter((pr) => pr.number === number)),
    });

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

      return { state: state(mut_skipped), next: 'survey', settled: skipped };
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

      return { state: state(mut_skipped), next: 'survey', settled: skipped };
    }

    const advancedHead = advanced.value.head;

    // The rebase is this run's, not the author's, so a demotion goes with it.
    const demotedNow = followHead(demoted, target.number, advancedHead);

    if (
      (await settleAfterRelease(
        api,
        target,
        triaged.owners,
        pausedAtSurvey,
        defaultBranch,
      )) === 'yielded'
    ) {
      log(
        `#${target.number} was released at the same moment as another, which goes first; paused it again.`,
      );

      return {
        state: state(mut_skipped, demotedNow),
        next: 'survey',
        settled: skipped,
      };
    }

    log(
      `#${target.number} is at ${advancedHead.slice(0, 10)}; waiting for it to merge.`,
    );

    const { ended, head } = await watchAndFix(
      api,
      target,
      advancedHead,
      {
        defaultBranch,
        requiredContexts,
        bypassReason: triaged.bypass.get(target.number),
        autoFixConfig,
      },
      options,
    );

    return {
      state: state(
        applyWatchOutcome(
          mut_skipped,
          { ...target, headRefOid: head },
          baseSha,
          ended,
        ),
        afterWatch(demotedNow, target.number, head, ended.outcome),
        trackAfterWatch(tracked, target.number, ended.outcome),
      ),
      next: ended.outcome === 'stopped' ? 'stop' : 'survey',
      settled: skipped,
    };
  }

  // Nothing to act on, or every candidate failed to rebase or push.
  return { state: state(mut_skipped), next: 'idle', settled: skipped };
};

/**
 * Watches one pull request, and when its checks fail on nothing but a fixer's
 * diff, has `autoFix` push the fix and watches the new head in its place.
 * Resolves to the outcome and the head it was reached on, which is the one a
 * skip record has to name.
 *
 * Once per watch: a head `autoFix` wrote that fails again is a fixer that
 * does not agree with CI, and running it again would only push the same diff.
 * The pull request is set aside as any other failure is, and nothing else
 * failing in the queue is touched — the one being watched is the one this
 * cycle picked.
 */
const watchAndFix = async (
  api: ApiContext,
  pr: PullRequest,
  expectedHead: string,
  context: Readonly<{
    defaultBranch: string;
    requiredContexts: readonly string[];
    /** Set for one only a ruleset bypass merges; see `watch`. */
    bypassReason: string | undefined;
    /** `undefined` under `--no-auto-fix`, or when the repository has none. */
    autoFixConfig: AutoFixConfig | undefined;
  }>,
  options: Options,
): Promise<Readonly<{ ended: Watched; head: string }>> => {
  const ended = await watch(
    api,
    pr,
    expectedHead,
    context.requiredContexts,
    options,
    context.bypassReason,
  );

  if (
    ended.outcome !== 'checks-failed' ||
    context.autoFixConfig === undefined ||
    stopRequested()
  ) {
    return { ended, head: expectedHead };
  }

  const fixed = await autoFix(
    api,
    pr,
    expectedHead,
    context.defaultBranch,
    context.autoFixConfig,
  );

  switch (fixed.kind) {
    case 'declined':
      log(`#${pr.number}: not fixing it here: ${fixed.detail}`);

      return { ended, head: expectedHead };

    case 'moved':
      return { ended: { outcome: 'head-moved' }, head: expectedHead };

    case 'pushed':
      log(
        `#${pr.number}: pushed what ${fixed.commands.join(', ')} wrote as ${fixed.head.slice(0, 10)}; watching it again.`,
      );

      return {
        ended: await watch(
          api,
          pr,
          fixed.head,
          context.requiredContexts,
          options,
          context.bypassReason,
        ),
        head: fixed.head,
      };
  }
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
  api: ApiContext,
  tracked: ReadonlySet<number>,
  pullRequests: readonly PullRequest[],
): Promise<ReadonlySet<number>> => {
  const isOpen = (prNumber: number): boolean =>
    pullRequests.some((pr) => pr.number === prNumber);

  const departed = Array.from(tracked).filter((prNumber) => !isOpen(prNumber));

  const viewed = await Promise.all(
    departed.map(async (prNumber) => ({
      prNumber,
      result: await viewPullRequest(api, prNumber),
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

/**
 * What the issues the open pull requests close add to the merge order. A
 * read that fails holds nothing extra: the declared order and the stacks
 * still stand, and an order inherited from an issue is the one a person can
 * also write into the body.
 */
const issueOrderFor = async (
  api: ApiContext,
  pullRequests: readonly PullRequest[],
): Promise<IssueOrder> => {
  const read = await readIssueOrder(
    api,
    pullRequests.map(({ number }) => number),
  );

  if (Result.isErr(read)) {
    log(
      `Cannot read the issues the pull requests close; inheriting no Start-After this cycle. (${read.value})`,
    );

    return { closes: new Map(), startAfter: new Map() };
  }

  return read.value;
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
      log(
        `#${pr.number}: auto-merge was switched off; it is armed again when next picked, unless ${MERGE_QUEUED_LABEL} comes off.`,
      );

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
        failedChecks: ended.failedChecks,
      });

    case 'awaiting-bypass':
      log(
        `#${pr.number}: green, and left for a ruleset bypass merge; nothing here takes it further until the branch is pushed again or a retry is asked for.`,
      );

      return withSkip(skipped, {
        number: pr.number,
        headSha: pr.headRefOid,
        baseSha,
        reason: 'awaiting-bypass',
        detail: ended.detail ?? 'every required check is green',
      });

    case 'not-merging':
      log(
        `#${pr.number}: every required check reported green and it is still open; something other than the checks holds it that its review does not show — auto-merge armed by someone who may not merge, or a rule this script does not read. It goes last from now on, until someone pushes to it.`,
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
