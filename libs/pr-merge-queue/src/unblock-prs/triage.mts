/** What one survey says about each pull request, and why. */

import {
  asksReview,
  MERGE_QUEUED_LABEL,
  orderCandidates as orderQueueCandidates,
  parseCodeOwners,
  PRIORITY_HIGH_LABEL,
  PRIORITY_LOW_LABEL,
  queueGraph,
  queueStanding,
  reviewHold,
  SKIP_CI_LABEL,
  stackDescendants,
  withReviewHold,
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
import {
  listRequiredChecks,
  listRunningChecks,
  summarizeChecks,
} from './checks.mjs';
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
  readReviewStates,
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
  PullRequest,
  Survey,
  Triage,
  TriageBase,
  TriageContext,
} from './types.mjs';
import { lastLines, pause, stopRequested } from './util.mjs';
import {
  isRebuiltOnBaseTip,
  isVersionPullRequest,
  releaseBlockedNote,
  releaseStaleNote,
} from './version-pr.mjs';

/**
 * Lists the open pull requests, re-listing a few times while GitHub is still
 * computing a merge state (`UNKNOWN`) for one that matters.
 */
export const survey = async (
  api: ApiContext,
  defaultBranch: string,
): Promise<Result<Survey, string>> => {
  let mut_attempt = 0;

  let mut_listed = await listPullRequests(api);

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

    mut_listed = await listPullRequests(api);
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
    pullRequests: mut_listed.value,
    baseSha: baseSha.value,
    requiredContexts: rules.requiredContexts,
    reviewRequirements: {
      requireCodeOwnerReview: rules.requireCodeOwnerReview,
      requireConversationResolution: rules.requireConversationResolution,
    },
  });
};

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

  const holds = await readReviewHolds(
    api,
    beforeReview.filter(({ pr, standing }) =>
      asksReview(standing, pr.mergeStateStatus),
    ),
    context,
  );

  const classified = beforeReview.map(({ pr, standing, unread, summary }) => ({
    pr,
    result:
      unread ??
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
    unreadReleased: beforeReview
      .filter(({ pr, unread }) => unread !== undefined && !isSkipCiLabelled(pr))
      .map(({ pr }) => pr),
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

  for (const [position, pr] of triaged.candidates.entries()) {
    log(
      `  #${pr.number}: ${position === 0 ? 'next' : `${position} ahead of it`} — ${describeAction(pr, defaultBranch, triaged)}${isDemoted(context.demoted, pr) ? ' — last, because it sat green without merging' : ''}${priorityPhrase(pr, triaged.bypass.has(pr.number))} — ${pr.title}`,
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

    const verdict = bypassOfRead(read.value.get(prNumber), head);

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
  read: ReviewRead | undefined,
  head: string,
): Readonly<{ reason: string | undefined }> | undefined =>
  read === undefined
    ? ({ reason: undefined } as const)
    : read.head !== head
      ? undefined
      : ({
          reason: read.hold?.kind === 'bypass' ? read.hold.reason : undefined,
        } as const);

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
  /** The note to report instead, when something it needed could not be read. */
  unread: Classification | undefined;
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
  const checks = await listRequiredChecks(api, pr.number);

  if (Result.isErr(checks)) {
    return Result.err({
      kind: 'note',
      note: `#${pr.number}: could not read checks: ${checks.value}`,
    });
  }

  // Pending and passed are both in flight here, but a red left by the round
  // before is not a failure while this round runs, and the checks still running
  // are what tell the two apart.
  const running = await listRunningChecks(api, pr.number);

  if (Result.isErr(running)) {
    return Result.err({
      kind: 'note',
      note: `#${pr.number}: could not read checks: ${running.value}`,
    });
  }

  return Result.ok(
    summarizeChecks(checks.value, context.requiredContexts, running.value),
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
        ? { standing, unread: rebuilt.value, summary }
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
        ? { standing, unread: checks.value, summary }
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
 * Each pull request's {@link ReviewRead}, by number, in one request; empty, and
 * nothing asked, when the ruleset asks no review.
 */
const readReviews = async (
  api: ApiContext,
  numbers: readonly number[],
  context: ReviewContext,
): Promise<Result<ReadonlyMap<number, ReviewRead>, string>> => {
  const { requireCodeOwnerReview, requireConversationResolution } =
    context.reviewRequirements;

  if (
    !Arr.isNonEmpty(numbers) ||
    (!requireCodeOwnerReview && !requireConversationResolution)
  ) {
    return Result.ok(new Map<number, ReviewRead>());
  }

  const read = await readReviewStates(api, numbers, context.defaultBranch);

  if (Result.isErr(read)) {
    return read;
  }

  const rules = {
    requireCodeOwnerReview,
    requireConversationResolution,
    codeOwners:
      read.value.codeOwners === undefined
        ? ([] as const)
        : parseCodeOwners(read.value.codeOwners),
  } as const;

  return Result.ok(
    new Map(
      Array.from(
        read.value.states,
        ([prNumber, state]) =>
          [
            prNumber,
            { head: state.head, hold: reviewHold(state, rules) },
          ] as const,
      ),
    ),
  );
};

/**
 * What each pull request's review does to it, by number, for those it does
 * anything to — `review-hold.mts` in `pr-report-core` says what is asked and
 * why. One request covers all of them. A request that fails holds nothing,
 * which is how this script behaved before it asked.
 */
const readReviewHolds = async (
  api: ApiContext,
  entries: readonly Readonly<{ pr: PullRequest }>[],
  context: ReviewContext,
): Promise<ReadonlyMap<number, ReviewHold>> => {
  const read = await readReviews(
    api,
    entries.map(({ pr }) => pr.number),
    context,
  );

  if (Result.isErr(read)) {
    log(
      `Cannot read the reviews; holding nothing for them. (${lastLines(read.value, 2)})`,
    );

    return new Map<number, ReviewHold>();
  }

  return new Map(
    Arr.generate(function* () {
      for (const [prNumber, { hold }] of Array.from(read.value)) {
        if (hold !== undefined) {
          yield [prNumber, hold] as const;
        }
      }
    }),
  );
};

/** What the ruleset asks of a review, and where `CODEOWNERS` is read from. */
type ReviewContext = StrictPick<
  TriageBase,
  'defaultBranch' | 'reviewRequirements'
>;

/** One pull request's review hold, and the head GitHub read it at. */
type ReviewRead = Readonly<{ head: string; hold: ReviewHold | undefined }>;

/**
 * Whether GitHub says merging this pull request into the base conflicts. It is
 * a candidate all the same — see `queueStanding` — but a less promising one, so
 * it is reported and ordered apart from the rest.
 */
const isConflicting = (pr: PullRequest): boolean =>
  pr.mergeStateStatus === 'DIRTY';
