import dedent from 'dedent';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import {
  MERGE_QUEUED_LABEL,
  SKIP_CI_LABEL,
  type QueueComments,
  type QueueOwner,
} from 'pr-report-core';
import {
  Arr,
  asUint32,
  hasKey,
  isRecord,
  Num,
  Optional,
  Result,
  unknownToString,
} from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  addLabel,
  git,
  graphql,
  log,
  parseCommandArgs,
  rest,
  restAllPages,
  sh,
  takeLabelOff,
  type ApiContext,
} from '../lib/index.mjs';
import { markReady, preflight } from '../open-pr/index.mjs';
import { readQueueState } from '../pr-report/index.mjs';
import {
  branchOfEntry,
  layersAbove,
  restack,
  type BranchOf,
  type StackEntry,
} from '../unblock-prs/index.mjs';

/** What `rework-pr --help` prints. */
export const REWORK_PR_HELP = [
  'Usage: rework-pr start [--dry-run]',
  '       rework-pr done <--requeue|--review> [--dry-run]',
  '',
  'Takes the pull request of the current branch out of the merge queue while',
  'more work goes into it, and gives it back once that is pushed.',
  '',
  `  start  put ${SKIP_CI_LABEL} on, take ${MERGE_QUEUED_LABEL} off, disarm auto-merge,`,
  '         and make it a draft; a draft refused is said, and is not a',
  '         failure, since the labels hold it without one',
  '  done   refuse uncommitted changes and untracked files, push the branch',
  '         with --force-with-lease --force-if-includes, carry along the pull',
  '         requests stacked on it, then mark it ready for review, and then:',
  '           --requeue  the work changes nothing the description says: put',
  `                      ${MERGE_QUEUED_LABEL} back, if start took it off, and the queue`,
  '                      takes it from there',
  `           --review   it does: ${MERGE_QUEUED_LABEL} stays off, so that the author`,
  '                      reviews it again, the description rewritten first',
  '',
  'Each step is skipped when it is already done, so a run that failed part way',
  'through is finished by running it again.',
  '',
  'Both refuse a pull request someone has claimed, or that unblock-prs set aside',
  'for a skill to fix: that is claim-pr and push-fixed-pr.',
  '',
  'Options:',
  '  --dry-run   say what would be done, and touch nothing',
  '  -h, --help  show this help',
].join('\n');

/**
 * Takes the current branch's pull request out of the queue for more work
 * (`start`), and hands it back for review once that work is pushed (`done`).
 *
 * ```sh
 * rework-pr start             # before the first change
 * rework-pr done --requeue    # once the amend is committed, as described
 * rework-pr done --review     # once it is, with a description to rewrite
 * ```
 *
 * What each does, and in what order, is {@link applyRework}.
 */
export const reworkPr = async (
  args: ReworkArgs,
): Promise<Result<string, string>> => {
  const context = await preflight();

  if (Result.isErr(context)) {
    return context;
  }

  const { api, branch } = context.value;

  const io: ReworkIo = {
    read: async () => readOpenPullRequest(api, branch),
    standing: async (number) => readStanding(api, number),
    uncommitted: async () => git('git status --porcelain'),
    run: async (state, step, standing) =>
      runStep(api, branch, state, step, standing),
    queueRecord: async (number, handBack) =>
      readQueueRecord(api, number, handBack),
    log,
  } as const;

  if (args.dryRun) {
    return dryRun(io, args);
  }

  const applied = await applyRework(args, io);

  if (Result.isErr(applied)) {
    return applied;
  }

  const { number: prNumber, steps } = applied.value;

  return Result.ok(
    args.phase === 'start'
      ? `#${prNumber}: out of the queue for more work; run rework-pr done --requeue or --review once it is committed.`
      : steps.includes('requeue')
        ? `#${prNumber}: pushed, ready, and queued again.`
        : args.handBack === 'requeue'
          ? `#${prNumber}: pushed and ready for review. Nothing here says that rework-pr start took ${MERGE_QUEUED_LABEL} off, or the label has been put on or taken off since, so queueing it stays the author's.`
          : `#${prNumber}: pushed and ready for review, ${MERGE_QUEUED_LABEL} off for the author to put back once the description says what changed.`,
  );
};

/**
 * Runs `args.phase` on the pull request `io` reads, and resolves to its number
 * and the steps that ran.
 *
 * Either phase first refuses a pull request {@link decideStanding} does, before
 * it changes anything.
 *
 * `start`, each step skipped when already so:
 *
 * 1. **`skip-ci` on**, so that the pushes to come run no checks, and so that
 *    the worker lets go of one it is watching. Where a required status reads
 *    the label, it holds the merge by itself too, which is why it goes before
 *    anything else: on a pull request whose checks are running, any other
 *    label event first would run them again with nothing holding the merge. REST.
 * 2. **`merge-queued` off**, so the worker does not pick it again. REST. The
 *    event of taking it off is then written down in the clone, for
 *    `done --requeue`; failing to is said, and is not a failure.
 * 3. **Auto-merge disarmed**, so taking `skip-ci` off later does not merge
 *    what nobody has reviewed. GraphQL.
 * 4. **A draft**, which says on the pull request that it is being worked on,
 *    and which the worker neither picks nor rebases. GraphQL.
 *
 * The REST steps come first so that where GraphQL is refused — a Claude Code
 * session's proxy — the pull request is held when the run stops. When they
 * changed anything, the pull request is read again before the GraphQL steps, so
 * that one the worker armed, or took `skip-ci` off, after the first read is
 * disarmed too. That narrows the race with the worker rather than closing it;
 * what closes it is `done` refusing a pull request still armed. A draft refused
 * ({@link isGraphqlRefusal}) is said and is not a failure: the pull request is
 * held without it. A draft that failed for any other reason may pass when tried
 * again, so `start` fails, and running it again finishes it.
 *
 * `done` refuses a pull request that is not held — `skip-ci` on, `merge-queued`
 * off, not armed — since a push to one queued or armed is a push into the
 * merge. It also refuses uncommitted changes and untracked files that are not
 * ignored, which are work not yet amended in. Then it pushes the branch with
 * `--force-with-lease --force-if-includes`, so that a push someone else made
 * meanwhile is refused even after a fetch, carries along the pull requests
 * stacked on the branch, with `unblock-prs`'s `restack`, as `push-fixed-pr` does
 * (one that cannot be moved is said and left where it is), and marks a draft
 * ready for review.
 * Last, with `--requeue` — the work changes nothing the description says, so
 * nothing the author queued needs reviewing again — it puts `merge-queued`
 * back, but only where `start` took it off and nobody has put it on or taken it
 * off since: queueing one the author had not queued, or has decided about
 * again, is theirs. With `--review` it stays off, for the author to put back
 * once they have read the change.
 */
export const applyRework = async (
  args: ReworkArgs,
  io: ReworkIo,
): Promise<Result<ReworkOutcome, string>> => {
  const first = await readOpen(io);

  if (Result.isErr(first)) {
    return first;
  }

  const clean = await refuseUncommitted(io, args, first.value);

  if (Result.isErr(clean)) {
    return clean;
  }

  const standing = await standingOf(io, first.value);

  if (Result.isErr(standing)) {
    return standing;
  }

  if (args.phase === 'done') {
    const toDo = await doneStepsFor(
      io,
      first.value,
      args.handBack,
      standing.value,
    );

    return Result.isErr(toDo)
      ? toDo
      : runSteps(io, first.value, toDo.value, standing.value);
  }

  const labelSteps = startSteps(first.value).filter((step) =>
    LABEL_STEPS.has(step),
  );

  const labelled = await runSteps(io, first.value, labelSteps, standing.value);

  if (Result.isErr(labelled)) {
    return labelled;
  }

  const current = Arr.isNonEmpty(labelSteps)
    ? await readPullRequest(io, {
        unreadable: 'cannot read its pull request again',
        absent: `#${first.value.number} is no longer open: merged or closed meanwhile?`,
      })
    : first;

  if (Result.isErr(current)) {
    return current;
  }

  const steps = startSteps(current.value);

  const held = await runSteps(
    io,
    current.value,
    steps.filter((step) => step !== 'draft'),
    standing.value,
  );

  if (Result.isErr(held)) {
    return held;
  }

  const ran = [...labelled.value.steps, ...held.value.steps] as const;

  if (!steps.includes('draft')) {
    return Result.ok({ number: current.value.number, steps: ran });
  }

  const { number } = current.value;

  const drafted = await io.run(current.value, 'draft', standing.value);

  if (Result.isOk(drafted)) {
    io.log(`#${number}: ${STEP_DESCRIPTIONS.draft}`);

    return Result.ok({ number, steps: Arr.toPushed(ran, 'draft') });
  }

  const failed =
    `#${number}: cannot ${STEP_DESCRIPTIONS.draft}: ${drafted.value}` as const;

  if (!isGraphqlRefusal(drafted.value)) {
    return Result.err(
      `${failed}. It is held all the same; run rework-pr start again to make it one.`,
    );
  }

  io.log(
    `${failed}. It is held all the same, so the work can go on; it is just not marked as a draft.`,
  );

  return Result.ok({ number, steps: ran });
};

/**
 * Whether a pull request can be reworked at all, read from the queue: its
 * branch and the layers stacked on it, or why not. `owner` and `comments` are
 * what `pr-report/queue.mts` reads for it.
 *
 * One a skill is to fix, or someone has claimed, is taken up with `claim-pr` and
 * handed back with `push-fixed-pr`: the claim is what keeps everyone else off
 * it, and a push from here would end it. The claim is asked about as well as the
 * owner, because a claim on a pull request the queue does not cover has no owner
 * to report it. What cannot be read is refused, as `push-fixed-pr` refuses it:
 * nothing is known of a claim on it.
 *
 * A layer above with a claim that holds is not carried along either, for the
 * same reason, and so nothing above it is: `restack` leaves what sits on a layer
 * that did not move. Whoever holds the claim is on that layer's old base until
 * the worker restacks it.
 */
export const decideStanding = ({
  number,
  entries,
  owner,
  queue,
}: Readonly<{
  number: number;
  entries: readonly StackEntry[];
  owner: QueueOwner | undefined;
  queue: ReadonlyMap<number, QueueComments>;
}>): Result<ReworkStanding, string> => {
  const entry = entries.find((e) => e.number === number);

  if (entry === undefined) {
    return Result.err('it is not among the open pull requests the queue reads');
  }

  const comments = queue.get(number);

  if (comments === undefined) {
    return Result.err(
      'its queue comments could not be read, so whether someone has claimed it is not known',
    );
  }

  const { claim } = comments;

  if (claim?.applies === true && claim.says.kind === 'standing') {
    return Result.err(
      `${claim.says.claim.by} claimed it at ${claim.says.claim.at}. A fix under a claim goes through push-fixed-pr; otherwise wait for the claim to end`,
    );
  }

  if (owner?.owner === 'skill') {
    return Result.err(
      `it is a skill's (${owner.reason}). Claim it with claim-pr and hand it back with push-fixed-pr`,
    );
  }

  const layers = layersAbove(entries, number);

  // A layer whose comments could not be read is not known to be free either.
  const isHeld = (layer: BranchOf): boolean => {
    const read = queue.get(layer.number);

    return read === undefined || read.claim?.applies === true;
  };

  return Result.ok({
    pr: branchOfEntry(entry),
    layers: layers.filter((layer) => !isHeld(layer)),
    claimedLayers: layers.filter(isHeld).map(({ number: n }) => n),
  });
};

/** Why `done` must not push, given what `git status --porcelain` says. */
export const uncommittedRefusal = (porcelain: string): string | undefined =>
  porcelain.trim() === ''
    ? undefined
    : (`the working tree has uncommitted changes or untracked files; amend them into the commit, or remove them:\n${porcelain.trimEnd()}` as const);

/**
 * What to say about a refused push of `branch`. The hint is for the lease alone:
 * after a 403 or a hook declining the push, a fetch would fix nothing.
 */
export const pushFailure = (output: string, branch: string): string =>
  LEASE_REJECTION.test(output)
    ? (`${output}\nThe lease refused it — the branch moved, or there is no origin/${branch} here: git fetch origin ${branch}, put the amend on it, and run rework-pr done again.` as const)
    : output;

/**
 * Whether a GraphQL failure, as `graphql` words it, is GraphQL being refused and
 * so will go on being refused — a Claude Code session's proxy, a token without
 * the permission — rather than something that may pass when tried again: a
 * server error, a rate limit, a dropped connection, or anything else it does not
 * recognize.
 */
export const isGraphqlRefusal = (message: string): boolean =>
  !/^(?:5\d\d |request failed:)|rate limit|abuse/iu.test(message) &&
  (/^4(?!08|29)\d\d /u.test(message) ||
    /resource not accessible|permission|forbidden|not authorized/iu.test(
      message,
    ));

/**
 * Whether the `merge-queued` event `recorded` — `start` taking the label off —
 * is still the last of `events`: put back on or taken off since by anyone, the
 * label is someone's later decision, and `done --requeue` leaves it alone.
 */
export const isUntouchedSince = (
  events: readonly QueueEvent[],
  recorded: number,
): boolean => {
  const last = Arr.last(events);

  return (
    Optional.isSome(last) &&
    last.value.event === 'unlabeled' &&
    last.value.id === recorded
  );
};

/** What `start` has left to do to the pull request, in order. */
export const startSteps = (state: ReworkState): readonly ReworkStep[] =>
  [
    ...(state.labels.includes(SKIP_CI_LABEL)
      ? ([] as const)
      : (['hold'] as const)),
    ...(state.labels.includes(MERGE_QUEUED_LABEL)
      ? (['dequeue'] as const)
      : ([] as const)),
    ...(state.isArmed ? (['disarm'] as const) : ([] as const)),
    ...(state.isDraft ? ([] as const) : (['draft'] as const)),
  ] as const;

/**
 * What `done` has left to do to the pull request, or why it must not.
 * `record` is what `start` wrote down about taking `merge-queued` off it, and
 * `hasLayers` whether any open pull request is stacked on it.
 */
export const doneSteps = (
  state: ReworkState,
  handBack: ReworkHandBack,
  record: QueueRecord,
  hasLayers: boolean,
): Result<readonly ReworkStep[], string> => {
  const isHeld = state.labels.includes(SKIP_CI_LABEL);

  const isQueued = state.labels.includes(MERGE_QUEUED_LABEL);

  const unsafe: readonly string[] = [
    ...(isHeld
      ? ([] as const)
      : ([`${SKIP_CI_LABEL} is off: run rework-pr start`] as const)),
    ...(isQueued
      ? ([
          `${MERGE_QUEUED_LABEL} is on: if the author queued it again, ask them first; otherwise run rework-pr start`,
        ] as const)
      : ([] as const)),
    ...(state.isArmed
      ? ([
          'auto-merge is armed: run rework-pr start, or, where GraphQL is refused, ask the author to disarm it',
        ] as const)
      : ([] as const)),
  ] as const;

  return Arr.isNonEmpty(unsafe)
    ? Result.err(
        `a push now may go straight into the merge. ${unsafe.join('; ')}.`,
      )
    : Result.ok([
        'push',
        ...(hasLayers ? (['restack'] as const) : ([] as const)),
        ...(state.isDraft ? (['ready'] as const) : ([] as const)),
        // Last: a pull request queued is the worker's, and one it picks before
        // the push is pushed into the merge.
        ...(record === 'untouched' && handBack === 'requeue'
          ? (['requeue'] as const)
          : ([] as const)),
        ...(record === 'none' ? ([] as const) : (['forget'] as const)),
      ] as const);
};

/** The command line, or what is wrong with it. */
export const parseReworkArgs = (
  args: readonly string[],
): Result<ReworkArgs | 'help', string> => {
  const parsed = parseCommandArgs(
    // `parseCommandArgs` takes no positionals, so the phase is read here.
    args.filter((arg) => !isReworkPhase(arg)),
    {
      'dry-run': { type: 'boolean', default: false },
      requeue: { type: 'boolean', default: false },
      review: { type: 'boolean', default: false },
    },
  );

  if (Result.isErr(parsed)) {
    return parsed;
  }

  if (parsed.value === 'help') {
    return Result.ok('help');
  }

  const [phase, second] = args.filter(isReworkPhase);

  if (phase === undefined || second !== undefined) {
    return Result.err('give one of start or done');
  }

  const { requeue, review, 'dry-run': isDryRun } = parsed.value;

  if (phase === 'start') {
    return requeue || review
      ? Result.err('--requeue and --review go with done, not start')
      : Result.ok({ phase, dryRun: isDryRun });
  }

  return requeue === review
    ? Result.err(
        'done takes one of --requeue (the work changes nothing the description says) or --review (it does)',
      )
    : Result.ok({
        phase,
        handBack: requeue ? 'requeue' : 'review',
        dryRun: isDryRun,
      });
};

/** GraphQL: the REST API can neither disarm auto-merge nor make a draft. */
export const disarmAutoMerge = async (
  api: ApiContext,
  nodeId: string,
): Promise<Result<undefined, string>> =>
  graphql(
    api,
    dedent`
      mutation ($id: ID!) {
        disablePullRequestAutoMerge(input: { pullRequestId: $id }) {
          clientMutationId
        }
      }
    `,
    { id: nodeId },
  );

export const convertToDraft = async (
  api: ApiContext,
  nodeId: string,
): Promise<Result<undefined, string>> =>
  graphql(
    api,
    dedent`
      mutation ($id: ID!) {
        convertPullRequestToDraft(input: { pullRequestId: $id }) {
          clientMutationId
        }
      }
    `,
    { id: nodeId },
  );

export type ReworkPhase = 'start' | 'done';

/**
 * What `done` does about `merge-queued`: puts it back (`requeue`) or leaves it
 * to the author (`review`).
 */
export type ReworkHandBack = 'requeue' | 'review';

export type ReworkArgs = Readonly<
  | { phase: 'start'; dryRun: boolean }
  | { phase: 'done'; handBack: ReworkHandBack; dryRun: boolean }
>;

/** The pull request a run acted on, and the steps that ran, in order. */
export type ReworkOutcome = Readonly<{
  number: number;
  steps: readonly ReworkStep[];
}>;

/**
 * What `start` wrote down about taking `merge-queued` off a pull request:
 * nothing (`none`); the event of it, still the label's last (`untouched`); or
 * one the label has had events since (`moved`), which is someone's later
 * decision, and which `done --requeue` leaves alone.
 */
export type QueueRecord = 'none' | 'untouched' | 'moved';

/** An event that put `merge-queued` on a pull request or took it off. */
export type QueueEvent = Readonly<{
  id: number;
  event: 'labeled' | 'unlabeled';
}>;

/** The pull request as far as the steps need it. */
export type ReworkState = Readonly<{
  number: number;
  /** What the GraphQL mutations address it by. */
  nodeId: string;
  labels: readonly string[];
  isDraft: boolean;
  isArmed: boolean;
}>;

/**
 * The branch of a pull request that may be reworked, those stacked on it to carry
 * along, lowest first, and the numbers of those not to touch.
 */
export type ReworkStanding = Readonly<{
  pr: BranchOf;
  layers: readonly BranchOf[];
  claimedLayers: readonly number[];
}>;

export type ReworkStep =
  | 'hold'
  | 'dequeue'
  | 'disarm'
  | 'draft'
  | 'push'
  | 'restack'
  | 'ready'
  | 'requeue'
  | 'forget';

/** What the steps read and write, so that their order can be tested. */
export type ReworkIo = Readonly<{
  /** The open pull request for the branch, or `undefined`. */
  read: () => Promise<Result<ReworkState | undefined, string>>;
  /** {@link decideStanding} for pull request `number`, as the queue reads now. */
  standing: (number: number) => Promise<Result<ReworkStanding, string>>;
  /** What `git status --porcelain` says of the working tree. */
  uncommitted: () => Promise<Result<string, string>>;
  run: (
    state: ReworkState,
    step: ReworkStep,
    standing: ReworkStanding,
  ) => Promise<Result<unknown, string>>;
  /**
   * What `start` wrote down about taking `merge-queued` off pull request
   * `number`, compared with the label's events only for `requeue`.
   */
  queueRecord: (
    number: number,
    handBack: ReworkHandBack,
  ) => Promise<Result<QueueRecord, string>>;
  log: (message: string) => void;
}>;

const PHASES: ReadonlySet<string> = new Set<ReworkPhase>(['start', 'done']);

/** How git says the lease, or `--force-if-includes`, refused a push. */
const LEASE_REJECTION = /stale info|remote ref updated since checkout/u;

/** The steps that are REST calls, run before the pull request is read again. */
const LABEL_STEPS: ReadonlySet<ReworkStep> = new Set<ReworkStep>([
  'hold',
  'dequeue',
]);

const STEP_DESCRIPTIONS = {
  hold: `put ${SKIP_CI_LABEL} on`,
  dequeue: `take ${MERGE_QUEUED_LABEL} off`,
  disarm: 'disarm auto-merge',
  draft: 'make it a draft',
  push: 'push the branch with --force-with-lease --force-if-includes',
  restack: 'carry along the pull requests stacked on it',
  ready: 'mark it ready for review',
  requeue: `put ${MERGE_QUEUED_LABEL} back on`,
  forget: `forget what rework-pr start wrote down about ${MERGE_QUEUED_LABEL}`,
} as const satisfies ReadonlyRecord<ReworkStep, string>;

const PullRequestSchema = t.record({
  number: t.number(),
  node_id: t.string(),
  draft: t.boolean(),
  labels: t.array(t.record({ name: t.string() })),
  auto_merge: t.unknown(),
});

const IssueEventSchema = t.record({
  id: t.number(),
  event: t.string(),
  label: t.optional(t.union([t.record({ name: t.string() }), t.nullType])),
});

/** How many times `start` reads the events for its own, and how far apart. */
const EVENT_READS: number = 4;

const EVENT_READ_INTERVAL_MS = 2000;

/**
 * The id of the event that just took `merge-queued` off a pull request: the
 * label's last event, once that is taking it off. GitHub lists an event a
 * moment after the change, so `read` is called again, `wait` apart, up to
 * `reads` times; the label was on until now, so a last event putting it on is
 * only one the list does not show yet.
 */
export const readOwnDequeueEvent = async (
  read: () => Promise<Result<readonly QueueEvent[], string>>,
  wait: () => Promise<void>,
  reads: number = EVENT_READS,
): Promise<Result<number, string>> => {
  for (const attempt of Arr.seq(asUint32(reads))) {
    if (attempt > 0) {
      await wait();
    }

    const events = await read();

    if (Result.isErr(events)) {
      return events;
    }

    const last = Arr.last(events.value);

    if (Optional.isSome(last) && last.value.event === 'unlabeled') {
      return Result.ok(last.value.id);
    }
  }

  return Result.err(
    `GitHub does not list taking ${MERGE_QUEUED_LABEL} off yet`,
  );
};

const isReworkPhase = (arg: string): arg is ReworkPhase => PHASES.has(arg);

const readPullRequest = async (
  io: ReworkIo,
  says: Readonly<{ unreadable: string; absent: string }>,
): Promise<Result<ReworkState, string>> => {
  const read = await io.read();

  return Result.isErr(read)
    ? Result.err(`${says.unreadable}: ${read.value}`)
    : read.value === undefined
      ? Result.err(says.absent)
      : Result.ok(read.value);
};

const readOpen = async (io: ReworkIo): Promise<Result<ReworkState, string>> =>
  readPullRequest(io, {
    unreadable: 'cannot read its pull request',
    absent: 'the branch has no open pull request; open-pr opens one',
  });

/** {@link decideStanding} for `state`, its number on what it answers. */
const standingOf = async (
  io: ReworkIo,
  state: ReworkState,
): Promise<Result<ReworkStanding, string>> => {
  const standing = await io.standing(state.number);

  return Result.isErr(standing)
    ? Result.err(`#${state.number}: ${standing.value}.`)
    : standing;
};

/**
 * For `done`, why the working tree stops it: what the push would leave behind.
 * Asked before the queue is read, being the cheaper of the two.
 */
const refuseUncommitted = async (
  io: ReworkIo,
  args: ReworkArgs,
  state: ReworkState,
): Promise<Result<undefined, string>> => {
  if (args.phase !== 'done') {
    return Result.ok(undefined);
  }

  const uncommitted = await io.uncommitted();

  if (Result.isErr(uncommitted)) {
    return Result.err(
      `#${state.number}: cannot read the working tree: ${uncommitted.value}`,
    );
  }

  const refusal = uncommittedRefusal(uncommitted.value);

  return refusal === undefined
    ? Result.ok(undefined)
    : Result.err(`#${state.number}: ${refusal}`);
};

/** `doneSteps` for the pull request, with what `start` wrote down about it. */
const doneStepsFor = async (
  io: ReworkIo,
  state: ReworkState,
  handBack: ReworkHandBack,
  standing: ReworkStanding,
): Promise<Result<readonly ReworkStep[], string>> => {
  for (const claimed of standing.claimedLayers) {
    io.log(
      `#${claimed}: not carried along: someone holds a claim on it, or its comments could not be read.`,
    );
  }

  const read = await io.queueRecord(state.number, handBack);

  if (Result.isErr(read)) {
    const message =
      `#${state.number}: cannot read whether rework-pr start took ${MERGE_QUEUED_LABEL} off: ${read.value}` as const;

    // `--review` reads it only to forget it, so it does not stop for it.
    if (handBack === 'requeue') {
      return Result.err(message);
    }

    io.log(`${message}; it is left where it is`);
  }

  const steps = doneSteps(
    state,
    handBack,
    Result.isOk(read) ? read.value : 'none',
    Arr.isNonEmpty(standing.layers),
  );

  return Result.isErr(steps)
    ? Result.err(`#${state.number}: ${steps.value}`)
    : steps;
};

/** `steps` in order, each holding the pull request for the next. */
const runSteps = async (
  io: ReworkIo,
  state: ReworkState,
  steps: readonly ReworkStep[],
  standing: ReworkStanding,
): Promise<Result<ReworkOutcome, string>> => {
  for (const step of steps) {
    const done = await io.run(state, step, standing);

    if (Result.isErr(done)) {
      return Result.err(
        `#${state.number}: cannot ${STEP_DESCRIPTIONS[step]}: ${done.value}`,
      );
    }

    // `restack` says of each layer whether it moved.
    if (step !== 'restack') {
      io.log(`#${state.number}: ${STEP_DESCRIPTIONS[step]}`);
    }
  }

  return Result.ok({ number: state.number, steps });
};

const dryRun = async (
  io: ReworkIo,
  args: ReworkArgs,
): Promise<Result<string, string>> => {
  const state = await readOpen(io);

  if (Result.isErr(state)) {
    return state;
  }

  const clean = await refuseUncommitted(io, args, state.value);

  if (Result.isErr(clean)) {
    return clean;
  }

  const standing = await standingOf(io, state.value);

  if (Result.isErr(standing)) {
    return standing;
  }

  const { number } = state.value;

  const steps =
    args.phase === 'start'
      ? Result.ok(startSteps(state.value))
      : await doneStepsFor(io, state.value, args.handBack, standing.value);

  return Result.isErr(steps)
    ? steps
    : Result.ok(
        Arr.isNonEmpty(steps.value)
          ? Arr.toUnshifted(`#${number}: would`)(
              steps.value.map((step) => `  - ${STEP_DESCRIPTIONS[step]}`),
            ).join('\n')
          : `#${number}: nothing to do`,
      );
};

/**
 * Where `start` writes down which `merge-queued` event was its own taking the
 * label off pull request `number`: under the clone's common git directory, so
 * that every worktree of the clone reads the same one, and nothing in the
 * working tree changes.
 */
const queuedMarkerPath = async (
  number: number,
): Promise<Result<string, string>> =>
  Result.map(await git('git rev-parse --git-common-dir'), (dir) =>
    path.resolve(dir.trim(), 'pr-merge-queue', 'rework-pr', `${number}.queued`),
  );

/** Every event on pull request `number` that put `merge-queued` on or took it off. */
const readQueueEvents = async (
  api: ApiContext,
  number: number,
): Promise<Result<readonly QueueEvent[], string>> =>
  Result.map(
    await restAllPages(
      api,
      `/issues/${number}/events`,
      t.array(IssueEventSchema),
    ),
    (events) =>
      // By id, which GitHub hands out in order, rather than by where the list
      // puts each one, which its documentation does not promise.
      Arr.toSortedBy(
        Arr.generate(function* () {
          for (const { id, event, label } of events) {
            if (
              label?.name === MERGE_QUEUED_LABEL &&
              (event === 'labeled' || event === 'unlabeled')
            ) {
              yield { id, event } as const;
            }
          }
        }),
        (event) => event.id,
      ),
  );

/**
 * Writes down the event of `start` taking `merge-queued` off: the last one that
 * took it off, read just after it did.
 */
const rememberQueued = async (
  api: ApiContext,
  number: number,
): Promise<Result<undefined, string>> => {
  const own = await readOwnDequeueEvent(
    async () => readQueueEvents(api, number),
    async () => sleep(EVENT_READ_INTERVAL_MS),
  );

  if (Result.isErr(own)) {
    return own;
  }

  const marker = await queuedMarkerPath(number);

  if (Result.isErr(marker)) {
    return marker;
  }

  const written = await Result.fromPromise(
    (async () => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- the command's own state file
      await fs.mkdir(path.dirname(marker.value), { recursive: true });

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- the command's own state file
      await fs.writeFile(marker.value, `${own.value}\n`);
    })(),
  );

  return Result.isErr(written)
    ? Result.err(unknownToString(written.value))
    : Result.ok(undefined);
};

const isMissingFile = (error: unknown): boolean =>
  isRecord(error) && hasKey(error, 'code') && error.code === 'ENOENT';

/**
 * What `start` wrote down about pull request `number`, as it reads now. Only
 * `requeue` acts on whether it is `untouched`, so for `review` a record is not
 * compared with the label's events and is answered as `moved`.
 */
const readQueueRecord = async (
  api: ApiContext,
  number: number,
  handBack: ReworkHandBack,
): Promise<Result<QueueRecord, string>> => {
  const marker = await queuedMarkerPath(number);

  if (Result.isErr(marker)) {
    return marker;
  }

  const recorded = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- the command's own state file
    fs.readFile(marker.value, 'utf8'),
  );

  if (Result.isErr(recorded)) {
    return isMissingFile(recorded.value)
      ? Result.ok('none')
      : Result.err(
          `cannot read ${marker.value}: ${unknownToString(recorded.value)}`,
        );
  }

  if (handBack === 'review') {
    return Result.ok('moved');
  }

  const events = await readQueueEvents(api, number);

  return Result.map(events, (list) =>
    isUntouchedSince(
      list,
      Result.unwrapOkOr(Num.safeParseInt(recorded.value.trim()), Number.NaN),
    )
      ? 'untouched'
      : 'moved',
  );
};

const forgetQueued = async (
  number: number,
): Promise<Result<undefined, string>> => {
  const marker = await queuedMarkerPath(number);

  if (Result.isErr(marker)) {
    return marker;
  }

  const removed = await Result.fromPromise(
    fs.rm(marker.value, { force: true }),
  );

  return Result.isErr(removed)
    ? Result.err(unknownToString(removed.value))
    : Result.ok(undefined);
};

/**
 * {@link decideStanding} as the queue reads now, without its check states: the
 * read comes before `skip-ci` goes on, and a pull request whose checks are
 * running can merge while it lasts.
 */
const readStanding = async (
  api: ApiContext,
  number: number,
): Promise<Result<ReworkStanding, string>> => {
  const queue = await readQueueState(`${api.repo.owner}/${api.repo.name}`, {
    token: api.token,
  });

  return Result.isErr(queue)
    ? Result.err(`cannot read the queue: ${queue.value}`)
    : decideStanding({
        number,
        entries: queue.value.decided.entries,
        owner: queue.value.owners.get(number),
        queue: queue.value.queue,
      });
};

const runStep = async (
  api: ApiContext,
  branch: string,
  state: ReworkState,
  step: ReworkStep,
  standing: ReworkStanding,
): Promise<Result<unknown, string>> => {
  switch (step) {
    case 'hold':
      return addLabel(api, state.number, SKIP_CI_LABEL);

    case 'dequeue': {
      const removed = await takeLabelOff(api, state.number, MERGE_QUEUED_LABEL);

      // Off already: someone else took it off after the pull request was read,
      // and the event is theirs, so nothing is written down for
      // `done --requeue` to put back.
      if (Result.isErr(removed) || removed.value === 'absent') {
        return removed;
      }

      // Not a failure: the pull request is out of the queue, which is what
      // `start` is for, and the steps after this one still have to run. What is
      // lost is only `done --requeue` putting the label back.
      const remembered = await rememberQueued(api, state.number);

      if (Result.isErr(remembered)) {
        log(
          `#${state.number}: cannot write down that ${MERGE_QUEUED_LABEL} was on (${remembered.value}), so rework-pr done --requeue will leave it to the author`,
        );
      }

      return removed;
    }

    case 'disarm':
      return disarmAutoMerge(api, state.nodeId);

    case 'draft':
      return convertToDraft(api, state.nodeId);

    case 'push': {
      const pushed = await git(
        `git push --force-with-lease --force-if-includes origin ${sh(branch)}`,
      );

      return Result.isErr(pushed)
        ? Result.err(pushFailure(pushed.value, branch))
        : pushed;
    }

    case 'restack': {
      const head = await git('git rev-parse HEAD');

      if (Result.isErr(head)) {
        return head;
      }

      const to = head.value.trim();

      if (to === standing.pr.headRefOid) {
        log(
          `#${state.number}: its head had not moved when this run read it, so nothing is carried along. A layer still on an older head, because the amend was pushed by hand or by a run that stopped, is replayed with git rebase --onto.`,
        );

        return Result.ok(undefined);
      }

      await restack(standing.pr, to, standing.layers);

      return Result.ok(undefined);
    }

    case 'ready':
      return markReady(api, state.nodeId);

    case 'requeue':
      return addLabel(api, state.number, MERGE_QUEUED_LABEL);

    case 'forget':
      return forgetQueued(state.number);
  }
};

/**
 * The open pull request for `branch`, qualified with the owner as `open-pr`
 * asks for it, so that a fork's branch of the same name is not taken for it.
 */
const readOpenPullRequest = async (
  api: ApiContext,
  branch: string,
): Promise<Result<ReworkState | undefined, string>> => {
  const listed = await rest(api, 'GET', '/pulls', t.array(PullRequestSchema), {
    query: {
      state: 'open',
      per_page: '1',
      head: `${api.repo.owner}:${branch}`,
    },
  });

  if (Result.isErr(listed)) {
    return listed;
  }

  const [found] = listed.value;

  return Result.ok(
    found === undefined
      ? undefined
      : ({
          number: found.number,
          nodeId: found.node_id,
          labels: found.labels.map((label) => label.name),
          isDraft: found.draft,
          isArmed: found.auto_merge !== null,
        } as const),
  );
};
