/** What one survey says about each pull request, and why. */

import {
  findMergeAfterCycles,
  findStackParents,
  MERGE_QUEUED_LABEL,
  parseMergeAfter,
  SKIP_CI_LABEL,
  stackDescendants,
} from 'pr-report-core';
import { Arr, isRecord, Result } from 'ts-data-forge';
import { type StrictPick } from 'ts-type-forge';
import { armsOnPick } from './auto-merge.mjs';
import { listRequiredChecks, summarizeChecks } from './checks.mjs';
import { UNKNOWN_STATE_RETRIES, UNKNOWN_STATE_RETRY_MS } from './constants.mjs';
import {
  git,
  listPullRequests,
  readNativeStack,
  readTimeline,
  remoteSha,
} from './github.mjs';
import { blocksRelease, isMergeQueued, isSkipCiLabelled } from './labels.mjs';
import { waitingOnNote } from './merge-after.mjs';
import { skipStillApplies } from './skips.mjs';
import { nativeStackNote, stackedNote } from './stack.mjs';
import {
  type Classification,
  type PullRequest,
  type Survey,
  type Triage,
  type TriageBase,
  type TriageContext,
} from './types.mjs';
import {
  isSafeRefName,
  lastLines,
  log,
  pause,
  sh,
  stopRequested,
} from './util.mjs';
import { isVersionPullRequest, versionPullRequestHold } from './version-pr.mjs';

/**
 * Lists the open pull requests, re-listing a few times while GitHub is still
 * computing a merge state (`UNKNOWN`) for one that matters.
 */
export const survey = async (
  defaultBranch: string,
): Promise<Result<Survey, string>> => {
  let mut_attempt = 0;

  let mut_listed = await listPullRequests();

  while (
    Result.isOk(mut_listed) &&
    mut_attempt < UNKNOWN_STATE_RETRIES &&
    mut_listed.value.some(
      (pr) =>
        pr.mergeStateStatus === 'UNKNOWN' && isRecord(pr.autoMergeRequest),
    ) &&
    !stopRequested()
  ) {
    mut_attempt += 1;

    log(
      `GitHub is still computing a merge state; re-listing (${mut_attempt}/${UNKNOWN_STATE_RETRIES}).`,
    );

    await pause(UNKNOWN_STATE_RETRY_MS);

    mut_listed = await listPullRequests();
  }

  if (Result.isErr(mut_listed)) {
    return mut_listed;
  }

  const baseSha = await remoteSha(defaultBranch);

  if (Result.isErr(baseSha)) {
    return baseSha;
  }

  return Result.ok({
    pullRequests: mut_listed.value,
    baseSha: baseSha.value,
    requiredContexts: await listRequiredContexts(defaultBranch),
  });
};

/**
 * The contexts the ruleset requires on the default branch, as GitHub reports
 * them, deduplicated across rulesets.
 *
 * This is what lets "green" mean the whole list rather than the part of it
 * that has reported. A required context with no check run on the head commit
 * is not pending in `gh pr checks` — it is absent from it — so a pull request
 * three minutes into a twenty-five minute matrix looks finished without this.
 *
 * A repository whose rules cannot be read gives an empty list, and the watch
 * falls back to judging by what has reported, on a longer leash.
 */
const listRequiredContexts = async (
  branch: string,
): Promise<readonly string[]> => {
  const listed = await git(
    [
      'gh api',
      // Joined rather than interpolated: `gh` fills the `{owner}` and
      // `{repo}` placeholders in, and a template literal holding them is
      // indistinguishable from a mistyped one to `unicorn`.
      sh(['repos', '{owner}', '{repo}', 'rules', 'branches', branch].join('/')),
      '--jq',
      sh(
        '.[] | select(.type == "required_status_checks") | .parameters.required_status_checks[].context',
      ),
    ].join(' '),
  );

  if (Result.isErr(listed)) {
    log(
      `Cannot read the required checks for ${branch}; judging by what has reported. (${lastLines(listed.value, 2)})`,
    );

    return [];
  }

  return Arr.uniq(
    listed.value
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== ''),
  );
};

export const triage = async (
  pullRequests: readonly PullRequest[],
  base: TriageBase,
): Promise<Triage> => {
  const sorted = pullRequests.toSorted((a, b) => a.number - b.number);

  const stackParents = findStackParents(
    sorted.map((pr) => ({
      number: pr.number,
      headRef: pr.headRefName,
      baseRef: pr.baseRefName,
      fromFork: pr.isCrossRepository,
    })),
    base.defaultBranch,
  );

  const dependencies: ReadonlyMap<number, readonly number[]> = new Map(
    sorted.map((pr) => {
      const parent = stackParents.get(pr.number);

      return [
        pr.number,
        // The version pull request declares nothing: its body is rewritten
        // on every push to the base, so a trailer written there would hold
        // for a cycle or two and then silently stop. `blocks-release`, on
        // the pull requests it is waiting for, is how an order is declared
        // on it. Other pull requests may still name *it*. A stacked pull
        // request waits for the layer below it whether or not it says so.
        isVersionPullRequest(pr, base.defaultBranch)
          ? []
          : Arr.uniq([
              ...(parent === undefined ? [] : [parent]),
              ...parseMergeAfter(pr.body),
            ]),
      ] as const;
    }),
  );

  const cycles = findMergeAfterCycles(dependencies);

  const context: TriageContext = {
    ...base,
    openNumbers: new Set(sorted.map((pr) => pr.number)),
    dependencies,
    stackParents,
    cyclic: new Set(cycles.flat()),
    releaseBlockers: sorted.filter(blocksRelease),
  } as const;

  const classified = await Promise.all(
    sorted.map(async (pr) => ({ pr, result: await classify(pr, context) })),
  );

  return {
    cycles,
    inScope: classified.filter(({ result }) => result.kind !== 'ignore').length,
    // Lowest number first — the declared order has already been applied, as a
    // gate rather than a sort — but the ones GitHub only *thinks* conflict go
    // last: a rebase this script is sure of is worth spending the cycle on
    // before one it is guessing at. `toSorted` is stable, so the numbers keep
    // their order within each group.
    candidates: classified
      .filter(({ result }) => result.kind === 'candidate')
      .map(({ pr }) => pr)
      .toSorted(
        (a, b) =>
          candidateRank(a, base.defaultBranch) -
          candidateRank(b, base.defaultBranch),
      ),
    // Anything this cycle may pick — a candidate, or one in flight — that
    // has no auto-merge yet. `classify` has already set aside the ones a
    // person disarmed.
    toArm: new Set(
      classified.flatMap(({ pr, result }) =>
        (result.kind === 'candidate' || result.kind === 'in-flight') &&
        !isRecord(pr.autoMergeRequest)
          ? [pr.number]
          : [],
      ),
    ),
    stackParents,
    inFlight: classified
      .filter(({ result }) => result.kind === 'in-flight')
      .map(({ pr }) => pr),
    failing: classified.flatMap(({ pr, result }) =>
      result.kind === 'failing' ? [{ pr, summary: result.summary }] : [],
    ),
    notes: classified.flatMap(({ result }) =>
      result.kind === 'note' ? [result.note] : [],
    ),
  };
};

const classify = async (
  pr: PullRequest,
  context: TriageContext,
): Promise<Classification> => {
  const outOfScope = outOfScopeReason(pr, context);

  if (outOfScope !== undefined) {
    // `merge-queued` is an explicit request, so anything that answers it with
    // "no" is worth saying out loud — a queued pull request left as a draft,
    // or without auto-merge, would otherwise sit in the queue forever with
    // nothing saying why. A pull request that never asked is passed over in
    // silence.
    return isMergeQueued(pr)
      ? { kind: 'note', note: `#${pr.number}: ${outOfScope}` }
      : { kind: 'ignore' };
  }

  const skip = context.skipped.get(pr.number);

  if (skip !== undefined && skipStillApplies(skip, pr, context.baseSha)) {
    return {
      kind: 'note',
      note: `#${pr.number}: skipped (${skip.reason}: ${skip.detail}) until ${
        skip.reason === 'checks-failed'
          ? 'the branch is pushed again'
          : `the branch is pushed again or ${context.defaultBranch} moves`
      }`,
    };
  }

  // A layer of a stack: its turn comes when GitHub moves it onto the default
  // branch, which is when the one below it merges. Until then there is
  // nothing to rebase it onto but that layer, which this script does when it
  // moves that layer. See `stack.mts`.
  const parent = context.stackParents.get(pr.number);

  if (parent !== undefined) {
    return stackedNote(pr, parent, context);
  }

  // Nothing here merges anything — auto-merge does, once the checks are
  // green — but this script is what arms it, when it picks a queued pull
  // request (`auto-merge.mts`). One a person disarmed after queueing it is
  // passed over until they queue it again, and one in a native stack, which
  // GitHub will not let anything arm, until someone merges it by hand.
  if (!isRecord(pr.autoMergeRequest)) {
    const nativeStacked = await inNativeStack(pr);

    if (nativeStacked !== undefined) {
      return nativeStacked;
    }

    const disarmed = await disarmedByHand(pr);

    if (disarmed !== undefined) {
      return disarmed;
    }
  }

  // The version pull request is derived state, rebuilt from the tip of the
  // base and force-pushed by the release workflow on every push to it, so
  // nothing here rebases it: that would be two things force-pushing one
  // branch, and a rebase puts the old version commit on a tip carrying a
  // changeset it never consumed — a release missing the change the queue was
  // assembled for. Taking `skip-ci` off is the whole of what it can be given.
  if (isVersionPullRequest(pr, context.defaultBranch)) {
    const held = await versionPullRequestHold(pr, context);

    if (held !== undefined) {
      return held;
    }

    // Nothing holds it. Paused means there is a label to take off; otherwise
    // it is already on its way and auto-merge owns it, exactly as with
    // anything else that is up to date.
    return isSkipCiLabelled(pr)
      ? { kind: 'candidate' }
      : classifyByChecks(pr, context);
  }

  // `skip-ci` makes the merge state say nothing useful: `no-skip-ci-label` is
  // pending, so the pull request is `BLOCKED` however ready it is, and checks
  // that were skipped look exactly like checks still running. Taking the
  // label off is the action, so this is a candidate whatever GitHub says
  // about it.
  if (isSkipCiLabelled(pr)) {
    return waitingOnNote(pr, context) ?? { kind: 'candidate' };
  }

  switch (pr.mergeStateStatus) {
    // `DIRTY` is a candidate too, rather than something handed straight back.
    // It answers a different question from the one this script asks: whether
    // *merging* the branch into the base conflicts, three-way from the merge
    // base, where a rebase replays each commit onto the current tip and drops
    // the ones already upstream. And it is an asynchronously computed, cached
    // answer, so it is regularly stale — a force-push, or a base that has
    // just moved, leaves the old verdict standing. Both are common enough
    // here that taking `DIRTY` at its word set branches aside for conflicts
    // they did not have. So try the rebase and let it answer: when the
    // conflict is real, the rebase is aborted, the worktree thrown away and
    // the pull request skipped exactly as before.
    case 'BEHIND':
    case 'DIRTY':
      return waitingOnNote(pr, context) ?? { kind: 'candidate' };

    case 'CLEAN':
    case 'HAS_HOOKS':
    case 'UNSTABLE':
      return { kind: 'in-flight' };

    case 'BLOCKED':
      return classifyByChecks(pr, context);

    default:
      return {
        kind: 'note',
        note: `#${pr.number}: merge state ${pr.mergeStateStatus}`,
      };
  }
};

/**
 * The note to report instead of picking a pull request in one of GitHub's
 * native stacks (`stack.mts`). One whose stack cannot be read is picked, and
 * GitHub's refusal to arm it, should it come, sets it aside.
 */
const inNativeStack = async (
  pr: PullRequest,
): Promise<Classification | undefined> => {
  const entry = await readNativeStack(pr.number);

  if (Result.isErr(entry)) {
    log(
      `#${pr.number}: cannot read whether it is in a native stack; treating it as in none. (${lastLines(entry.value, 2)})`,
    );

    return undefined;
  }

  return nativeStackNote(pr, entry.value);
};

/**
 * The note to report instead of picking a queued pull request without
 * auto-merge, when a person switched it off after queueing it; `undefined`
 * when this script may arm it. A timeline that cannot be read is not taken as
 * permission.
 */
const disarmedByHand = async (
  pr: PullRequest,
): Promise<Classification | undefined> => {
  const events = await readTimeline(pr.number);

  if (Result.isErr(events)) {
    return {
      kind: 'note',
      note: `#${pr.number}: no auto-merge, and could not read whether someone switched it off (${lastLines(events.value, 2)})`,
    };
  }

  return armsOnPick(events.value)
    ? undefined
    : {
        kind: 'note',
        note: `#${pr.number}: auto-merge was switched off by hand after it was queued; take ${MERGE_QUEUED_LABEL} off and put it back to queue it again`,
      };
};

/**
 * What a pull request nothing here can move is doing: waiting on its checks,
 * or held by one that failed.
 *
 * Reached from `BLOCKED`, and from the version pull request whatever its
 * merge state — with the branch already on the tip of the base and no label
 * to take off, there is nothing left to do to either but watch.
 */
const classifyByChecks = async (
  pr: PullRequest,
  context: TriageContext,
): Promise<Classification> => {
  const checks = await listRequiredChecks(pr.number);

  if (Result.isErr(checks)) {
    return {
      kind: 'note',
      note: `#${pr.number}: could not read checks: ${checks.value}`,
    };
  }

  // Checks still running only decide between pending and passed, and both
  // are in flight here, so they are not asked for.
  const summary = summarizeChecks(checks.value, context.requiredContexts, []);

  // Pending — including a required context that has not reported at all — or
  // green and about to merge. A green one that stays open is caught by the
  // watch.
  return summary.status === 'failed'
    ? { kind: 'failing', summary }
    : { kind: 'in-flight' };
};

/**
 * Whether GitHub says merging this pull request into the base conflicts. It
 * is a candidate all the same — see the `DIRTY` case in `classify` — but a
 * less promising one, so it is reported and ordered apart from the rest.
 */
const isConflicting = (pr: PullRequest): boolean =>
  pr.mergeStateStatus === 'DIRTY';

/**
 * Where a candidate sits in the cycle's order, lowest first. Within a rank
 * the numbers keep their order, because `toSorted` is stable.
 *
 * The version pull request goes last. This is an ordering rather than the
 * gate — `blocks-release` is the gate — so it never stops a release: it only
 * says that when a queued change and the release are both ready, the change
 * goes first. The alternative is releasing, then rebuilding the version pull
 * request for a second release of the very thing that was already queued.
 */
const candidateRank = (pr: PullRequest, defaultBranch: string): number =>
  isVersionPullRequest(pr, defaultBranch) ? 2 : isConflicting(pr) ? 1 : 0;

export const reportTriage = (
  triaged: Triage,
  total: number,
  defaultBranch: string,
): void => {
  const paused = triaged.candidates.filter(isSkipCiLabelled).length;

  log(
    `${total} open pull request(s), ${triaged.inScope} labelled ${MERGE_QUEUED_LABEL}: ${triaged.candidates.length} to act on (${paused} paused by ${SKIP_CI_LABEL}), ${triaged.inFlight.length} in flight, ${triaged.failing.length} failing.`,
  );

  for (const cycle of triaged.cycles) {
    if (!Arr.isNonEmpty(cycle)) {
      continue;
    }

    log(
      `  Merge-After cycle: ${[...cycle, cycle[0]].map((number) => `#${number}`).join(' → ')}`,
    );
  }

  for (const note of triaged.notes) {
    log(`  ${note}`);
  }

  for (const { pr, summary } of triaged.failing) {
    log(
      `  #${pr.number}: up to date but failing: ${summary.failed.map((check) => check.name).join(', ')}`,
    );
  }

  for (const [position, pr] of triaged.candidates.entries()) {
    log(
      `  #${pr.number}: ${position === 0 ? 'next' : `${position} ahead of it`} — ${describeAction(pr, defaultBranch, triaged)} — ${pr.title}`,
    );
  }
};

/** What this cycle is about to do to a pull request, as a phrase. */
export const describeAction = (
  pr: PullRequest,
  defaultBranch: string,
  triaged: StrictPick<Triage, 'stackParents' | 'toArm'>,
): string => {
  if (isVersionPullRequest(pr, defaultBranch)) {
    return `take ${SKIP_CI_LABEL} off it — the release workflow owns the branch`;
  }

  const above = stackDescendants(triaged.stackParents, pr.number);

  return [
    `rebase onto ${defaultBranch}`,
    isConflicting(pr)
      ? ', which GitHub says conflicts — a rebase will say'
      : '',
    Arr.isNonEmpty(above)
      ? `, carry ${above.map((n) => `#${n}`).join(', ')} stacked on it along`
      : '',
    triaged.toArm.has(pr.number) ? ', arm auto-merge' : '',
    isSkipCiLabelled(pr) ? `, then take ${SKIP_CI_LABEL} off it` : '',
  ].join('');
};

/** Why a pull request is none of this script's business, if it is not. */
const outOfScopeReason = (
  pr: PullRequest,
  context: TriageContext,
): string | undefined => {
  if (pr.state !== 'OPEN') {
    return `state is ${pr.state}`;
  }

  // First, so that everything after it is a reason reported only for a pull
  // request that asked. `merge-queued` is the whole of the scope rule: it is
  // the author saying this one is reviewed and is to be landed, which is a
  // different statement from auto-merge, and one no bot makes by accident.
  if (!isMergeQueued(pr)) {
    return `not labelled ${MERGE_QUEUED_LABEL}`;
  }

  // A base that is neither the default branch nor another open pull
  // request's branch is one nothing here knows how to land on. A stacked one
  // whose parent has just merged reads this way for the moment before GitHub
  // moves it.
  return pr.isDraft
    ? 'draft'
    : pr.baseRefName !== context.defaultBranch &&
        !context.stackParents.has(pr.number)
      ? `base is ${pr.baseRefName}, which no open pull request is from`
      : !isSafeRefName(pr.headRefName)
        ? `branch name ${JSON.stringify(pr.headRefName)} will not be passed to a shell`
        : undefined;
};
