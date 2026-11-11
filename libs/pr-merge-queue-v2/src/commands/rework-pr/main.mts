// cspell:ignore unlabel
/**
 * `rework-pr` (`spec/commands.md`): takes the current branch's pull request out
 * of the queue for more work (`start`), and hands it back once that work is
 * pushed (`done`).
 *
 * `start`, each step skipped when already so:
 *
 * 1. **`skip-ci` on**, so that the pushes to come run no checks, and so that
 *    the worker lets go of one it is watching. Where a required status reads
 *    the label, it holds the merge by itself too, which is why it goes first:
 *    on a pull request whose checks are running, any other label event first
 *    would run them again with nothing holding the merge. REST.
 * 2. **`merge-queued` off**, so the worker does not pick it again. REST. The
 *    event of taking it off is then written down in the clone, for
 *    `done --requeue`; failing to is said, and is not a failure.
 * 3. **Auto-merge disarmed**, so taking `skip-ci` off later does not merge what
 *    nobody has reviewed. GraphQL.
 * 4. **A draft**, which says on the pull request that it is being worked on,
 *    and which the worker neither picks nor rebases. GraphQL.
 *
 * The REST steps come first so that where GraphQL is refused (a Claude Code
 * session's proxy) the pull request is held when the run stops. When they
 * changed anything, the pull request is read again before the GraphQL steps, so
 * that one the worker armed meanwhile is disarmed too: that narrows the race
 * with the worker; `done` refusing a pull request still armed closes it. A
 * draft refused is said and is not a failure, the labels holding it without
 * one; a draft that failed otherwise may pass when tried again, so `start`
 * fails, and running it again finishes it.
 *
 * `done` refuses a pull request not held, and uncommitted changes and untracked
 * files not ignored, which are work not yet amended in, and a head on GitHub
 * the local branch never had, as `--force-if-includes` does. Then it pushes the
 * commit checked out with the worker's leased push, leased against the head the
 * queue read, so that a push someone else made meanwhile is refused even after
 * a fetch, carries the layers stacked on it along with the worker's restack, as
 * `push-fixed-pr` does, marks a draft ready, and, with `--requeue`, puts
 * `merge-queued` back, but only where `start` took it off and nobody has put it
 * on or taken it off since.
 */

import {
  decideReworkStanding,
  doneSteps,
  isUntouchedSince,
  PullRequestLabel,
  readOpenPullRequestOf,
  readQueueEvents,
  startSteps,
  uncommittedRefusal,
  type PullRequestFacts,
  type QueueEvent,
  type QueueRecord,
  type ReadContext,
  type ReworkHandBack,
  type ReworkStanding,
  type ReworkState,
  type ReworkStep,
} from 'pr-report-core-v2';
import { Arr, asUint32, Num, Result } from 'ts-data-forge';
import type { ReadonlyRecord, StrictExtract } from 'ts-type-forge';
import { restackLines, type RestackOutcome } from '../../git/index.mjs';
import {
  addLabel,
  messageOf,
  mutatePullRequest,
  notWritten,
  openSession,
  removeLabel,
  type PullRequestMutation,
  type SessionWorld,
} from '../../github/index.mjs';
import { readQueue } from '../pr-report/index.mjs';
import type { ReworkPrOptions } from './options.mjs';

export const reworkPr = async (
  options: ReworkPrOptions,
  world: ReworkPrWorld,
): Promise<Result<string, string>> => {
  const branch = await world.git.branch();

  if (Result.isErr(branch)) {
    return Result.err(
      `run it on the pull request's branch, checked out: ${branch.value}`,
    );
  }

  const session = await openSession(undefined, world);

  if (Result.isErr(session)) {
    return session;
  }

  const run: Run = {
    world,
    context: session.value.context,
    branch: branch.value,
  } as const;

  const first = await readOpen(run);

  if (Result.isErr(first)) {
    return first;
  }

  const { number } = first.value;

  if (options.phase === 'done') {
    const uncommitted = await world.git.status();

    if (Result.isErr(uncommitted)) {
      return Result.err(
        `#${number}: cannot read the working tree: ${uncommitted.value}`,
      );
    }

    const refusal = uncommittedRefusal(uncommitted.value);

    if (refusal !== undefined) {
      return Result.err(`#${number}: ${refusal}`);
    }
  }

  // The whole queue, as every command that decides by it reads it, before
  // anything changes: a label put on first would change what the queue decides
  // (an `auto-rebase` pull request under `skip-ci` is the queue's), and stay on
  // a pull request refused. The read is longer than v1's, which left the checks
  // out, and a pull request whose checks finish meanwhile can merge before it
  // is held; that window is v1's too. The cap on open pull requests every queue
  // read holds to holds here.
  const queue = await readQueue(run.context, world.nowEpochMs());

  if (Result.isErr(queue)) {
    return Result.err(`#${number}: cannot read the queue: ${queue.value}`);
  }

  const standing = decideReworkStanding(queue.value.pullRequests, number);

  if (Result.isErr(standing)) {
    return Result.err(`#${number}: ${standing.value}.`);
  }

  if (options.phase === 'start') {
    return options.dryRun
      ? Result.ok(wouldDo(number, startSteps(first.value)))
      : start(run, first.value, standing.value);
  }

  const steps = await doneStepsFor(
    run,
    first.value,
    options.handBack,
    standing.value,
  );

  if (Result.isErr(steps)) {
    return steps;
  }

  if (options.dryRun) {
    // Of the refusals a step makes, those told without writing: the others
    // (held, committed, the record) are decided above, for both runs; what only
    // the push itself finds (the lease) a dry run cannot.
    const check = await pushCheck(run, standing.value);

    switch (check.kind) {
      case 'may':
        return Result.ok(wouldDo(number, steps.value));

      case 'refused':
        return Result.err(`#${number}: would not push: ${check.why}`);

      case 'unknown':
        return Result.err(
          `#${number}: cannot tell whether it may push: ${check.why}`,
        );
    }
  }

  const ran = await runSteps(run, first.value, steps.value, standing.value);

  return Result.isErr(ran)
    ? ran
    : Result.ok(
        steps.value.includes('requeue')
          ? `#${number}: pushed, ready, and queued again.`
          : options.handBack === 'requeue'
            ? `#${number}: pushed and ready for review. Nothing here says that rework-pr start took ${PullRequestLabel.mergeQueued} off, or the label has been put on or taken off since, so queueing it stays the author's.`
            : `#${number}: pushed and ready for review, ${PullRequestLabel.mergeQueued} off for the author to put back once the description says what changed.`,
      );
};

/**
 * The id of the event that just took `merge-queued` off a pull request: the
 * label's last event, once that is taking it off and newer than every event
 * listed before (`after`, the newest id then, which GitHub hands out in order),
 * so that an older unlabel shown while the newer events are not yet is not
 * taken for it. GitHub lists an event a moment after the change, so `read` is
 * called again, `wait` apart, up to `reads` times.
 */
export const readOwnDequeueEvent = async (
  read: () => Promise<Result<readonly QueueEvent[], string>>,
  wait: () => Promise<void>,
  after: number,
  reads: number = EVENT_READS,
): Promise<Result<number, string>> => {
  for (const attempt of Arr.seq(asUint32(reads))) {
    if (attempt > 0) {
      // One read after another, `wait` apart, by design.
      // eslint-disable-next-line no-await-in-loop
      await wait();
    }

    // eslint-disable-next-line no-await-in-loop
    const events = await read();

    if (Result.isErr(events)) {
      return events;
    }

    const last = events.value.at(-1);

    if (last?.event === 'unlabeled' && last.id > after) {
      return Result.ok(last.id);
    }
  }

  return Result.err(
    `GitHub does not list taking ${PullRequestLabel.mergeQueued} off yet`,
  );
};

/** What `rework-pr` reads and writes the world through. */
export type ReworkPrWorld = SessionWorld &
  Readonly<{
    nowEpochMs: () => number;
    /** Waits between reads of the label events. */
    sleep: (ms: number) => Promise<void>;
    /** Says a step as it is taken, so that a run stopped part way shows how far. */
    log: (line: string) => void;
    git: ReworkGit;
  }>;

/**
 * The git `rework-pr` runs in the checkout (`git/`), and the record `start`
 * keeps under the clone's git directory, so that every worktree of the clone
 * reads the same one, and nothing in the working tree changes.
 */
export type ReworkGit = Readonly<{
  /** The branch checked out; an error when none is. */
  branch: () => Promise<Result<string, string>>;
  /** What `git status --porcelain` says. */
  status: () => Promise<Result<string, string>>;
  /** The commit checked out, whole. */
  head: () => Promise<Result<string, string>>;
  /**
   * Whether a local branch ever had a commit (`branchHad`): what
   * `--force-if-includes` asks before a forced push.
   */
  branchHad: (branch: string, sha: string) => Promise<Result<boolean, string>>;
  /** The worker's leased push (`git/`), leased against the head as read. */
  pushLeased: (
    push: Readonly<{ branch: string; sha: string; lease: string }>,
  ) => Promise<Result<'moved' | 'pushed', string>>;
  restack: (
    moved: Readonly<{ branch: string; from: string; to: string }>,
    layers: readonly PullRequestFacts[],
  ) => Promise<readonly RestackOutcome[]>;
  /** The record of pull request `number`; `undefined` for none. */
  readRecord: (number: number) => Promise<Result<string | undefined, string>>;
  writeRecord: (
    number: number,
    text: string,
  ) => Promise<Result<undefined, string>>;
  removeRecord: (number: number) => Promise<Result<undefined, string>>;
}>;

type Run = Readonly<{
  world: ReworkPrWorld;
  context: ReadContext;
  branch: string;
}>;

/** How many times `start` reads the events for its own, and how far apart. */
const EVENT_READS = 4;

const EVENT_READ_INTERVAL_MS = 2000;

/**
 * Whether the amend may be pushed over the head GitHub has: `refused`, and why,
 * or `unknown`, when git could not say, which is not a refusal.
 */
type PushCheck = Readonly<
  { kind: 'may' } | { kind: 'refused' | 'unknown'; why: string }
>;

/** A step that failed, and whether as a refusal, which goes on being one. */
type StepFailure = Readonly<{ message: string; refused: boolean }>;

/** The GraphQL mutation of each step that is one: REST can make none of them. */
const MUTATIONS = {
  disarm: 'disablePullRequestAutoMerge',
  draft: 'convertPullRequestToDraft',
  ready: 'markPullRequestReadyForReview',
} as const satisfies ReadonlyRecord<
  StrictExtract<ReworkStep, 'disarm' | 'draft' | 'ready'>,
  PullRequestMutation
>;

const STEP_DESCRIPTIONS = {
  hold: `put ${PullRequestLabel.skipCi} on`,
  dequeue: `take ${PullRequestLabel.mergeQueued} off`,
  disarm: 'disarm auto-merge',
  draft: 'make it a draft',
  push: 'push the branch, leased against the head the queue read',
  restack: 'carry along the pull requests stacked on it',
  ready: 'mark it ready for review',
  requeue: `put ${PullRequestLabel.mergeQueued} back on`,
  forget: `forget what rework-pr start wrote down about ${PullRequestLabel.mergeQueued}`,
} as const satisfies ReadonlyRecord<ReworkStep, string>;

const wouldDo = (number: number, steps: readonly ReworkStep[]): string =>
  Arr.isNonEmpty(steps)
    ? Arr.toUnshifted(`#${number}: would`)(
        steps.map((step) => `  - ${STEP_DESCRIPTIONS[step]}`),
      ).join('\n')
    : (`#${number}: nothing to do` as const);

const readOpen = async (run: Run): Promise<Result<ReworkState, string>> => {
  const read = await readOpenPullRequestOf(run.context, run.branch);

  return Result.isErr(read)
    ? Result.err(messageOf(read.value))
    : read.value === undefined
      ? Result.err('the branch has no open pull request; open-pr opens one')
      : Result.ok(read.value);
};

/**
 * Takes `merge-queued` off, and writes down the event of it. Off already,
 * someone else took it off after the pull request was read, and the event is
 * theirs, so nothing is written down for `done --requeue` to put back.
 */
const dequeue = async (
  run: Run,
  number: number,
): Promise<Result<undefined, StepFailure>> => {
  const readEvents = async (): Promise<Result<readonly QueueEvent[], string>> =>
    Result.mapErr(await readQueueEvents(run.context, number), messageOf);

  // The newest event before, which the one taking the label off comes after.
  const before = await readEvents();

  const removed = await removeLabel(
    run.context,
    number,
    PullRequestLabel.mergeQueued,
  );

  if (Result.isErr(removed)) {
    return Result.err({ message: removed.value, refused: false });
  }

  if (removed.value === 'absent') {
    return Result.ok(undefined);
  }

  const own = Result.isErr(before)
    ? before
    : await readOwnDequeueEvent(
        readEvents,
        async () => run.world.sleep(EVENT_READ_INTERVAL_MS),
        // Sorted by id. A read that lags may leave out an unlabel made just
        // before, which a later read then shows above `after`: this narrows
        // taking another's event for this run's, and does not close it; what
        // that costs is `done --requeue` leaving the label to the author.
        before.value.at(-1)?.id ?? 0,
      );

  const written = Result.isErr(own)
    ? own
    : await run.world.git.writeRecord(number, `${own.value}\n`);

  // Not a failure: the pull request is out of the queue, which is what `start`
  // is for, and the steps after this one still have to run. What is lost is
  // only `done --requeue` putting the label back.
  if (Result.isErr(written)) {
    run.world.log(
      `#${number}: cannot write down that ${PullRequestLabel.mergeQueued} was on (${written.value}), so rework-pr done --requeue will leave it to the author`,
    );
  }

  return Result.ok(undefined);
};

/**
 * Whether the amend may be pushed over the head GitHub has, or `unknown` when
 * the local branch's history cannot be read. Refused when the local branch never
 * had that head: the lease alone would take any head there now, and such a one
 * is a push not built on, which the amend would throw away. A layer this
 * repository's own restack carried along is one too, until fetched and put
 * under the amend, as v1's `--force-if-includes` had it.
 */
const pushCheck = async (
  run: Run,
  standing: ReworkStanding<PullRequestFacts>,
): Promise<PushCheck> => {
  const { pr } = standing;

  const had = await run.world.git.branchHad(run.branch, pr.headSha);

  return Result.isErr(had)
    ? {
        kind: 'unknown',
        why: `the local branch's history cannot be read: ${had.value}`,
      }
    : had.value
      ? { kind: 'may' }
      : {
          kind: 'refused',
          why: `${pr.headRef} is at ${pr.headSha.slice(0, 10)} on GitHub, which the local branch never had, or its reflog no longer has (someone else pushed it, or a restack carried it along): git fetch origin ${pr.headRef}, put the amend on it, and run rework-pr done again.`,
        };
};

/**
 * Pushes the commit checked out to the branch, leased against the head the
 * queue read, with the worker's push, once the local branch is known to have
 * had that head: a push someone else made before the read is refused as
 * `--force-if-includes` refuses it, one made after by the lease, and a push
 * whose answer was lost is told from one that failed by reading the branch
 * again.
 */
const pushAmend = async (
  run: Run,
  standing: ReworkStanding<PullRequestFacts>,
): Promise<Result<undefined, string>> => {
  const head = await run.world.git.head();

  if (Result.isErr(head)) {
    return head;
  }

  const { pr } = standing;

  const check = await pushCheck(run, standing);

  if (check.kind !== 'may') {
    return Result.err(
      check.kind === 'unknown'
        ? `cannot tell whether it may push: ${check.why}`
        : check.why,
    );
  }

  const pushed = await run.world.git.pushLeased({
    branch: pr.headRef,
    sha: head.value,
    lease: pr.headSha,
  });

  return Result.isErr(pushed)
    ? pushed
    : pushed.value === 'moved'
      ? Result.err(
          `${pr.headRef} moved since the queue read it at ${pr.headSha.slice(0, 10)}: git fetch origin ${pr.headRef}, put the amend on it, and run rework-pr done again.`,
        )
      : Result.ok(undefined);
};

/**
 * Carries the layers along after the push, from the head the queue read to the
 * one checked out. A head that had not moved when read carries nothing: the
 * amend was pushed already, by hand or by a run that stopped, and a layer still
 * on an older head is replayed by hand.
 */
const carryAlong = async (
  run: Run,
  number: number,
  standing: ReworkStanding<PullRequestFacts>,
): Promise<Result<undefined, string>> => {
  const head = await run.world.git.head();

  if (Result.isErr(head)) {
    return head;
  }

  const { pr, layers } = standing;

  if (head.value === pr.headSha) {
    run.world.log(
      `#${number}: its head had not moved when this run read it, so nothing is carried along. A layer still on an older head, because the amend was pushed by hand or by a run that stopped, is replayed with git rebase --onto.`,
    );

    return Result.ok(undefined);
  }

  const outcomes = await run.world.git.restack(
    { branch: pr.headRef, from: pr.headSha, to: head.value },
    layers,
  );

  for (const line of restackLines(outcomes)) {
    run.world.log(line);
  }

  return Result.ok(undefined);
};

/** One step; a failure says whether it is a refusal, which goes on being one. */
const runStep = async (
  run: Run,
  state: ReworkState,
  step: ReworkStep,
  standing: ReworkStanding<PullRequestFacts>,
): Promise<Result<undefined, StepFailure>> => {
  const { world, context } = run;

  const failing = (
    done: Result<undefined, string>,
  ): Result<undefined, StepFailure> =>
    Result.mapErr(done, (message) => ({ message, refused: false }));

  switch (step) {
    case 'hold':
      return failing(
        await addLabel(context, state.number, PullRequestLabel.skipCi),
      );

    case 'dequeue':
      return dequeue(run, state.number);

    case 'disarm':
    case 'draft':
    case 'ready':
      return Result.mapErr(
        await mutatePullRequest(context, MUTATIONS[step], state.nodeId),
        (error) => ({
          message: notWritten(error),
          refused: error.kind === 'refused',
        }),
      );

    case 'push':
      return failing(await pushAmend(run, standing));

    case 'restack':
      return failing(await carryAlong(run, state.number, standing));

    case 'requeue':
      return failing(
        await addLabel(context, state.number, PullRequestLabel.mergeQueued),
      );

    case 'forget':
      return failing(await world.git.removeRecord(state.number));
  }
};

/** `steps` in order, each holding the pull request for the next. */
const runSteps = async (
  run: Run,
  state: ReworkState,
  steps: readonly ReworkStep[],
  standing: ReworkStanding<PullRequestFacts>,
): Promise<Result<undefined, string>> => {
  for (const step of steps) {
    // Each step holds the pull request for the next.
    // eslint-disable-next-line no-await-in-loop
    const done = await runStep(run, state, step, standing);

    if (Result.isErr(done)) {
      return Result.err(
        `#${state.number}: cannot ${STEP_DESCRIPTIONS[step]}: ${done.value.message}`,
      );
    }

    // `restack` says of each layer whether it moved.
    if (step !== 'restack') {
      run.world.log(`#${state.number}: ${STEP_DESCRIPTIONS[step]}`);
    }
  }

  return Result.ok(undefined);
};

const start = async (
  run: Run,
  first: ReworkState,
  standing: ReworkStanding<PullRequestFacts>,
): Promise<Result<string, string>> => {
  const labelSteps = startSteps(first).filter(
    (step) => step === 'hold' || step === 'dequeue',
  );

  const labelled = await runSteps(run, first, labelSteps, standing);

  if (Result.isErr(labelled)) {
    return labelled;
  }

  const current = Arr.isNonEmpty(labelSteps)
    ? await readOpenPullRequestOf(run.context, run.branch)
    : Result.ok(first);

  if (Result.isErr(current)) {
    return Result.err(
      `#${first.number}: cannot read it again: ${messageOf(current.value)}`,
    );
  }

  if (current.value === undefined) {
    return Result.err(
      `#${first.number} is no longer open: merged or closed meanwhile?`,
    );
  }

  const state = current.value;

  const steps = startSteps(state);

  const held = await runSteps(
    run,
    state,
    steps.filter((step) => step !== 'draft'),
    standing,
  );

  if (Result.isErr(held)) {
    return held;
  }

  const done =
    `#${state.number}: out of the queue for more work; run rework-pr done --requeue or --review once it is committed.` as const;

  if (!steps.includes('draft')) {
    return Result.ok(done);
  }

  const drafted = await runStep(run, state, 'draft', standing);

  if (Result.isOk(drafted)) {
    run.world.log(`#${state.number}: ${STEP_DESCRIPTIONS.draft}`);

    return Result.ok(done);
  }

  const failed =
    `#${state.number}: cannot ${STEP_DESCRIPTIONS.draft}: ${drafted.value.message}` as const;

  // Refused goes on being refused; anything else may pass when tried again.
  if (!drafted.value.refused) {
    return Result.err(
      `${failed}. It is held all the same; run rework-pr start again to make it one.`,
    );
  }

  run.world.log(
    `${failed}. It is held all the same, so the work can go on; it is just not marked as a draft.`,
  );

  return Result.ok(done);
};

/**
 * What `start` wrote down about pull request `number`, as it reads now. Only
 * `requeue` acts on whether it is `untouched`, so for `review` a record is not
 * compared with the label's events and is answered as `moved`.
 */
const readQueueRecord = async (
  run: Run,
  number: number,
  handBack: ReworkHandBack,
): Promise<Result<QueueRecord, string>> => {
  const recorded = await run.world.git.readRecord(number);

  if (Result.isErr(recorded)) {
    return recorded;
  }

  if (recorded.value === undefined) {
    return Result.ok('none');
  }

  if (handBack === 'review') {
    return Result.ok('moved');
  }

  const events = await readQueueEvents(run.context, number);

  if (Result.isErr(events)) {
    return Result.err(messageOf(events.value));
  }

  const id = Num.from(recorded.value.trim());

  return Result.ok(
    Number.isSafeInteger(id) && isUntouchedSince(events.value, id)
      ? 'untouched'
      : 'moved',
  );
};

/** {@link doneSteps} for the pull request, with what `start` wrote down. */
const doneStepsFor = async (
  run: Run,
  state: ReworkState,
  handBack: ReworkHandBack,
  standing: ReworkStanding<PullRequestFacts>,
): Promise<Result<readonly ReworkStep[], string>> => {
  for (const held of standing.held) {
    run.world.log(
      `#${held}: not carried along: someone holds a claim on it, or its comments could not be read.`,
    );
  }

  const record = await readQueueRecord(run, state.number, handBack);

  if (Result.isErr(record)) {
    const message =
      `#${state.number}: cannot read whether rework-pr start took ${PullRequestLabel.mergeQueued} off: ${record.value}` as const;

    // `--review` reads it only to forget it, so it does not stop for it.
    if (handBack === 'requeue') {
      return Result.err(message);
    }

    run.world.log(`${message}; it is left where it is`);
  }

  const steps = doneSteps(
    state,
    handBack,
    Result.isOk(record) ? record.value : 'none',
    Arr.isNonEmpty(standing.layers),
  );

  return Result.isErr(steps)
    ? Result.err(`#${state.number}: ${steps.value}`)
    : steps;
};
