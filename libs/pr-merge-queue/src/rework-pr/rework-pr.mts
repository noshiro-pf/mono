import dedent from 'dedent';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { MERGE_QUEUED_LABEL, SKIP_CI_LABEL } from 'pr-report-core';
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
  '  done   refuse uncommitted changes, push the branch with',
  '         --force-with-lease --force-if-includes, then mark it ready for',
  '         review, and then:',
  '           --requeue  the work changes nothing the description says: put',
  `                      ${MERGE_QUEUED_LABEL} back, if start took it off, and the queue`,
  '                      takes it from there',
  `           --review   it does: ${MERGE_QUEUED_LABEL} stays off, so that the author`,
  '                      reviews it again, the description rewritten first',
  '',
  'Each step is skipped when it is already done, so a run that failed part way',
  'through is finished by running it again.',
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
    run: async (state, step) => runStep(api, branch, state, step),
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
 * is said and is not a failure: the pull request is held without it.
 *
 * `done` refuses a pull request that is not held — `skip-ci` on, `merge-queued`
 * off, not armed — since a push to one queued or armed is a push into the
 * merge. It also refuses uncommitted changes to tracked files, which are work
 * not yet amended in. Then it pushes the branch with
 * `--force-with-lease --force-if-includes`, so that a push someone else made
 * meanwhile is refused even after a fetch, and marks a draft ready for review.
 * Last, with `--requeue` — the work changes nothing the description says, so
 * nothing the author queued needs reviewing again — it puts `merge-queued`
 * back, but only where `start` took it off and nobody has put it on or taken it
 * off since: queueing one the author had not queued, or has decided about
 * again, is theirs. With `--review` it stays off, for the author to put back
 * once they have read the change. It does not carry along the pull requests
 * stacked on the branch.
 */
export const applyRework = async (
  args: ReworkArgs,
  io: ReworkIo,
): Promise<Result<ReworkOutcome, string>> => {
  const first = await readOpen(io);

  if (Result.isErr(first)) {
    return first;
  }

  if (args.phase === 'done') {
    const toDo = await doneStepsFor(io, first.value, args.handBack);

    return Result.isErr(toDo) ? toDo : runSteps(io, first.value, toDo.value);
  }

  const labelSteps = startSteps(first.value).filter((step) =>
    LABEL_STEPS.has(step),
  );

  const labelled = await runSteps(io, first.value, labelSteps);

  if (Result.isErr(labelled)) {
    return labelled;
  }

  const current = Arr.isNonEmpty(labelSteps)
    ? await readAgain(io, first.value.number)
    : first;

  if (Result.isErr(current)) {
    return current;
  }

  const steps = startSteps(current.value);

  const held = await runSteps(
    io,
    current.value,
    steps.filter((step) => step !== 'draft'),
  );

  if (Result.isErr(held)) {
    return held;
  }

  const ran = [...labelled.value.steps, ...held.value.steps] as const;

  if (!steps.includes('draft')) {
    return Result.ok({ number: current.value.number, steps: ran });
  }

  const drafted = await runSteps(io, current.value, ['draft']);

  if (Result.isErr(drafted)) {
    io.log(
      `${drafted.value}. It is held all the same, so the work can go on; it is just not marked as a draft.`,
    );
  }

  return Result.ok({
    number: current.value.number,
    steps: Result.isErr(drafted) ? ran : Arr.toPushed(ran, 'draft'),
  });
};

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
 * `record` is what `start` wrote down about taking `merge-queued` off it.
 */
export const doneSteps = (
  state: ReworkState,
  handBack: ReworkHandBack,
  record: QueueRecord,
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

export type ReworkStep =
  | 'hold'
  | 'dequeue'
  | 'disarm'
  | 'draft'
  | 'push'
  | 'ready'
  | 'requeue'
  | 'forget';

/** What the steps read and write, so that their order can be tested. */
export type ReworkIo = Readonly<{
  /** The open pull request for the branch, or `undefined`. */
  read: () => Promise<Result<ReworkState | undefined, string>>;
  run: (
    state: ReworkState,
    step: ReworkStep,
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

const readAgain = async (
  io: ReworkIo,
  number: number,
): Promise<Result<ReworkState, string>> => {
  const read = await io.read();

  return Result.isErr(read)
    ? Result.err(`cannot read its pull request again: ${read.value}`)
    : read.value === undefined
      ? Result.err(`#${number} is no longer open: merged or closed meanwhile?`)
      : Result.ok(read.value);
};

const readOpen = async (io: ReworkIo): Promise<Result<ReworkState, string>> => {
  const read = await io.read();

  return Result.isErr(read)
    ? Result.err(`cannot read its pull request: ${read.value}`)
    : read.value === undefined
      ? Result.err('the branch has no open pull request; open-pr opens one')
      : Result.ok(read.value);
};

/** `doneSteps` for the pull request, with what `start` wrote down about it. */
const doneStepsFor = async (
  io: ReworkIo,
  state: ReworkState,
  handBack: ReworkHandBack,
): Promise<Result<readonly ReworkStep[], string>> => {
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
): Promise<Result<ReworkOutcome, string>> => {
  for (const step of steps) {
    const done = await io.run(state, step);

    if (Result.isErr(done)) {
      return Result.err(
        `#${state.number}: cannot ${STEP_DESCRIPTIONS[step]}: ${done.value}`,
      );
    }

    io.log(`#${state.number}: ${STEP_DESCRIPTIONS[step]}`);
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

  const { number } = state.value;

  const steps =
    args.phase === 'start'
      ? Result.ok(startSteps(state.value))
      : await doneStepsFor(io, state.value, args.handBack);

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

const runStep = async (
  api: ApiContext,
  branch: string,
  state: ReworkState,
  step: ReworkStep,
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
      const status = await git('git status --porcelain --untracked-files=no');

      if (Result.isErr(status)) {
        return status;
      }

      if (status.value.trim() !== '') {
        return Result.err(
          'the working tree has uncommitted changes; amend them into the commit first',
        );
      }

      const pushed = await git(
        `git push --force-with-lease --force-if-includes origin ${sh(branch)}`,
      );

      return Result.isErr(pushed)
        ? Result.err(
            `${pushed.value}\nIf the lease refused it — the branch moved, or there is no origin/${branch} here — git fetch origin ${branch}, put the amend on it, and run rework-pr done again.`,
          )
        : pushed;
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
