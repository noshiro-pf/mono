/** What one survey says about each pull request, and why. */

import {
  asksReview,
  codeOwnerGate,
  codeOwnerReviewOf,
  codeOwnersEnforcedBy,
  MERGE_QUEUED_LABEL,
  orderCandidates as orderQueueCandidates,
  parseCodeOwners,
  PRIORITY_HIGH_LABEL,
  PRIORITY_LOW_LABEL,
  pushersMatter,
  queueGraph,
  queueStanding,
  reviewHold,
  SKIP_CI_LABEL,
  stackDescendants,
  withReviewHold,
  type CodeOwnerReview,
  type QueueFacts,
  type QueueOwner,
  type QueueReads,
  type QueueStanding,
  type ReviewHold,
  type RulesetRequirements,
} from 'pr-report-core';
import { Arr, isRecord, Result } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import { currentEpochMs, log, type ApiContext } from '../lib/index.mjs';
import { readHeadChecks, summarizeChecks } from './checks.mjs';
import {
  REVIEW_HEAD_RETRIES,
  REVIEW_HEAD_RETRY_MS,
  UNKNOWN_STATE_RETRIES,
  UNKNOWN_STATE_RETRY_MS,
} from './constants.mjs';
import { isDemoted } from './demotions.mjs';
import {
  listPullRequests,
  readBranchRules,
  readNativeStack,
  readPushers,
  readReviewStates,
  remoteBranchTips,
  remoteSha,
} from './github.mjs';
import { isSkipCiLabelled, priorityOf } from './labels.mjs';
import { waitingOnNote } from './merge-after.mjs';
import { ownerNote, ownerOf } from './owner.mjs';
import { nativeStackNote, stackedNote } from './stack.mjs';
import type {
  ChecksSummary,
  Classification,
  Demotions,
  OutOfSync,
  OutOfSyncSighting,
  PullRequest,
  ReviewStateAt,
  Survey,
  Triage,
  TriageBase,
  TriageContext,
} from './types.mjs';
import type { UnreadRead } from './unread.mjs';
import { lastLines, pause, stopRequested } from './util.mjs';
import {
  isRebuiltOnBaseTip,
  isVersionPullRequest,
  releaseBlockedNote,
  releaseStaleNote,
} from './version-pr.mjs';

/**
 * Lists the open pull requests, re-listing a few times while GitHub is still
 * computing a merge state (`UNKNOWN`) for one that matters
 * ({@link awaitsMergeState}). With them, the armed ones GitHub shows as
 * `UNKNOWN` whose branch is somewhere else ({@link outOfSyncAtSurvey}), which
 * the cycle records and sets aside once the mismatch has lasted
 * (`out-of-sync.mts`). `seen` is what earlier surveys recorded.
 */
export const survey = async (
  api: ApiContext,
  defaultBranch: string,
  seen: OutOfSync = new Map<number, OutOfSyncSighting>(),
): Promise<Result<Survey, string>> => {
  let mut_attempt = 0;

  let mut_listed = await listWithBranches(api);

  while (
    Result.isOk(mut_listed) &&
    mut_attempt < UNKNOWN_STATE_RETRIES &&
    awaitsAny(mut_listed.value, seen) &&
    !stopRequested()
  ) {
    mut_attempt += 1;

    log(
      `GitHub is still computing a merge state; re-listing (${mut_attempt}/${UNKNOWN_STATE_RETRIES}).`,
    );

    await pause(UNKNOWN_STATE_RETRY_MS);

    mut_listed = await listWithBranches(api);
  }

  if (Result.isErr(mut_listed)) {
    return mut_listed;
  }

  const baseSha = await remoteSha(defaultBranch);

  if (Result.isErr(baseSha)) {
    return baseSha;
  }

  const rules = await readRules(api, defaultBranch);

  return Result.ok({
    pullRequests: mut_listed.value.pullRequests,
    outOfSync: outOfSyncAtSurvey(
      mut_listed.value.pullRequests,
      mut_listed.value.branchTips,
    ),
    baseSha: baseSha.value,
    requiredContexts: rules.requiredContexts,
    reviewRequirements: {
      requireCodeOwnerReview: rules.requireCodeOwnerReview,
      requireConversationResolution: rules.requireConversationResolution,
      requiredContexts: rules.requiredContexts,
    },
  });
};

/**
 * Whether a survey re-lists for `pr`: armed, so its merge state is what decides
 * whether it merges, and `UNKNOWN` — unless its branch (`branchAt`, `undefined`
 * when unread) is not at the head GitHub shows, and an earlier survey found it
 * at the same place (`seen`). Then GitHub dropped the branch's last push, its
 * state stays unknown for as long as that lasts, and re-listing would only
 * delay every survey until a person pushes, whether or not it has been set
 * aside yet and wherever it stands in the queue.
 *
 * The first survey to find a mismatch still waits: a push GitHub has yet to
 * take in looks the same for a few seconds, and that wait is what keeps a
 * released pull request from being read as anything but in flight.
 */
export const awaitsMergeState = (
  pr: PullRequest,
  branchAt: string | undefined,
  seen: OutOfSync,
): boolean => {
  const sighting = seen.get(pr.number);

  return (
    isArmedUnknown(pr) &&
    (branchAt === undefined ||
      branchAt === pr.headRefOid ||
      sighting?.headSha !== pr.headRefOid ||
      sighting.branchSha !== branchAt)
  );
};

/**
 * The armed pull requests GitHub shows as `UNKNOWN` whose branch is not at the
 * head GitHub shows, with where it is instead.
 */
export const outOfSyncAtSurvey = (
  pullRequests: readonly PullRequest[],
  branchTips: ReadonlyMap<string, string>,
): Survey['outOfSync'] =>
  Arr.generate(function* () {
    for (const pr of pullRequests) {
      const branchAt = branchTipOf(pr, branchTips);

      if (
        branchAt !== undefined &&
        branchAt !== pr.headRefOid &&
        isArmedUnknown(pr)
      ) {
        yield { pr, branchAt } as const;
      }
    }
  });

export const triage = async (
  api: ApiContext,
  pullRequests: readonly PullRequest[],
  base: TriageBase,
): Promise<Triage> => {
  const sorted = pullRequests.toSorted((a, b) => a.number - b.number);

  // The stacks, the declared order and what holds the release, as every reader
  // of the queue reads them (`pr-report-core`'s `queue-order.mts`).
  const graph = queueGraph(
    sorted.map((pr) => ({
      number: pr.number,
      body: pr.body,
      isDraft: pr.isDraft,
      labels: pr.labels.map(({ name }) => name),
      headRef: pr.headRefName,
      baseRef: pr.baseRefName,
      fromFork: pr.isCrossRepository,
      closes: base.issueOrder.closes.get(pr.number) ?? [],
    })),
    base.defaultBranch,
    base.issueOrder.startAfter,
  );

  // Who moves each one next, by the rule every reader of the queue shares
  // (`owner.mts`). Only the worker's are triaged further.
  const nowEpochMs = currentEpochMs();

  const owners: ReadonlyMap<number, QueueOwner> = new Map(
    Arr.generate(function* () {
      for (const pr of sorted) {
        const owner = ownerOf(pr, {
          defaultBranch: base.defaultBranch,
          skipped: base.skipped,
          claimed: base.claimed,
          stackParents: graph.stackParents,
          cyclic: graph.cyclic,
          nowEpochMs,
        });

        if (owner !== undefined) {
          yield [pr.number, owner] as const;
        }
      }
    }),
  );

  const context: TriageContext = { ...base, ...graph, owners } as const;

  const beforeReview = await Promise.all(
    sorted.map(async (pr) => ({ pr, ...(await settle(api, pr, context)) })),
  );

  // A failing one too, but only where a required check enforces `CODEOWNERS`:
  // the check is red until an owner approves, and its review says which.
  const { holds, codeOwnerStates, codeOwnersCheck } = await readReviewHolds(
    api,
    beforeReview
      .filter(({ pr, standing }) => asksReview(standing, pr.mergeStateStatus))
      .map(({ pr }) => pr.number),
    // Only one red context can be that check alone (`codeOwnersClassification`).
    beforeReview
      .filter(
        ({ standing, summary }) =>
          standing.kind === 'failing' && summary?.failed.length === 1,
      )
      .map(({ pr }) => pr.number),
    context,
  );

  const classified = beforeReview.map(({ pr, standing, unread, summary }) => ({
    pr,
    result:
      unread?.note ??
      codeOwnersClassification(
        summary,
        codeOwnersCheck,
        reviewOf(pr.number, holds, codeOwnerStates),
      ) ??
      classification(
        pr,
        withReviewHold(standing, pr.mergeStateStatus, holds.get(pr.number)),
        summary,
        context,
      ),
  }));

  // Released and watched as ever, but never armed: auto-merge would wait for an
  // approval nobody may give. See `review-hold.mts` in `pr-report-core`.
  const bypass: ReadonlyMap<number, string> = new Map(
    Arr.generate(function* () {
      for (const [prNumber, hold] of Array.from(holds)) {
        if (hold.kind === 'bypass') {
          yield [prNumber, hold.reason] as const;
        }
      }
    }),
  );

  return {
    cycles: graph.cycles,
    owners,
    inScope: classified.filter(({ result }) => result.kind !== 'ignore').length,
    candidates: orderCandidates(
      classified
        .filter(({ result }) => result.kind === 'candidate')
        .map(({ pr }) => pr),
      { ...base, bypass },
    ),
    // Anything this cycle may pick — a candidate, or one in flight — that has
    // no auto-merge yet, however it came to have none: `merge-queued` is the
    // one thing that says whether a pull request may merge.
    toArm: new Set(
      Arr.generate(function* () {
        for (const { pr, result } of classified) {
          if (
            (result.kind === 'candidate' || result.kind === 'in-flight') &&
            !isRecord(pr.autoMergeRequest) &&
            !bypass.has(pr.number)
          ) {
            yield pr.number;
          }
        }
      }),
    ),
    bypass,
    stackParents: graph.stackParents,
    inFlight: classified
      .filter(({ result }) => result.kind === 'in-flight')
      .map(({ pr }) => pr),
    // Only a pull request without `skip-ci` has its checks read, so one whose
    // read failed is released and may be running its matrix.
    unreadReleased: Arr.generate(function* () {
      for (const { pr, unread } of beforeReview) {
        if (unread !== undefined && !isSkipCiLabelled(pr)) {
          yield {
            pr,
            read: unread.read,
            detail:
              unread.note.kind === 'note'
                ? unread.note.note
                : `#${pr.number}: could not be read`,
          } as const;
        }
      }
    }),
    held: Arr.generate(function* () {
      for (const { pr, result } of classified) {
        if (result.kind === 'held') {
          yield `#${pr.number}: held by its review — ${result.reason}; nothing is run until that changes`;
        }
      }
    }),
    failing: Arr.generate(function* () {
      for (const { pr, result } of classified) {
        if (result.kind === 'failing') {
          yield { pr, summary: result.summary };
        }
      }
    }),
    rerun: Arr.generate(function* () {
      for (const { pr, result } of classified) {
        if (result.kind === 'rerun') {
          yield { pr, link: result.link, summary: result.summary };
        }
      }
    }),
    codeOwnersCheck,
    awaitingBypass: Arr.generate(function* () {
      for (const { pr, result } of classified) {
        if (result.kind === 'awaiting-bypass') {
          yield { pr, reason: result.reason };
        }
      }
    }),
    notes: Arr.generate(function* () {
      for (const { result } of classified) {
        if (result.kind === 'note') {
          yield result.note;
        }
      }
    }),
  };
};

/**
 * The cycle's order: `pr-report-core`'s `orderCandidates`, which says why, with
 * what this run has demoted (`demotions.mts`) and what only a bypass merges.
 */
export const orderCandidates = (
  candidates: readonly PullRequest[],
  context: Readonly<{
    defaultBranch: string;
    demoted: Demotions;
    bypass: ReadonlyMap<number, string>;
  }>,
): readonly PullRequest[] =>
  orderQueueCandidates(candidates, factsOf, {
    defaultBranch: context.defaultBranch,
    demoted: (pr) => isDemoted(context.demoted, pr),
    bypass: (pr) => context.bypass.has(pr.number),
  });

/**
 * Logs what the survey found. The candidates are listed in `order`, the order
 * the worker releases in (`releaseOrder`), which puts first what checking ahead
 * keeps stacked (`kept`), so that "next" is the one it acts on.
 */
export const reportTriage = (
  triaged: Triage,
  total: number,
  context: Readonly<{
    defaultBranch: string;
    demoted: Demotions;
    order: readonly PullRequest[];
    kept: readonly number[];
  }>,
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

  for (const [prNumber, reason] of triaged.bypass) {
    log(
      `  #${prNumber}: only a ruleset bypass merges it — ${reason}; its checks are run, and auto-merge is left off`,
    );
  }

  for (const note of triaged.notes) {
    log(`  ${note}`);
  }

  for (const { pr, summary } of triaged.failing) {
    log(
      `  #${pr.number}: up to date but failing: ${summary.failed.join(', ')}`,
    );
  }

  for (const [position, pr] of context.order.entries()) {
    log(
      `  #${pr.number}: ${position === 0 ? 'next' : `${position} ahead of it`} — ${describeAction(pr, defaultBranch, triaged)}${context.kept.includes(pr.number) ? ' — kept ahead, its layer already stacked' : ''}${isDemoted(context.demoted, pr) ? ' — last, because it sat green without merging' : ''}${priorityPhrase(pr, triaged.bypass.has(pr.number))} — ${pr.title}`,
    );
  }
};

/** What this cycle is about to do to a pull request, as a phrase. */
export const describeAction = (
  pr: PullRequest,
  defaultBranch: string,
  triaged: StrictPick<Triage, 'bypass' | 'stackParents' | 'toArm'>,
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
    bypassPhrase(triaged.bypass.get(pr.number)),
    isSkipCiLabelled(pr) ? `, then take ${SKIP_CI_LABEL} off it` : '',
  ].join('');
};

/** What is done instead of arming one only a bypass merges, as a phrase. */
export const bypassPhrase = (reason: string | undefined): string =>
  reason === undefined
    ? ''
    : (`, leave auto-merge off (${reason}, so it needs a bypass merge)` as const);

/**
 * What the pull request's priority label, or needing a bypass merge, did to its
 * place, as a phrase.
 */
export const priorityPhrase = (pr: PullRequest, bypass: boolean): string => {
  // `pickPriorityRank` ranks it with `priority:low` unless it is `high`.
  const asBypassOnly = 'as only a bypass merges it';

  const behindForBypass = ` — behind the rest, ${asBypassOnly}` as const;

  switch (priorityOf(pr)) {
    case 'high':
      return ` — ahead of the rest, by ${PRIORITY_HIGH_LABEL}`;

    case 'low':
      return ` — behind the rest, by ${PRIORITY_LOW_LABEL}${bypass ? `, and ${asBypassOnly}` : ''}`;

    case 'both':
      return ` — labelled both ${PRIORITY_HIGH_LABEL} and ${PRIORITY_LOW_LABEL}, so neither counts${bypass ? behindForBypass : ''}`;

    case 'none':
      return bypass ? behindForBypass : '';
  }
};

/**
 * Whether only a ruleset bypass merges the pull request at `head`, which
 * `advance` has just pushed, read again rather than taken from triage: the
 * reason when it does, `undefined` when it does not.
 *
 * Triage's verdict is about the files of the head it read, and a rebase can
 * change them. A stacked pull request whose lower layer changed an owned path
 * carries that layer's commit until it is rebased onto the squash merge, which
 * drops the path; a rebase can as well bring one in. Right after the push GitHub
 * may still answer for the old head, so the read is repeated a few times until
 * it names `head`. When it never does, or the request fails — which a retry
 * would only repeat, as triage's own read does not — triage's verdict (`before`)
 * stands, and the retry box on a set-aside comment is the way back.
 */
export const readBypassAt = async (
  api: ApiContext,
  prNumber: number,
  head: string,
  context: ReviewContext,
  before: string | undefined,
): Promise<string | undefined> => {
  let mut_attempt = 0;

  while (!stopRequested()) {
    const read = await readReviews(api, [prNumber], context);

    if (Result.isErr(read)) {
      log(
        `#${prNumber}: cannot read its review at ${head.slice(0, 10)}; keeping what triage read. (${lastLines(read.value, 2)})`,
      );

      return before;
    }

    const verdict = bypassOfRead(read.value.reads.get(prNumber), head);

    if (verdict !== undefined) {
      if (verdict.reason !== before) {
        log(
          verdict.reason === undefined
            ? `#${prNumber}: at ${head.slice(0, 10)} it no longer needs a bypass merge.`
            : `#${prNumber}: at ${head.slice(0, 10)} only a ruleset bypass merges it — ${verdict.reason}.`,
        );
      }

      return verdict.reason;
    }

    if (mut_attempt >= REVIEW_HEAD_RETRIES) {
      break;
    }

    mut_attempt += 1;

    await pause(REVIEW_HEAD_RETRY_MS);
  }

  if (!stopRequested()) {
    log(
      `#${prNumber}: GitHub has not read its review at ${head.slice(0, 10)}; keeping what triage read.`,
    );
  }

  return before;
};

/**
 * What one read of a pull request's review says about `head`: whether only a
 * bypass merges it, or `undefined` when GitHub answered for another head, whose
 * files are not this one's. No read at all is a ruleset that asks no review,
 * which holds nothing at any head; a review that holds for an approval is not a
 * bypass, and is what the watch's green-but-not-merging budget is for.
 */
export const bypassOfRead = (
  read: HoldRead | undefined,
  head: string,
): Readonly<{ reason: string | undefined }> | undefined => {
  const hold = holdOfRead(read, head);

  return Result.isErr(hold)
    ? undefined
    : ({
        reason: hold.value?.kind === 'bypass' ? hold.value.reason : undefined,
      } as const);
};

/**
 * What holds `prNumber`'s review at `head`, read once: when a green pull
 * request has not merged, which is long after GitHub has read the head it
 * watched. `holdOfRead` says what the read means; `otherHead` is an answer for
 * another head, which says the branch moved rather than that the read failed.
 */
export const readHoldAt = async (
  api: ApiContext,
  prNumber: number,
  head: string,
  context: ReviewContext,
): Promise<Result<ReviewHold | undefined, HoldUnread>> => {
  const read = await readReviews(api, [prNumber], context);

  if (Result.isErr(read)) {
    return Result.err({
      otherHead: false,
      message: lastLines(read.value, 2).replaceAll(/\s+/gu, ' '),
    });
  }

  const hold = holdOfRead(read.value.reads.get(prNumber), head);

  return Result.isErr(hold)
    ? Result.err({ otherHead: true, message: hold.value })
    : hold;
};

/** Why {@link readHoldAt} has no answer. */
export type HoldUnread = Readonly<{ otherHead: boolean; message: string }>;

/**
 * What one read of a pull request's review holds it for at `head`. No read at
 * all is a ruleset that asks no review, which holds nothing; a read of another
 * head is not an answer, since its files are not this one's.
 */
export const holdOfRead = (
  read: HoldRead | undefined,
  head: string,
): Result<ReviewHold | undefined, string> =>
  read === undefined
    ? Result.ok(undefined)
    : read.head !== head
      ? Result.err(
          `GitHub read it at ${read.head.slice(0, 10)}, not ${head.slice(0, 10)}`,
        )
      : Result.ok(read.hold);

/**
 * What a pull request failing only the check that enforces `CODEOWNERS`
 * (`codeOwnersCheck`, from `codeOwnerGate` in `pr-report-core`) is waiting for,
 * or `undefined` for any other, which the rest of triage classifies. Still
 * waiting for an owner's approval, it is held by its review, as under the
 * ruleset's own rule. Approved since, it is re-run: no event the check takes
 * carries a review, so it stays red over an approval until it runs again.
 *
 * Not one the read cannot judge (`unknown`): the check counts a renamed path
 * from both ends where the read's file list names only the new one, reads every
 * changed file where the read may stop short, and cannot tell a team owner's
 * approval either. Each time the check fails closed, so it would fail again on
 * each re-run until the re-runs ran out and it was set aside as if broken. It
 * is held instead, for a person to re-run by hand once an owner has approved.
 */
export const codeOwnersClassification = (
  summary: ChecksSummary | undefined,
  codeOwnersCheck: string | undefined,
  review:
    | Readonly<{
        hold: ReviewHold | undefined;
        codeOwners: CodeOwnerReview['state'];
      }>
    | undefined,
): Classification | undefined => {
  if (
    summary === undefined ||
    codeOwnersCheck === undefined ||
    summary.verdict !== 'failing' ||
    summary.failed.some((context) => context !== codeOwnersCheck)
  ) {
    return undefined;
  }

  if (review?.hold?.kind === 'held') {
    return { kind: 'held', reason: review.hold.reason };
  }

  // Under the check, a bypass is an owner's pull request someone else pushed
  // to, whose only owner may not approve it. Re-running changes nothing, and
  // holding it for ever would tell nobody: once its other checks are green it
  // is set aside `awaiting-bypass`, as the watch sets one aside under the
  // ruleset's own review, so that both gates ask a person for the same merge.
  if (review?.hold?.kind === 'bypass') {
    return Arr.isNonEmpty(summary.pending) || Arr.isNonEmpty(summary.running)
      ? {
          kind: 'held',
          reason: `only a ruleset bypass merges it (${review.hold.reason}); waiting for its other checks before leaving it for one`,
        }
      : { kind: 'awaiting-bypass', reason: review.hold.reason };
  }

  if (review?.codeOwners === 'unknown') {
    return {
      kind: 'held',
      reason: `\`${codeOwnersCheck}\` failed, and whether an owner has approved what it holds cannot be told from what was read (a renamed path, changed files past those read, or a team owner): re-run it by hand once one has`,
    };
  }

  const failed = summary.failedRuns.find(
    ({ name }) => name === codeOwnersCheck,
  );

  return failed === undefined
    ? undefined
    : { kind: 'rerun', link: failed.link, summary };
};

/**
 * Which `failing` pull requests {@link readReviews} reads besides `numbers`:
 * none under the ruleset's own rule, or where the ruleset requires no check,
 * since only a required check enforcing `CODEOWNERS` makes a failing one's
 * review worth reading (`codeOwnerGate`).
 */
export const failingReviewsToRead = (
  requirements: StrictPick<
    RulesetRequirements,
    'requireCodeOwnerReview' | 'requiredContexts'
  >,
  numbers: readonly number[],
  failing: readonly number[],
): readonly number[] =>
  requirements.requireCodeOwnerReview ||
  !Arr.isNonEmpty(requirements.requiredContexts)
    ? ([] as const)
    : failing.filter((prNumber) => !numbers.includes(prNumber));

/**
 * What the rules on the default branch require, as GitHub applies them.
 *
 * The required contexts are what let "green" mean the whole list rather than
 * the part of it that has reported. A required context with no check run on the
 * head commit is not pending in the head's checks — it is absent from them — so a
 * pull request three minutes into a twenty-five minute matrix looks finished
 * without them. The review rules are what `pr-report-core`'s `review-hold.mts`
 * asks about.
 *
 * Rules that cannot be read require nothing: the watch falls back to judging by
 * what has reported, on a longer leash, and no review holds anything.
 */
const readRules = async (
  api: ApiContext,
  branch: string,
): Promise<RulesetRequirements> => {
  const rules = await readBranchRules(api, branch);

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

/** What `queueStanding` decides from, as GitHub returned it. */
const factsOf = (pr: PullRequest): QueueFacts =>
  ({
    number: pr.number,
    state: pr.state,
    labels: pr.labels.map(({ name }) => name),
    isDraft: pr.isDraft,
    headRef: pr.headRefName,
    baseRef: pr.baseRefName,
    mergeState: pr.mergeStateStatus,
    autoMerge: isRecord(pr.autoMergeRequest),
  }) as const;

/** Where a pull request stands, with what was read on the way to it. */
type Settled = Readonly<{
  standing: QueueStanding;
  /**
   * The note to report instead, and which read failed, when something it needed
   * could not be read.
   */
  unread: Readonly<{ read: UnreadRead; note: Classification }> | undefined;
  /** The checks, when they were read. */
  summary: ChecksSummary | undefined;
}>;

/**
 * The pull request's place in one of GitHub's native stacks (`stack.mts`), if
 * it is in one. One whose stack cannot be read is taken to be in none, and
 * GitHub's refusal to arm it, should it come, sets it aside.
 */
const inNativeStack = async (
  api: ApiContext,
  pr: PullRequest,
): Promise<QueueReads['nativeStack']> => {
  const entry = await readNativeStack(api, pr.number);

  if (Result.isErr(entry)) {
    log(
      `#${pr.number}: cannot read whether it is in a native stack; treating it as in none. (${lastLines(entry.value, 2)})`,
    );

    return undefined;
  }

  return entry.value;
};

/**
 * The required checks of a pull request nothing here can move — waiting on its
 * checks, or held by one that failed — or the note to report when they cannot
 * be read.
 */
const readChecks = async (
  api: ApiContext,
  pr: PullRequest,
  context: TriageContext,
): Promise<Result<ChecksSummary, Classification>> => {
  const checks = await readHeadChecks(api, pr.number, pr.headRefOid);

  if (Result.isErr(checks)) {
    return Result.err({
      kind: 'note',
      note: `#${pr.number}: could not read checks: ${checks.value}`,
    });
  }

  // Pending and passed are both in flight here, but a red left by the round
  // before is not a failure while this round runs, and the checks still running,
  // read with the required ones, are what tell the two apart.
  return Result.ok(
    summarizeChecks(
      checks.value.required,
      context.requiredContexts,
      checks.value.running,
    ),
  );
};

/**
 * Asks `queueStanding` where `pr` stands, reading what it asks for — and only
 * that, since each read is a request — until it can say.
 */
const settle = async (
  api: ApiContext,
  pr: PullRequest,
  context: TriageContext,
  reads: QueueReads = {},
  summary?: ChecksSummary,
): Promise<Settled> => {
  const standing = queueStanding(factsOf(pr), context, reads);

  if (standing.kind !== 'needs') {
    return { standing, unread: undefined, summary };
  }

  switch (standing.read) {
    case 'nativeStack':
      return settle(
        api,
        pr,
        context,
        { ...reads, nativeStack: (await inNativeStack(api, pr)) ?? 'none' },
        summary,
      );

    case 'rebuiltOnTip': {
      const rebuilt = await isRebuiltOnBaseTip(pr, context);

      return Result.isErr(rebuilt)
        ? {
            standing,
            unread: { read: 'rebuiltOnTip', note: rebuilt.value },
            summary,
          }
        : settle(
            api,
            pr,
            context,
            { ...reads, rebuiltOnTip: rebuilt.value },
            summary,
          );
    }

    case 'checksFailed': {
      const checks = await readChecks(api, pr, context);

      return Result.isErr(checks)
        ? { standing, unread: { read: 'checks', note: checks.value }, summary }
        : settle(
            api,
            pr,
            context,
            { ...reads, checksFailed: checks.value.verdict === 'failing' },
            checks.value,
          );
    }
  }
};

/** What triage reports for a standing, in the words this script logs. */
const classification = (
  pr: PullRequest,
  standing: QueueStanding,
  summary: ChecksSummary | undefined,
  context: TriageContext,
): Classification => {
  switch (standing.kind) {
    case 'ignore':
    case 'candidate':
    case 'in-flight':
      return { kind: standing.kind };

    case 'held':
      return { kind: 'held', reason: standing.reason };

    case 'unactionable':
      return { kind: 'note', note: `#${pr.number}: ${standing.reason}` };

    case 'owned':
      return (
        ownerNote(pr, standing.owner, context.skipped) ?? {
          kind: 'note',
          note: `#${pr.number}: ${standing.owner.reason}`,
        }
      );

    case 'stacked':
      return stackedNote(pr, standing.on, context);

    case 'native-stack':
      return nativeStackNote(pr, standing.entry);

    case 'waiting':
      return waitingOnNote(
        pr,
        standing.on,
        standing.cyclic,
        context.inherited.get(pr.number),
      );

    case 'release-blocked':
      return releaseBlockedNote(pr, standing.by);

    case 'release-stale':
      return releaseStaleNote(pr, context);

    case 'merge-state':
      return {
        kind: 'note',
        note: `#${pr.number}: merge state ${standing.state}`,
      };

    case 'failing':
      return summary === undefined
        ? { kind: 'note', note: `#${pr.number}: failing` }
        : { kind: 'failing', summary };

    case 'needs':
      return {
        kind: 'note',
        note: `#${pr.number}: could not read ${standing.read}`,
      };
  }
};

/**
 * Who pushed to the branch `state` was read at, as `ReviewState.pushers`:
 * `'unknown'` for a fork's branch, whose pushes are not this repository's, and
 * nothing for a read that fails, which is logged.
 */
const pushersOfState = async (
  api: ApiContext,
  prNumber: number,
  state: ReviewStateAt,
): Promise<Readonly<{ pushers?: readonly string[] | 'unknown' }>> => {
  if (state.branch === undefined) {
    return { pushers: 'unknown' };
  }

  const read = await readPushers(api, state.branch, state.head);

  // A read that failed says nothing about who pushed; taken as untold, it would
  // make a bypass of an owner's pull request and set it aside over one failed
  // request. Judged by its author alone, it is re-run, and the check, which
  // reads the activity itself, decides.
  if (Result.isErr(read)) {
    log(
      `#${prNumber}: cannot read who pushed to it; judging it by its author alone. (${lastLines(read.value, 2)})`,
    );

    return {};
  }

  return { pushers: read.value };
};

/**
 * Each pull request's {@link ReviewRead}, by number, and the required check
 * that enforces `CODEOWNERS` if one does; empty, and nothing asked, when the
 * ruleset asks no review and requires no check.
 *
 * `numbers` and `CODEOWNERS` are read in one request. `failing` are read only
 * where that file names a required check that enforces it, which is all a
 * failing pull request's review is read for, in a second request — so a survey
 * with nothing failing, or a repository whose file names no check, pays for
 * one.
 */
const readReviews = async (
  api: ApiContext,
  numbers: readonly number[],
  context: ReviewContext,
  failing: readonly number[] = [],
): Promise<Result<Reviews, string>> => {
  const {
    requireCodeOwnerReview,
    requireConversationResolution,
    requiredContexts,
  } = context.reviewRequirements;

  const failingToRead = failingReviewsToRead(
    context.reviewRequirements,
    numbers,
    failing,
  );

  // A required check may enforce `CODEOWNERS` in the ruleset's place, which
  // only the file can say, so any required check is reason enough to read it.
  if (
    (!Arr.isNonEmpty(numbers) && !Arr.isNonEmpty(failingToRead)) ||
    (!requireCodeOwnerReview &&
      !requireConversationResolution &&
      !Arr.isNonEmpty(requiredContexts))
  ) {
    return Result.ok(NO_REVIEWS);
  }

  const read = await readReviewStates(api, numbers, context.defaultBranch);

  if (Result.isErr(read)) {
    return read;
  }

  const enforcedBy =
    read.value.codeOwners === undefined
      ? undefined
      : codeOwnersEnforcedBy(read.value.codeOwners);

  const gate = codeOwnerGate(
    { requireCodeOwnerReview, requiredContexts },
    enforcedBy,
  );

  const failingRead =
    gate === 'check' && Arr.isNonEmpty(failingToRead)
      ? await readReviewStates(api, failingToRead, context.defaultBranch)
      : undefined;

  // What the first request read stands; the failing pull requests go unread,
  // which `codeOwnersClassification` treats as before they were read at all.
  if (failingRead !== undefined && Result.isErr(failingRead)) {
    log(
      `Cannot read the failing pull requests' reviews; re-running their code-owner check as if unread. (${lastLines(failingRead.value, 2)})`,
    );
  }

  const rules = {
    requireCodeOwnerReview,
    requireConversationResolution,
    // The first request's copy judges both, so that one survey reads one file.
    codeOwners:
      read.value.codeOwners === undefined
        ? ([] as const)
        : parseCodeOwners(read.value.codeOwners),
    codeOwnerGate: gate,
  } as const;

  // A failing one is read to tell whether that check is waiting on an owner,
  // and the check counts who pushed to the branch (`pushersOf` in
  // `pr-report-core`), so the model reads them too: otherwise another writer's
  // push to the owner's branch would look approved, and be re-run.
  const failingStates = await Promise.all(
    failingRead !== undefined && Result.isOk(failingRead)
      ? Array.from(
          failingRead.value.states,
          async ([prNumber, state]) =>
            [
              prNumber,
              {
                ...state,
                ...(pushersMatter(state, rules)
                  ? await pushersOfState(api, prNumber, state)
                  : {}),
              },
            ] as const,
        )
      : [],
  );

  return Result.ok({
    reads: new Map(
      [...Array.from(read.value.states), ...failingStates].map(
        ([prNumber, state]) => {
          const codeOwners = codeOwnerReviewOf(state, rules);

          return [
            prNumber,
            {
              head: state.head,
              hold: reviewHold(state, rules, codeOwners),
              codeOwners: codeOwners.state,
            },
          ] as const;
        },
      ),
    ),
    codeOwnersCheck: gate === 'check' ? enforcedBy : undefined,
  });
};

/** What {@link readReviews} reads. */
type Reviews = Readonly<{
  reads: ReadonlyMap<number, ReviewRead>;
  /** The required check that enforces `CODEOWNERS`, if one does. */
  codeOwnersCheck: string | undefined;
}>;

const NO_REVIEWS: Reviews = {
  reads: new Map<number, ReviewRead>(),
  codeOwnersCheck: undefined,
} as const;

/**
 * What each pull request's review does to it, by number, for those it does
 * anything to — `review-hold.mts` in `pr-report-core` says what is asked and
 * why — and the required check that enforces `CODEOWNERS`, if one does. One
 * request covers `numbers`, and a second the `failing` ones where that check
 * makes them worth reading ({@link readReviews}). A first request that fails
 * holds nothing and names no such check, which is how this script behaved
 * before it asked; a second that fails leaves only the failing ones unread.
 */
const readReviewHolds = async (
  api: ApiContext,
  numbers: readonly number[],
  failing: readonly number[],
  context: ReviewContext,
): Promise<
  Readonly<{
    holds: ReadonlyMap<number, ReviewHold>;
    /** Where each pull request read stands with the code owners. */
    codeOwnerStates: ReadonlyMap<number, CodeOwnerReview['state']>;
    codeOwnersCheck: string | undefined;
  }>
> => {
  const read = await readReviews(api, numbers, context, failing);

  if (Result.isErr(read)) {
    log(
      `Cannot read the reviews; holding nothing for them. (${lastLines(read.value, 2)})`,
    );

    return {
      holds: new Map<number, ReviewHold>(),
      codeOwnerStates: new Map<number, CodeOwnerReview['state']>(),
      codeOwnersCheck: undefined,
    };
  }

  return {
    holds: new Map(
      Arr.generate(function* () {
        for (const [prNumber, { hold }] of Array.from(read.value.reads)) {
          if (hold !== undefined) {
            yield [prNumber, hold] as const;
          }
        }
      }),
    ),
    codeOwnerStates: new Map(
      Array.from(
        read.value.reads,
        ([prNumber, { codeOwners }]) => [prNumber, codeOwners] as const,
      ),
    ),
    codeOwnersCheck: read.value.codeOwnersCheck,
  };
};

/** One pull request's part of {@link readReviewHolds}, if it was read. */
const reviewOf = (
  prNumber: number,
  holds: ReadonlyMap<number, ReviewHold>,
  codeOwnerStates: ReadonlyMap<number, CodeOwnerReview['state']>,
): Parameters<typeof codeOwnersClassification>[2] => {
  const codeOwners = codeOwnerStates.get(prNumber);

  return codeOwners === undefined
    ? undefined
    : { hold: holds.get(prNumber), codeOwners };
};

/** What the ruleset asks of a review, and where `CODEOWNERS` is read from. */
export type ReviewContext = StrictPick<
  TriageBase,
  'defaultBranch' | 'reviewRequirements'
>;

/** One pull request's review hold, and the head GitHub read it at. */
type HoldRead = Readonly<{ head: string; hold: ReviewHold | undefined }>;

/** A {@link HoldRead}, and where the pull request stands with the owners. */
type ReviewRead = HoldRead & Readonly<{ codeOwners: CodeOwnerReview['state'] }>;

/**
 * Whether GitHub says merging this pull request into the base conflicts. It is
 * a candidate all the same — see `queueStanding` — but a less promising one, so
 * it is reported and ordered apart from the rest.
 */
const isConflicting = (pr: PullRequest): boolean =>
  pr.mergeStateStatus === 'DIRTY';

/** What one listing of a survey read. */
type Listing = Readonly<{
  pullRequests: readonly PullRequest[];
  branchTips: ReadonlyMap<string, string>;
}>;

/**
 * Where `pr`'s branch is on `origin`, or `undefined` when it cannot be said: a
 * fork's branch is not on `origin`, and one of the same name there is another.
 */
const branchTipOf = (
  pr: PullRequest,
  branchTips: ReadonlyMap<string, string>,
): string | undefined =>
  pr.isCrossRepository ? undefined : branchTips.get(pr.headRefName);

/** Whether a survey re-lists for anything in `listing`. */
const awaitsAny = (listing: Listing, seen: OutOfSync): boolean =>
  listing.pullRequests.some((pr) =>
    awaitsMergeState(pr, branchTipOf(pr, listing.branchTips), seen),
  );

const isArmedUnknown = (pr: PullRequest): boolean =>
  pr.mergeStateStatus === 'UNKNOWN' && isRecord(pr.autoMergeRequest);

/**
 * The open pull requests, and — only when one is armed and `UNKNOWN`, since
 * nothing else needs them — the tips of `origin`'s branches. A listing of the
 * branches that fails reads none, so every such pull request is waited on, as
 * before the branches were read.
 */
const listWithBranches = async (
  api: ApiContext,
): Promise<Result<Listing, string>> => {
  const listed = await listPullRequests(api);

  if (Result.isErr(listed)) {
    return listed;
  }

  if (!listed.value.some(isArmedUnknown)) {
    return Result.ok({
      pullRequests: listed.value,
      branchTips: new Map<string, string>(),
    });
  }

  const tips = await remoteBranchTips();

  if (Result.isErr(tips)) {
    log(
      `Cannot list the branches to compare with an UNKNOWN pull request's head; waiting on its merge state. (${lastLines(tips.value, 2)})`,
    );
  }

  return Result.ok({
    pullRequests: listed.value,
    branchTips: Result.isOk(tips) ? tips.value : new Map<string, string>(),
  });
};
