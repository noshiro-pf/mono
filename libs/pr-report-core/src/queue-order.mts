/**
 * Where each pull request stands in `unblock-prs`'s queue, and the order the
 * worker picks the ones it may pick.
 *
 * The worker decides on someone's machine, from what `gh` and `git` return, and
 * the Pull Requests Manager page draws the same queue from what GraphQL
 * returns. So the deciding is here, once, over facts either side can supply,
 * and each side does only its own reading: the worker reads some facts only
 * when the answer needs them — the checks of a `BLOCKED` pull request, the
 * native stack of one without auto-merge — which is why {@link queueStanding}
 * asks for them rather than taking them all up front.
 *
 * What the worker alone knows is left out: which pull requests one run has
 * demoted (`demotions.mts` in `unblock-prs`) lives in that run's memory, so
 * {@link orderCandidates} is told it rather than reading it.
 */

import { Arr } from 'ts-data-forge';
import {
  BLOCKS_RELEASE_LABEL,
  MERGE_QUEUED_LABEL,
  PRIORITY_HIGH_LABEL,
  PRIORITY_LOW_LABEL,
  SKIP_CI_LABEL,
} from './labels.mjs';
import { findMergeAfterCycles, parseMergeAfter } from './merge-after.mjs';
import type { QueueOwner } from './queue-owner.mjs';
import type { ReviewHold } from './review-hold.mjs';
import { findStackParents } from './stack.mjs';
import { inheritStartAfter } from './start-after.mjs';

/** What one pull request's place in the queue is decided from. */
export type QueueFacts = Readonly<{
  number: number;
  /** `OPEN` for anything still to be decided. */
  state: string;
  labels: readonly string[];
  isDraft: boolean;
  headRef: string;
  baseRef: string;
  /**
   * GitHub's `mergeStateStatus` — `BEHIND`, `DIRTY`, `CLEAN`, `BLOCKED` and so
   * on — or as near to it as the reader can tell.
   */
  mergeState: string;
  autoMerge: boolean;
}>;

/** What {@link queueGraph} reads of each open pull request. */
export type QueueGraphMember = Readonly<{
  number: number;
  /** Where `Merge-After:` is read from. */
  body: string;
  isDraft: boolean;
  labels: readonly string[];
  headRef: string;
  baseRef: string;
  fromFork: boolean;
  /**
   * The open issues it closes, whose `Start-After:` it inherits. Absent for a
   * reader that did not read them: nothing is inherited.
   */
  closes?: readonly number[];
}>;

/** What the open pull requests say about one another. */
export type QueueGraph = Readonly<{
  /** Which open pull request each stacked one is on: child → parent. */
  stackParents: ReadonlyMap<number, number>;
  /**
   * What each pull request must merge after: what it declared, the one it is
   * stacked on, and what it inherits.
   */
  dependencies: ReadonlyMap<number, readonly number[]>;
  /**
   * What each inherits from the issues it closes (`start-after.mts`'s
   * `inheritStartAfter`), less what it declared or is stacked on, so that a
   * note can say where a wait comes from when the body does not say it.
   */
  inherited: ReadonlyMap<number, readonly number[]>;
  /** The `Merge-After` cycles, each starting at its lowest number. */
  cycles: readonly (readonly number[])[];
  /** Every number that sits on one of them. */
  cyclic: ReadonlySet<number>;
  openNumbers: ReadonlySet<number>;
  /**
   * The open pull requests labelled `blocks-release`, which hold the version
   * pull request for as long as they are open.
   */
  releaseBlockers: readonly Readonly<{ number: number; isDraft: boolean }>[];
}>;

export type QueueContext = QueueGraph &
  Readonly<{
    defaultBranch: string;
    /** Who moves each queued pull request next (`queue-owner.mts`). */
    owners: ReadonlyMap<number, QueueOwner>;
  }>;

/** A pull request's place in one of GitHub's native stacks. */
export type NativeStackEntry = Readonly<{
  /** The stack's number, from the same sequence as the pull requests'. */
  stack: number;
  /** 1 for the layer on the base branch, 2 for the one on it, and so on. */
  position: number;
  size: number;
}>;

/**
 * What {@link queueStanding} asks for only when the answer turns on it, each
 * once read.
 */
export type QueueReads = Readonly<{
  /** `none` for a pull request in no native stack, or one that cannot be read. */
  nativeStack?: NativeStackEntry | 'none';
  /** Whether the version pull request was built on the tip of the base. */
  rebuiltOnTip?: boolean;
  /** Whether a required check has failed on the head. */
  checksFailed?: boolean;
}>;

export type QueueRead = keyof QueueReads;

/**
 * Where a pull request stands, as the worker would act on it:
 *
 * - `ignore` — not labelled `merge-queued`, so no business of the queue's.
 * - `unactionable` — labelled, and nothing can be done for it: a draft, a
 *   base nothing knows how to land on.
 * - `owned` — set aside or claimed, or otherwise a skill's or a person's.
 * - `stacked`, `native-stack`, `waiting`, `release-blocked`, `release-stale`
 *   — its turn has not come, for the reason each names.
 * - `candidate` — the worker may pick it this cycle; {@link orderCandidates}
 *   says in what order.
 * - `in-flight` — up to date and running, or green and about to merge.
 * - `failing` — up to date, with a required check failed.
 * - `held` — a candidate or in flight that its review holds
 *   ({@link withReviewHold}).
 * - `merge-state` — a merge state nothing here expects.
 * - `needs` — the answer turns on {@link QueueReads}`[read]`: read it, and
 *   ask again with it.
 */
export type QueueStanding = Readonly<
  | { kind: 'ignore' }
  | { kind: 'unactionable'; reason: string }
  | { kind: 'owned'; owner: QueueOwner }
  | { kind: 'stacked'; on: number; cyclic: boolean }
  | { kind: 'native-stack'; entry: NativeStackEntry }
  | { kind: 'waiting'; on: readonly number[]; cyclic: boolean }
  | {
      kind: 'release-blocked';
      by: readonly Readonly<{ number: number; isDraft: boolean }>[];
    }
  | { kind: 'release-stale' }
  | { kind: 'merge-state'; state: string }
  | { kind: 'candidate' }
  | { kind: 'in-flight' }
  | { kind: 'failing' }
  | { kind: 'held'; reason: string }
  | { kind: 'needs'; read: QueueRead }
>;

/** The branch `changesets/action` opens the version pull request from. */
export const versionBranchName = (defaultBranch: string): string =>
  `changeset-release/${defaultBranch}` as const;

/**
 * Whether a pull request from `headRef` is the version pull request. The branch
 * is the only stable handle on it: the title and body are rewritten on every
 * run, and the number changes with every release.
 */
export const isVersionBranch = (
  headRef: string,
  defaultBranch: string,
): boolean => headRef === versionBranchName(defaultBranch);

/**
 * A ref name the worker is willing to put on a command line. Everything is
 * single-quoted anyway; this is a second guard, and it also keeps a name
 * starting with `-` from being read as an option. Here because a queued pull
 * request whose branch fails it is one the worker cannot act on.
 */
export const isSafeRefName = (name: string): boolean =>
  /^[\w./+-]+$/u.test(name) && !name.startsWith('-');

/** Merge states in which GitHub itself says nothing holds the merge. */
export const isMergeableState = (mergeState: string): boolean =>
  mergeState === 'CLEAN' ||
  mergeState === 'HAS_HOOKS' ||
  mergeState === 'UNSTABLE';

/**
 * The stacks, the declared order and its cycles, and what holds the release,
 * read off the open pull requests. `startAfterOf` is what the issues they close
 * declare, each issue's `Start-After:` by its number.
 */
export const queueGraph = (
  pulls: readonly QueueGraphMember[],
  defaultBranch: string,
  startAfterOf: ReadonlyMap<number, readonly number[]> = new Map<
    number,
    readonly number[]
  >(),
): QueueGraph => {
  const sorted = pulls.toSorted((a, b) => a.number - b.number);

  const stackParents = findStackParents(sorted, defaultBranch);

  // What is not started is a report's to say; the queue needs only the order.
  const inheritedOrders = inheritStartAfter({
    pulls: sorted.map(({ number, closes = [] }) => ({ number, closes })),
    startAfterOf,
    openIssues: new Set<number>(),
  });

  const declared: ReadonlyMap<number, readonly number[]> = new Map(
    sorted.map((pr) => {
      const parent = stackParents.get(pr.number);

      return [
        pr.number,
        // The version pull request declares nothing: its body is rewritten on
        // every push to the base, so a trailer written there would hold for a
        // cycle or two and then silently stop. `blocks-release`, on the pull
        // requests it is waiting for, is how an order is declared on it. Other
        // pull requests may still name *it*. A stacked pull request waits for
        // the layer below it whether or not it says so.
        isVersionBranch(pr.headRef, defaultBranch)
          ? []
          : Arr.uniq([
              ...(parent === undefined ? [] : [parent]),
              ...parseMergeAfter(pr.body),
            ]),
      ] as const;
    }),
  );

  const inherited: ReadonlyMap<number, readonly number[]> = new Map(
    sorted.map(({ number, headRef }) => {
      const own = declared.get(number) ?? [];

      return [
        number,
        // The version pull request closes nothing it means to, and is held by
        // `blocks-release` alone.
        isVersionBranch(headRef, defaultBranch)
          ? []
          : (inheritedOrders.get(number)?.mergeAfter ?? []).filter(
              (n) => !own.includes(n),
            ),
      ] as const;
    }),
  );

  const dependencies: ReadonlyMap<number, readonly number[]> = new Map(
    sorted.map(({ number }) => [
      number,
      [...(declared.get(number) ?? []), ...(inherited.get(number) ?? [])],
    ]),
  );

  const cycles = findMergeAfterCycles(dependencies);

  return {
    stackParents,
    dependencies,
    inherited,
    cycles,
    cyclic: new Set(cycles.flat()),
    openNumbers: new Set(sorted.map((pr) => pr.number)),
    releaseBlockers: sorted
      .filter((pr) => pr.labels.includes(BLOCKS_RELEASE_LABEL))
      .map((pr) => ({ number: pr.number, isDraft: pr.isDraft })),
  };
};

/**
 * Where `pr` stands in the queue — see {@link QueueStanding} — before its
 * review is asked about.
 */
export const queueStanding = (
  pr: QueueFacts,
  context: QueueContext,
  reads: QueueReads = {},
): QueueStanding => {
  const outOfScope = outOfScopeReason(pr, context);

  if (outOfScope !== undefined) {
    // `merge-queued` is an explicit request, so anything that answers it with
    // "no" is worth saying out loud — a queued pull request left as a draft
    // would otherwise sit in the queue forever with nothing saying why. A pull
    // request that never asked is passed over in silence.
    return hasLabel(pr, MERGE_QUEUED_LABEL)
      ? { kind: 'unactionable', reason: outOfScope }
      : { kind: 'ignore' };
  }

  // A pull request set aside, or claimed, is a skill's or a person's until its
  // comment is resolved (`queue-owner.mts`).
  const owner = context.owners.get(pr.number);

  if (owner !== undefined && owner.owner !== 'worker') {
    return { kind: 'owned', owner };
  }

  // A layer of a stack: its turn comes when GitHub moves it onto the default
  // branch, which is when the one below it merges.
  const parent = context.stackParents.get(pr.number);

  if (parent !== undefined) {
    return {
      kind: 'stacked',
      on: parent,
      cyclic: context.cyclic.has(pr.number),
    };
  }

  // The worker arms auto-merge when it picks a pull request, which GitHub
  // refuses for one in a native stack: that one is merged by hand.
  if (!pr.autoMerge) {
    if (reads.nativeStack === undefined) {
      return { kind: 'needs', read: 'nativeStack' };
    }

    if (reads.nativeStack !== 'none') {
      return { kind: 'native-stack', entry: reads.nativeStack };
    }
  }

  // The version pull request is rebuilt from the tip of the base by the release
  // workflow, never rebased here; taking `skip-ci` off is the whole of what it
  // can be given.
  if (isVersionBranch(pr.headRef, context.defaultBranch)) {
    return versionStanding(pr, context, reads);
  }

  // `skip-ci` makes the merge state say nothing useful: `no-skip-ci-label` is
  // pending, so the pull request is `BLOCKED` however ready it is. Taking the
  // label off is the action, so this is a candidate whatever GitHub says.
  if (hasLabel(pr, SKIP_CI_LABEL)) {
    return waitingOn(pr, context) ?? { kind: 'candidate' };
  }

  switch (pr.mergeState) {
    // `DIRTY` is a candidate too: it answers whether *merging* conflicts, from
    // a cached computation, where the worker *rebases*, and the rebase is what
    // says whether the conflict is real.
    case 'BEHIND':
    case 'DIRTY':
      return waitingOn(pr, context) ?? { kind: 'candidate' };

    case 'CLEAN':
    case 'HAS_HOOKS':
    case 'UNSTABLE':
      return { kind: 'in-flight' };

    case 'BLOCKED':
      return byChecks(reads);

    default:
      return { kind: 'merge-state', state: pr.mergeState };
  }
};

/**
 * Whether what {@link queueStanding} decided is worth asking the review about:
 * one about to be picked, or one about to be watched while GitHub still calls
 * it `BLOCKED`. A merge state GitHub already calls mergeable is its own answer
 * that nothing but the checks is left.
 */
export const asksReview = (
  standing: QueueStanding,
  mergeState: string,
): boolean =>
  standing.kind === 'candidate' ||
  (standing.kind === 'in-flight' && !isMergeableState(mergeState));

/**
 * The standing once the review is known: a hold that waits for someone holds
 * it; one that only a bypass merges, and none at all, change nothing here — the
 * worker leaves the first unarmed, which is not a question of order.
 */
export const withReviewHold = (
  standing: QueueStanding,
  mergeState: string,
  hold: ReviewHold | undefined,
): QueueStanding =>
  hold?.kind === 'held' && asksReview(standing, mergeState)
    ? ({ kind: 'held', reason: hold.reason } as const)
    : standing;

export type QueuePriority = 'high' | 'low' | 'none' | 'both';

/**
 * Which priority label a pull request carries: `both` is the two at once, which
 * contradict each other and so count as neither. `priority:mid` is the same as
 * neither here.
 */
export const priorityOfLabels = (labels: readonly string[]): QueuePriority => {
  const high = labels.includes(PRIORITY_HIGH_LABEL);

  const low = labels.includes(PRIORITY_LOW_LABEL);

  return high ? (low ? 'both' : 'high') : low ? 'low' : 'none';
};

/**
 * Where {@link priorityOfLabels} puts a pull request in the pick order, as a
 * sort key: `high` before the rest, `low` after them.
 */
export const priorityRankOfLabels = (labels: readonly string[]): 0 | 1 | 2 => {
  switch (priorityOfLabels(labels)) {
    case 'high':
      return 0;

    case 'none':
    case 'both':
      return 1;

    case 'low':
      return 2;
  }
};

/**
 * {@link priorityRankOfLabels}, for a pull request that `bypass` says only a
 * ruleset bypass merges ({@link ReviewHold}): that one ranks with
 * `priority:low` unless labelled `priority:high` — alone, since the two
 * together count as neither. Picked, it is released, goes green and is set
 * aside for a person, so the cycle spent on it lands nothing; picked last, it
 * still has its checks run. `priority:high` is a person saying they want that
 * verdict now, and is the one way to ask for it, so it still counts.
 */
export const pickPriorityRank = (
  labels: readonly string[],
  bypass: boolean,
): 0 | 1 | 2 => {
  const rank = priorityRankOfLabels(labels);

  return bypass && rank !== 0
    ? priorityRankOfLabels([PRIORITY_LOW_LABEL])
    : rank;
};

/**
 * The order the worker picks candidates in. The declared order has already been
 * applied, as a gate rather than a sort, so this is lowest number first within
 * these ranks, outermost first:
 *
 * 1. What a watch has seen green and still open (`demoted`) goes after
 *    everything else, the release and `priority:high` included: everything
 *    else is not known to sit without merging, and this is.
 * 2. `priority:high` before the rest, `priority:low` after them. It is a
 *    person's declaration, so it outranks the two guesses below — and the
 *    version pull request reads it too. One only a ruleset bypass merges
 *    counts as `priority:low` unless labelled `priority:high`
 *    ({@link pickPriorityRank}).
 * 3. What GitHub only *thinks* conflicts goes after the rest: a rebase the
 *    worker is sure of is worth spending the cycle on before one it is
 *    guessing at.
 * 4. The version pull request goes after that. This is an ordering rather
 *    than the gate — `blocks-release` is the gate — so it never stops a
 *    release: it only says that when a queued change and the release are
 *    both ready, the change goes first.
 *
 * `toSorted` is stable, so each sort keeps the order of the one before it among
 * equals, and the last one is the outermost.
 */
export const orderCandidates = <P,>(
  candidates: readonly P[],
  factsOf: (candidate: P) => QueueFacts,
  context: Readonly<{
    defaultBranch: string;
    demoted: (candidate: P) => boolean;
    bypass: (candidate: P) => boolean;
  }>,
): readonly P[] => {
  const rank = (candidate: P): number => {
    const facts = factsOf(candidate);

    return isVersionBranch(facts.headRef, context.defaultBranch)
      ? 2
      : facts.mergeState === 'DIRTY'
        ? 1
        : 0;
  };

  const priorityRank = (candidate: P): number =>
    pickPriorityRank(factsOf(candidate).labels, context.bypass(candidate));

  return candidates
    .toSorted((a, b) => factsOf(a).number - factsOf(b).number)
    .toSorted((a, b) => rank(a) - rank(b))
    .toSorted((a, b) => priorityRank(a) - priorityRank(b))
    .toSorted(
      (a, b) => Number(context.demoted(a)) - Number(context.demoted(b)),
    );
};

/**
 * Whether `pr` carries the label `name`. A function rather than `includes` in
 * place, which narrows the label constant itself to `never` where it says no.
 */
const hasLabel = (
  pr: Readonly<{ labels: readonly string[] }>,
  name: string,
): boolean => pr.labels.includes(name);

/** Why a pull request is none of the queue's business, if it is not. */
const outOfScopeReason = (
  pr: QueueFacts,
  context: QueueContext,
): string | undefined => {
  if (pr.state !== 'OPEN') {
    return `state is ${pr.state}`;
  }

  // First, so that everything after it is a reason reported only for a pull
  // request that asked. `merge-queued` is the whole of the scope rule.
  if (!hasLabel(pr, MERGE_QUEUED_LABEL)) {
    return `not labelled ${MERGE_QUEUED_LABEL}`;
  }

  // A base that is neither the default branch nor another open pull request's
  // branch is one nothing here knows how to land on. A stacked one whose parent
  // has just merged reads this way for the moment before GitHub moves it.
  return pr.isDraft
    ? 'draft'
    : pr.baseRef !== context.defaultBranch &&
        !context.stackParents.has(pr.number)
      ? `base is ${pr.baseRef}, which no open pull request is from`
      : !isSafeRefName(pr.headRef)
        ? `branch name ${JSON.stringify(pr.headRef)} will not be passed to a shell`
        : undefined;
};

/**
 * What the declared order says of a pull request whose turn would otherwise
 * have come: `waiting` while anything it must merge after is still open.
 */
const waitingOn = (
  pr: QueueFacts,
  context: QueueContext,
): QueueStanding | undefined => {
  const on = (context.dependencies.get(pr.number) ?? []).filter((number) =>
    context.openNumbers.has(number),
  );

  return Arr.isNonEmpty(on)
    ? { kind: 'waiting', on, cyclic: context.cyclic.has(pr.number) }
    : undefined;
};

/**
 * Pending — including a required context that has not reported at all — or
 * green and about to merge is in flight; a failed required check is failing.
 */
const byChecks = (reads: QueueReads): QueueStanding =>
  reads.checksFailed === undefined
    ? ({ kind: 'needs', read: 'checksFailed' } as const)
    : reads.checksFailed
      ? ({ kind: 'failing' } as const)
      : ({ kind: 'in-flight' } as const);

/**
 * The version pull request: held while anything labelled `blocks-release` is
 * open, and while the branch was built before the tip of the base, then a
 * candidate if paused and otherwise judged by its checks.
 */
const versionStanding = (
  pr: QueueFacts,
  context: QueueContext,
  reads: QueueReads,
): QueueStanding => {
  // Never one of its own blockers: the label on it would otherwise hold it for
  // as long as it existed.
  const by = context.releaseBlockers.filter(
    (blocker) => blocker.number !== pr.number,
  );

  return Arr.isNonEmpty(by)
    ? { kind: 'release-blocked', by }
    : reads.rebuiltOnTip === undefined
      ? { kind: 'needs', read: 'rebuiltOnTip' }
      : !reads.rebuiltOnTip
        ? { kind: 'release-stale' }
        : hasLabel(pr, SKIP_CI_LABEL)
          ? { kind: 'candidate' }
          : byChecks(reads);
};
