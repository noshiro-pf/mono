import dedent from 'dedent';
import { MERGE_QUEUED_LABEL, SKIP_CI_LABEL } from 'pr-report-core';
import { Arr, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  addLabel,
  git,
  graphql,
  log,
  parseCommandArgs,
  removeLabel,
  rest,
  sh,
  type ApiContext,
} from '../lib/index.mjs';
import { markReady, preflight } from '../open-pr/index.mjs';

/** What `rework-pr --help` prints. */
export const REWORK_PR_HELP = [
  'Usage: rework-pr <start|done> [--dry-run]',
  '',
  'Takes the pull request of the current branch out of the merge queue while',
  'more work goes into it, and gives it back for review once that is pushed.',
  '',
  `  start  put ${SKIP_CI_LABEL} on, take ${MERGE_QUEUED_LABEL} off, disarm auto-merge,`,
  '         and make it a draft; a draft refused is said, and is not a',
  '         failure, since the labels hold it without one',
  '  done   refuse uncommitted changes, push the branch with',
  '         --force-with-lease --force-if-includes, then mark it ready for',
  `         review; ${MERGE_QUEUED_LABEL} stays off, for the author to put back`,
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
 * rework-pr start   # before the first change
 * rework-pr done    # once the amend is committed
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
    log,
  } as const;

  if (args.dryRun) {
    return dryRun(io, args.phase);
  }

  const applied = await applyRework(args.phase, io);

  return Result.isErr(applied)
    ? applied
    : Result.ok(
        args.phase === 'start'
          ? `#${applied.value}: out of the queue for more work; run rework-pr done once it is committed.`
          : `#${applied.value}: pushed and ready for review, ${MERGE_QUEUED_LABEL} off for the author to put back.`,
      );
};

/**
 * Runs `phase` on the pull request `io` reads, and resolves to its number.
 *
 * `start`, each step skipped when already so:
 *
 * 1. **`skip-ci` on**, so that the pushes to come run no checks, and so that
 *    the worker lets go of one it is watching. Where a required status reads
 *    the label, it holds the merge by itself too, which is why it goes before
 *    anything else: on a pull request whose checks are running, any other
 *    label event first would run them again with nothing holding the merge. REST.
 * 2. **`merge-queued` off**, so the worker does not pick it again. REST.
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
 * It does not put `merge-queued` back, which is the author's, nor carry along
 * the pull requests stacked on the branch.
 */
export const applyRework = async (
  phase: ReworkPhase,
  io: ReworkIo,
): Promise<Result<number, string>> => {
  const first = await readOpen(io);

  if (Result.isErr(first)) {
    return first;
  }

  if (phase === 'done') {
    const toDo = doneSteps(first.value);

    return Result.isErr(toDo)
      ? Result.err(`#${first.value.number}: ${toDo.value}`)
      : runSteps(io, first.value, toDo.value);
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

  if (Result.isErr(held) || !steps.includes('draft')) {
    return held;
  }

  const drafted = await runSteps(io, current.value, ['draft']);

  if (Result.isErr(drafted)) {
    io.log(
      `${drafted.value}. It is held all the same, so the work can go on; it is just not marked as a draft.`,
    );
  }

  return Result.ok(current.value.number);
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

/** What `done` has left to do to the pull request, or why it must not. */
export const doneSteps = (
  state: ReworkState,
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
    : Result.ok(
        Arr.toUnshifted('push' as const)(
          state.isDraft ? (['ready'] as const) : [],
        ),
      );
};

/** The command line, or what is wrong with it. */
export const parseReworkArgs = (
  args: readonly string[],
): Result<ReworkArgs | 'help', string> => {
  const parsed = parseCommandArgs(
    // `parseCommandArgs` takes no positionals, so the phase is read here.
    args.filter((arg) => !isReworkPhase(arg)),
    { 'dry-run': { type: 'boolean', default: false } },
  );

  if (Result.isErr(parsed)) {
    return parsed;
  }

  if (parsed.value === 'help') {
    return Result.ok('help');
  }

  const [phase, second] = args.filter(isReworkPhase);

  return phase === undefined || second !== undefined
    ? Result.err('give one of start or done')
    : Result.ok({ phase, dryRun: parsed.value['dry-run'] });
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

export type ReworkArgs = Readonly<{ phase: ReworkPhase; dryRun: boolean }>;

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
  'hold' | 'dequeue' | 'disarm' | 'draft' | 'push' | 'ready';

/** What the steps read and write, so that their order can be tested. */
export type ReworkIo = Readonly<{
  /** The open pull request for the branch, or `undefined`. */
  read: () => Promise<Result<ReworkState | undefined, string>>;
  run: (
    state: ReworkState,
    step: ReworkStep,
  ) => Promise<Result<unknown, string>>;
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
} as const satisfies ReadonlyRecord<ReworkStep, string>;

const PullRequestSchema = t.record({
  number: t.number(),
  node_id: t.string(),
  draft: t.boolean(),
  labels: t.array(t.record({ name: t.string() })),
  auto_merge: t.unknown(),
});

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

/** `steps` in order, each holding the pull request for the next. */
const runSteps = async (
  io: ReworkIo,
  state: ReworkState,
  steps: readonly ReworkStep[],
): Promise<Result<number, string>> => {
  for (const step of steps) {
    const done = await io.run(state, step);

    if (Result.isErr(done)) {
      return Result.err(
        `#${state.number}: cannot ${STEP_DESCRIPTIONS[step]}: ${done.value}`,
      );
    }

    io.log(`#${state.number}: ${STEP_DESCRIPTIONS[step]}`);
  }

  return Result.ok(state.number);
};

const dryRun = async (
  io: ReworkIo,
  phase: ReworkPhase,
): Promise<Result<string, string>> => {
  const state = await readOpen(io);

  if (Result.isErr(state)) {
    return state;
  }

  const { number } = state.value;

  const steps =
    phase === 'start'
      ? Result.ok(startSteps(state.value))
      : doneSteps(state.value);

  return Result.isErr(steps)
    ? Result.err(`#${number}: ${steps.value}`)
    : Result.ok(
        Arr.isNonEmpty(steps.value)
          ? Arr.toUnshifted(`#${number}: would`)(
              steps.value.map((step) => `  - ${STEP_DESCRIPTIONS[step]}`),
            ).join('\n')
          : `#${number}: nothing to do`,
      );
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

    case 'dequeue':
      return removeLabel(api, state.number, MERGE_QUEUED_LABEL);

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
