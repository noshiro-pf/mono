/** What one survey says about each pull request, and why. */

import {
  findMergeAfterCycles,
  MERGE_QUEUED_LABEL,
  parseCodeOwners,
  parseMergeAfter,
  SKIP_CI_LABEL,
  type RulesetRequirements,
} from 'pr-report-core';
import { Arr, isRecord, Result } from 'ts-data-forge';
import {
  isMergeableState,
  listRequiredChecks,
  summarizeChecks,
} from './checks.mjs';
import { UNKNOWN_STATE_RETRIES, UNKNOWN_STATE_RETRY_MS } from './constants.mjs';
import { isDemoted } from './demotions.mjs';
import {
  listPullRequests,
  readBranchRules,
  readReviewStates,
  remoteSha,
} from './github.mjs';
import { blocksRelease, isMergeQueued, isSkipCiLabelled } from './labels.mjs';
import { waitingOnNote } from './merge-after.mjs';
import { reviewHold } from './review.mjs';
import { skipStillApplies } from './skips.mjs';
import {
  type Classification,
  type Demotions,
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

  const rules = await readRules(defaultBranch);

  return Result.ok({
    pullRequests: mut_listed.value,
    baseSha: baseSha.value,
    requiredContexts: rules.requiredContexts,
    reviewRequirements: {
      requireCodeOwnerReview: rules.requireCodeOwnerReview,
      requireConversationResolution: rules.requireConversationResolution,
    },
  });
};

/**
 * What the rules on the default branch require, as GitHub applies them.
 *
 * The required contexts are what let "green" mean the whole list rather than
 * the part of it that has reported. A required context with no check run on
 * the head commit is not pending in `gh pr checks` — it is absent from it —
 * so a pull request three minutes into a twenty-five minute matrix looks
 * finished without them. The review rules are what `review.mts` asks about.
 *
 * Rules that cannot be read require nothing: the watch falls back to judging
 * by what has reported, on a longer leash, and no review holds anything.
 */
const readRules = async (branch: string): Promise<RulesetRequirements> => {
  const rules = await readBranchRules(branch);

  if (Result.isErr(rules)) {
    log(
      `Cannot read the rules for ${branch}; judging by the checks that have reported, and holding nothing for review. (${lastLines(rules.value, 2)})`,
    );

    return {
      requiredContexts: [],
      requireCodeOwnerReview: false,
      requireConversationResolution: false,
    };
  }

  return rules.value;
};

export const triage = async (
  pullRequests: readonly PullRequest[],
  base: TriageBase,
): Promise<Triage> => {
  const sorted = pullRequests.toSorted((a, b) => a.number - b.number);

  const dependencies: ReadonlyMap<number, readonly number[]> = new Map(
    sorted.map(
      (pr) =>
        [
          pr.number,
          // The version pull request declares nothing: its body is rewritten
          // on every push to the base, so a trailer written there would hold
          // for a cycle or two and then silently stop. `blocks-release`, on
          // the pull requests it is waiting for, is how an order is declared
          // on it. Other pull requests may still name *it*.
          isVersionPullRequest(pr, base.defaultBranch)
            ? []
            : parseMergeAfter(pr.body),
        ] as const,
    ),
  );

  const cycles = findMergeAfterCycles(dependencies);

  const context: TriageContext = {
    ...base,
    openNumbers: new Set(sorted.map((pr) => pr.number)),
    dependencies,
    cyclic: new Set(cycles.flat()),
    releaseBlockers: sorted.filter(blocksRelease),
  } as const;

  const beforeReview = await Promise.all(
    sorted.map(async (pr) => ({ pr, result: await classify(pr, context) })),
  );

  const holds = await readReviewHolds(
    beforeReview.filter(({ pr, result }) => shouldAskReview(pr, result)),
    context,
  );

  const classified = beforeReview.map(({ pr, result }) => {
    const reason = holds.get(pr.number);

    return {
      pr,
      result:
        reason === undefined
          ? result
          : ({ kind: 'held', reason } satisfies Classification),
    };
  });

  return {
    cycles,
    inScope: classified.filter(({ result }) => result.kind !== 'ignore').length,
    candidates: orderCandidates(
      classified
        .filter(({ result }) => result.kind === 'candidate')
        .map(({ pr }) => pr),
      base,
    ),
    inFlight: classified
      .filter(({ result }) => result.kind === 'in-flight')
      .map(({ pr }) => pr),
    held: classified.flatMap(({ pr, result }) =>
      result.kind === 'held'
        ? [
            `#${pr.number}: held by its review — ${result.reason}; nothing is run until that changes`,
          ]
        : [],
    ),
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
 * Whether what triage decided about a pull request is worth asking its
 * review about: one it is about to pick, or one it is about to watch while
 * GitHub still calls it `BLOCKED`. A merge state GitHub already calls
 * mergeable is its own answer that nothing but the checks is left, so that
 * one is watched as ever.
 */
const shouldAskReview = (pr: PullRequest, result: Classification): boolean =>
  result.kind === 'candidate' ||
  (result.kind === 'in-flight' && !isMergeableState(pr.mergeStateStatus));

/**
 * Why each pull request's review holds it, by number, for those it holds —
 * `review.mts` says what is asked and why. One request covers all of them.
 * A request that fails holds nothing, which is how this script behaved
 * before it asked.
 */
const readReviewHolds = async (
  entries: readonly Readonly<{ pr: PullRequest }>[],
  context: TriageContext,
): Promise<ReadonlyMap<number, string>> => {
  const { requireCodeOwnerReview, requireConversationResolution } =
    context.reviewRequirements;

  if (
    !Arr.isNonEmpty(entries) ||
    (!requireCodeOwnerReview && !requireConversationResolution)
  ) {
    return new Map();
  }

  const read = await readReviewStates(
    entries.map(({ pr }) => pr.number),
    context.defaultBranch,
  );

  if (Result.isErr(read)) {
    log(
      `Cannot read the reviews; holding nothing for them. (${lastLines(read.value, 2)})`,
    );

    return new Map();
  }

  const rules = {
    requireCodeOwnerReview,
    requireConversationResolution,
    codeOwners:
      read.value.codeOwners === undefined
        ? ([] as const)
        : parseCodeOwners(read.value.codeOwners),
  } as const;

  return new Map(
    Array.from(read.value.states).flatMap(([prNumber, state]) => {
      const hold = reviewHold(state, rules);

      return hold === undefined ? [] : [[prNumber, hold] as const];
    }),
  );
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

  const summary = summarizeChecks(checks.value, context.requiredContexts);

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
 * The cycle's order. The declared order has already been applied, as a gate
 * rather than a sort, so this is lowest number first within four ranks:
 *
 * 1. The rest.
 * 2. What GitHub only *thinks* conflicts: a rebase this script is sure of is
 *    worth spending the cycle on before one it is guessing at.
 * 3. The version pull request. This is an ordering rather than the gate —
 *    `blocks-release` is the gate — so it never stops a release: it only says
 *    that when a queued change and the release are both ready, the change
 *    goes first. The alternative is releasing, then rebuilding the version
 *    pull request for a second release of the very thing that was already
 *    queued.
 * 4. What a watch has seen green and still open (`demotions.mts`), after the
 *    release too: the release is known to be able to merge, and this is
 *    known to have sat without merging.
 *
 * `toSorted` is stable, so the numbers keep their order within each rank.
 */
export const orderCandidates = (
  candidates: readonly PullRequest[],
  context: Readonly<{ defaultBranch: string; demoted: Demotions }>,
): readonly PullRequest[] =>
  candidates
    .toSorted((a, b) => a.number - b.number)
    .toSorted((a, b) => candidateRank(a, context) - candidateRank(b, context));

const candidateRank = (
  pr: PullRequest,
  context: Readonly<{ defaultBranch: string; demoted: Demotions }>,
): number =>
  isDemoted(context.demoted, pr)
    ? 3
    : isVersionPullRequest(pr, context.defaultBranch)
      ? 2
      : isConflicting(pr)
        ? 1
        : 0;

export const reportTriage = (
  triaged: Triage,
  total: number,
  context: Readonly<{ defaultBranch: string; demoted: Demotions }>,
): void => {
  const { defaultBranch } = context;

  const paused = triaged.candidates.filter(isSkipCiLabelled).length;

  log(
    `${total} open pull request(s), ${triaged.inScope} labelled ${MERGE_QUEUED_LABEL}: ${triaged.candidates.length} to act on (${paused} paused by ${SKIP_CI_LABEL}), ${triaged.inFlight.length} in flight, ${triaged.failing.length} failing, ${triaged.held.length} held by review.`,
  );

  for (const cycle of triaged.cycles) {
    if (!Arr.isNonEmpty(cycle)) {
      continue;
    }

    log(
      `  Merge-After cycle: ${[...cycle, cycle[0]].map((number) => `#${number}`).join(' → ')}`,
    );
  }

  for (const held of triaged.held) {
    log(`  ${held}`);
  }

  for (const note of triaged.notes) {
    log(`  ${note}`);
  }

  for (const { pr, summary } of triaged.failing) {
    log(
      `  #${pr.number}: up to date but failing: ${summary.failed.join(', ')}`,
    );
  }

  for (const [position, pr] of triaged.candidates.entries()) {
    log(
      `  #${pr.number}: ${position === 0 ? 'next' : `${position} ahead of it`} — ${describeAction(pr, defaultBranch)}${isDemoted(context.demoted, pr) ? ' — last, because it sat green without merging' : ''} — ${pr.title}`,
    );
  }
};

/** What this cycle is about to do to a pull request, as a phrase. */
export const describeAction = (
  pr: PullRequest,
  defaultBranch: string,
): string =>
  isVersionPullRequest(pr, defaultBranch)
    ? (`take ${SKIP_CI_LABEL} off it — the release workflow owns the branch` as const)
    : [
        `rebase onto ${defaultBranch}`,
        isConflicting(pr)
          ? ', which GitHub says conflicts — a rebase will say'
          : '',
        isSkipCiLabelled(pr) ? `, then take ${SKIP_CI_LABEL} off it` : '',
      ].join('');

/** Why a pull request is none of this script's business, if it is not. */
const outOfScopeReason = (
  pr: PullRequest,
  context: TriageBase,
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

  // Nothing here merges anything — auto-merge does, once the checks are
  // green. A queued pull request without it would be released from
  // `skip-ci`, go green, and sit there.
  return !isRecord(pr.autoMergeRequest)
    ? 'auto-merge is not enabled'
    : pr.isDraft
      ? 'draft'
      : pr.baseRefName !== context.defaultBranch
        ? `base is ${pr.baseRefName}`
        : !isSafeRefName(pr.headRefName)
          ? `branch name ${JSON.stringify(pr.headRefName)} will not be passed to a shell`
          : undefined;
};
