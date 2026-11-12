/**
 * `open-pr` (`spec/commands.md`): opens the pull request for the current branch
 * the way this repository wants one opened. Push, create it ready for review,
 * add `skip-ci`, then `auto-rebase`. The decisions are `pr-report-core-v2`'s
 * (`decide/open-pr.mts`); this runs them against git and GitHub.
 *
 * **It never arms auto-merge.** `unblock-prs` does, when it picks the pull
 * request: once the author has queued it with `merge-queued`, and once it is
 * onto the default branch. Armed any earlier, it would merge the moment its
 * checks went green, reviewed or not; and a stacked one, onto a branch no
 * ruleset covers, into the layer below.
 *
 * Every step is skipped when it is already done, so a run that failed part way
 * through is finished by running it again. Everything that can refuse is asked
 * before the push: the branch, a pull request already open for it (its base and
 * its own number named), the body file, the layer below, the `--merge-before`
 * pull requests.
 *
 * **Changed in v2**: the labels go on as soon as the pull request exists, before
 * a draft is marked ready and before any body is written. v1 put them on last,
 * so that a run failing in between left a pull request open with its checks
 * running and nothing holding the merge.
 */

import {
  createPullRequest,
  descriptionProblems,
  existingConflict,
  isGone,
  isNotFound,
  mergeAfterTrailer,
  mergeBeforeCycle,
  missingInheritedOrder,
  ownPullRequest,
  parseMergeAfter,
  parseMergesBefore,
  PullRequestLabel,
  readClosingOrder,
  readDescription,
  readOpenPullRequestsHeaded,
  readSuccessor,
  resolveBase,
  stackParent,
  successorRefusal,
  undeclared,
  withMergeAfter,
  withMergeBeforeNote,
  withStackParent,
  writeDescription,
  type PullRequestTarget,
  type ReadContext,
} from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import type { Config } from '../../config/index.mjs';
import {
  addLabel,
  messageOf,
  mutatePullRequest,
  notWritten,
  openRepository,
  type SessionWorld,
} from '../../github/index.mjs';
import type { OpenPrOptions } from './options.mjs';

export const openPr = async (
  options: OpenPrOptions,
  world: OpenPrWorld,
): Promise<Result<string, string>> => {
  const branch = await world.git.branch();

  if (Result.isErr(branch)) {
    return branch;
  }

  const opened = await openRepository(undefined, world);

  if (Result.isErr(opened)) {
    return opened;
  }

  const { context, defaultBranch } = opened.value;

  if (branch.value === defaultBranch) {
    return Result.err(
      `the current branch is ${branch.value}, which is what pull requests target; make a branch first`,
    );
  }

  const run: Run = {
    options,
    world,
    context,
    branch: branch.value,
    defaultBranch,
  } as const;

  const listed = await readOpenPullRequestsHeaded(context, branch.value);

  if (Result.isErr(listed)) {
    return Result.err(messageOf(listed.value));
  }

  // Read first, so that a conflict is refused with nothing done, and so that a
  // run without `--base` on a pull request opened stacked stays stacked.
  const existing = ownPullRequest(branch.value, listed.value);

  if (Result.isErr(existing)) {
    return existing;
  }

  if (existing.value !== undefined) {
    const conflict = existingConflict(existing.value, options);

    if (conflict !== undefined) {
      return Result.err(conflict);
    }

    if (
      !options.dryRun &&
      (options.title !== undefined || options.bodyFile !== undefined)
    ) {
      world.log(
        `#${existing.value.number}: open already; its title and body are kept, and --title and --body-file are not applied (edit the body with pr-description)`,
      );
    }
  }

  const bodyText =
    existing.value === undefined
      ? await bodyFileText(run)
      : Result.ok(undefined);

  if (Result.isErr(bodyText)) {
    return bodyText;
  }

  const base = resolveBase(options.base, existing.value, defaultBranch);

  const parent =
    base === defaultBranch
      ? Result.ok(undefined)
      : await layerBelow(run, base, options.base === undefined);

  if (Result.isErr(parent)) {
    return parent;
  }

  const mergeAfter = withStackParent(options.mergeAfter, parent.value);

  const successors = await checkSuccessors(run, mergeAfter);

  if (Result.isErr(successors)) {
    return successors;
  }

  const plan: Plan = {
    existing: existing.value,
    base,
    parent: parent.value,
    mergeAfter,
    bodyText: bodyText.value,
  } as const;

  return options.dryRun ? dryRun(run, plan) : act(run, plan);
};

/** What the command acts on the world through; a test passes recorded ones. */
export type OpenPrWorld = SessionWorld &
  Readonly<{
    readConfig: () => Promise<Result<Config | undefined, string>>;
    readText: (path: string) => Promise<Result<string, string>>;
    /** A line said to the operator beside the result. */
    log: (line: string) => void;
    git: Readonly<{
      /** The branch checked out; an error on a detached HEAD. */
      branch: () => Promise<Result<string, string>>;
      /** The subject of the branch tip, the default title. */
      lastSubject: () => Promise<Result<string, string>>;
      /** Pushes `branch` to `origin` and sets its upstream. */
      push: (branch: string) => Promise<Result<undefined, string>>;
      /**
       * Whether the branch contains the tip of `origin/<base>`, fetched now, as
       * a layer stacked on it has to: one that does not shows the layer below's
       * old commits in its diff. The error says why not.
       */
      containsBase: (base: string) => Promise<Result<undefined, string>>;
    }>;
  }>;

/** What every step of one run reads. */
type Run = Readonly<{
  options: OpenPrOptions;
  world: OpenPrWorld;
  context: ReadContext;
  branch: string;
  defaultBranch: string;
}>;

/** What the checks before the push decided. */
type Plan = Readonly<{
  /** The pull request open for the branch already. */
  existing: PullRequestTarget | undefined;
  base: string;
  /** The layer below, when stacked. */
  parent: number | undefined;
  /** What this run declares: the layer below, then `--merge-after`. */
  mergeAfter: readonly number[];
  /** The `--body-file`, read and checked, for a pull request to open. */
  bodyText: string | undefined;
}>;

/**
 * The `--body-file` of a pull request to be opened, refused when the repository
 * names a translation heading and its halves do not mirror each other;
 * `undefined` when none is given.
 */
const bodyFileText = async ({
  options,
  world,
}: Run): Promise<Result<string | undefined, string>> => {
  if (options.bodyFile === undefined) {
    return Result.ok(undefined);
  }

  const config = await world.readConfig();

  if (Result.isErr(config)) {
    return config;
  }

  const text = await world.readText(options.bodyFile);

  if (Result.isErr(text)) {
    return text;
  }

  const problems = descriptionProblems(
    text.value,
    config.value?.translation,
    'pull-request',
    config.value?.openingHeading,
  );

  return problems === undefined
    ? Result.ok(text.value)
    : Result.err(`${options.bodyFile}: ${problems}`);
};

/**
 * The pull request a run onto `base` is stacked on, having checked that the
 * branch contains its tip. Without `--base` (`inherited`, the base of the pull
 * request open already), no open pull request from `base` is no stack rather
 * than a refusal: the layer below merged or closed and GitHub has not moved
 * this one yet, and the run is finishing what an earlier one opened.
 */
const layerBelow = async (
  { context, world }: Run,
  base: string,
  inherited: boolean,
): Promise<Result<number | undefined, string>> => {
  const listed = await readOpenPullRequestsHeaded(context, base);

  if (Result.isErr(listed)) {
    return Result.err(messageOf(listed.value));
  }

  if (inherited && !Arr.isNonEmpty(listed.value)) {
    world.log(
      `no open pull request has ${base} as its branch; not declaring a layer below`,
    );

    return Result.ok(undefined);
  }

  const parent = stackParent(base, listed.value);

  if (Result.isErr(parent)) {
    return parent;
  }

  // On a dry run too, as v1: the check is a fetch, which updates the
  // remote-tracking branch alone, and a dry run makes every check a run makes
  // before its first write (`spec/commands.md`).
  const contained = await world.git.containsBase(base);

  if (Result.isErr(contained)) {
    return contained;
  }

  world.log(`stacking on #${parent.value} (${base})`);

  return parent;
};

/**
 * Refuses a `--merge-before` that names what this one merges after (the layer
 * it is stacked on included, which the options cannot see), or a pull request
 * it may not write into, before anything is pushed.
 */
const checkSuccessors = async (
  { options, context, defaultBranch }: Run,
  mergeAfter: readonly number[],
): Promise<Result<undefined, string>> => {
  const cycle = options.mergeBefore.find((n) => mergeAfter.includes(n));

  if (cycle !== undefined) {
    return Result.err(
      `#${cycle} is what this one merges after, so --merge-before #${cycle} would be a cycle`,
    );
  }

  const refusals = await Promise.all(
    options.mergeBefore.map(async (number) => {
      const read = await readSuccessor(context, number);

      return Result.isErr(read)
        ? messageOf(read.value)
        : successorRefusal(number, read.value, defaultBranch);
    }),
  );

  const refused = refusals.find((refusal) => refusal !== undefined);

  return refused === undefined ? Result.ok(undefined) : Result.err(refused);
};

/**
 * The body a pull request is opened with: the `Merge-After:` line first, where
 * `unblock-prs` reads it and a reader sees it before the prose, then the body
 * file. The `--merge-before` note waits for what it says to be so
 * ({@link declareBefore}).
 */
const bodyOf = (plan: Plan): string => {
  const trailer = mergeAfterTrailer(plan.mergeAfter);

  return plan.bodyText === undefined
    ? trailer === undefined
      ? ''
      : `${trailer}\n`
    : trailer === undefined
      ? plan.bodyText
      : `${trailer}\n\n${plan.bodyText}`;
};

/** Creates it, titled and with the body the options say. */
const open = async (
  { options, world, context, branch }: Run,
  plan: Plan,
): Promise<Result<number, string>> => {
  const title =
    options.title === undefined
      ? await world.git.lastSubject()
      : Result.ok(options.title);

  if (Result.isErr(title)) {
    return title;
  }

  const created = await createPullRequest(context, {
    head: branch,
    base: plan.base,
    title: title.value,
    body: bodyOf(plan),
  });

  if (Result.isErr(created)) {
    return Result.err(notWritten(created.value));
  }

  world.log(`#${created.value}: opened against ${plan.base}`);

  return created;
};

/** `skip-ci`, then `auto-rebase`, so that the latter's run finds checks held. */
const addLabels = async (
  { world, context }: Run,
  number: number,
): Promise<Result<undefined, string>> => {
  for (const label of [
    PullRequestLabel.skipCi,
    PullRequestLabel.autoRebase,
  ] as const) {
    // eslint-disable-next-line no-await-in-loop -- in order: `auto-rebase`'s run has to find `skip-ci` on
    const added = await addLabel(context, number, label);

    if (Result.isErr(added)) {
      return added;
    }

    world.log(`#${number}: ${label} is on`);
  }

  return Result.ok(undefined);
};

/**
 * The pull request open already, listed again after the push, during which it
 * may have been closed, which stops the run before it labels or writes into a
 * closed one, or made a draft. One request on a run that finds one open (a
 * re-run's); one that fails takes it as listed before, so that the labels
 * still go on.
 */
const stillOpen = async (
  { world, context, branch }: Run,
  existing: PullRequestTarget,
): Promise<Result<PullRequestTarget, string>> => {
  const listed = await readOpenPullRequestsHeaded(context, branch);

  // Not knowing is no reason to leave it unlabelled with fresh commits: taken
  // as it was listed before the push.
  if (Result.isErr(listed)) {
    world.log(
      `${messageOf(listed.value)}; taking #${existing.number} as it was before the push`,
    );

    return Result.ok(existing);
  }

  const found = listed.value.find(({ number }) => number === existing.number);

  return found === undefined
    ? Result.err(
        `#${existing.number} is no longer open from ${branch}; nothing was written into it`,
      )
    : Result.ok(found);
};

/**
 * Takes one open already out of draft, which `unblock-prs` passes over:
 * GraphQL, which REST cannot do. One opened by `open-pr` is never a draft.
 */
const markReady = async (
  { world, context }: Run,
  existing: PullRequestTarget | undefined,
): Promise<Result<undefined, string>> => {
  if (existing?.isDraft !== true) {
    return Result.ok(undefined);
  }

  const ready = await mutatePullRequest(
    context,
    'markPullRequestReadyForReview',
    existing.nodeId,
  );

  if (Result.isErr(ready)) {
    return Result.err(
      `#${existing.number}: ${notWritten(ready.value)}; mark it ready for review on GitHub`,
    );
  }

  world.log(`#${existing.number}: marked ready for review`);

  return Result.ok(undefined);
};

/**
 * Writes into its `Merge-After:` what this run declares and the body does not
 * (on a pull request open already, whose body this run did not write), and the
 * open pull requests the issues it closes start after
 * (`docs/issue-start-after.md`), read once the body exists for GitHub to mark
 * which issues it closes.
 */
const carryOrder = async (
  { world, context }: Run,
  number: number,
  declared: readonly number[],
): Promise<Result<undefined, string>> => {
  const order = await readClosingOrder(context, number);

  if (Result.isErr(order)) {
    return Result.err(messageOf(order.value));
  }

  const { body } = order.value;

  const notYet = undeclared(body, declared);

  const missing = missingInheritedOrder(number, order.value, declared);

  const toWrite = [...notYet, ...missing] as const;

  if (!Arr.isNonEmpty(toWrite)) {
    return Result.ok(undefined);
  }

  const written = withMergeAfter(body, toWrite);

  const updated = await writeDescription(context, number, written);

  if (Result.isErr(updated)) {
    return Result.err(notWritten(updated.value));
  }

  if (Arr.isNonEmpty(notYet)) {
    world.log(`#${number}: ${mergeAfterTrailer(notYet)}, as this run declares`);
  }

  if (Arr.isNonEmpty(missing)) {
    world.log(
      `#${number}: ${mergeAfterTrailer(missing)}, from the Start-After of the issues it closes`,
    );
  }

  return Result.ok(undefined);
};

/** Writes `number` into `successor`'s `Merge-After:`; whether it wrote. */
const declareInto = async (
  context: ReadContext,
  defaultBranch: string,
  successor: number,
  number: number,
): Promise<Result<boolean, string>> => {
  const read = await readSuccessor(context, successor);

  if (Result.isErr(read)) {
    return Result.err(messageOf(read.value));
  }

  const refusal = successorRefusal(successor, read.value, defaultBranch);

  if (refusal !== undefined) {
    return Result.err(refusal);
  }

  if (parseMergeAfter(read.value.body).includes(number)) {
    return Result.ok(false);
  }

  const updated = await writeDescription(
    context,
    successor,
    withMergeAfter(read.value.body, [number]),
  );

  return Result.isErr(updated)
    ? Result.err(notWritten(updated.value))
    : Result.ok(true);
};

/**
 * Those of `named`, the pull requests the `Merges before` line names already,
 * that still name `number` in their `Merge-After:`: one closed, or edited not
 * to, or gone (404, 410), leaves the line. One that cannot be read otherwise is
 * kept, as the run that wrote it saw it so.
 */
const stillNaming = async (
  context: ReadContext,
  number: number,
  named: readonly number[],
): Promise<readonly number[]> => {
  const reads = await Promise.all(
    named.map(async (each) => ({
      each,
      read: await readSuccessor(context, each),
    })),
  );

  return reads
    .filter(({ read }) =>
      Result.isErr(read)
        ? !isNotFound(read.value) && !isGone(read.value)
        : read.value.state === 'open' &&
          parseMergeAfter(read.value.body).includes(number),
    )
    .map(({ each }) => each);
};

/**
 * Pull request `number`'s body, read now, or the refusal when it merges after
 * one of `mergeBefore`: written there before, from the Start-After of an issue
 * it closes, or, once the successors are written (`written`), by an edit made
 * meanwhile, which leaves the two waiting on each other.
 */
const cycleFree = async (
  context: ReadContext,
  number: number,
  mergeBefore: readonly number[],
  written: boolean,
): Promise<Result<string, string>> => {
  const read = await readDescription(context, number);

  if (Result.isErr(read)) {
    return Result.err(messageOf(read.value));
  }

  const cycle = mergeBeforeCycle(mergeBefore, read.value.body);

  return cycle === undefined
    ? Result.ok(read.value.body)
    : Result.err(
        written
          ? `#${number}'s body came to say Merge-After #${cycle} while #${cycle}'s Merge-After was being written to name it: each now waits on the other; take one of them out`
          : `#${number}'s body says Merge-After #${cycle} (written there before, or from the Start-After of an issue it closes), so --merge-before #${cycle} would be a cycle; nothing was written into any --merge-before pull request`,
      );
};

/**
 * Writes `number` into the `Merge-After:` of each `--merge-before` pull
 * request, read again now so that an edit made since the check is kept; one
 * that names it already is left as it is. Then this one's body says so
 * (`withMergeBeforeNote`), once it is so, naming as well those its line named
 * already that still name it and it does not merge after, in the line's order.
 * Nothing is written when this one's body, read right before, merges after one
 * of them: the check before the push saw only what the run declares, and the
 * body of one open already, and what its closing issues add, are known only
 * now; one that came to while they were written is refused, not noted.
 *
 * **Changed in v2**: v1 opened the pull request with the note already in its
 * body, which a cycle refused here left saying what is not so; and it wrote the
 * note only into a pull request it opened.
 */
const declareBefore = async (
  { options, world, context, defaultBranch }: Run,
  number: number,
): Promise<Result<undefined, string>> => {
  if (!Arr.isNonEmpty(options.mergeBefore)) {
    return Result.ok(undefined);
  }

  // Read now, right before the successors are written, as each of them is.
  const before = await cycleFree(context, number, options.mergeBefore, false);

  if (Result.isErr(before)) {
    return before;
  }

  for (const successor of options.mergeBefore) {
    // eslint-disable-next-line no-await-in-loop -- one at a time, so that a failure leaves the rest unwritten and says which
    const written = await declareInto(
      context,
      defaultBranch,
      successor,
      number,
    );

    if (Result.isErr(written)) {
      return written;
    }

    if (written.value) {
      world.log(`#${successor}: Merge-After #${number} written into its body`);
    }
  }

  // Read again: the body may have been edited while they were written.
  const current = await cycleFree(context, number, options.mergeBefore, true);

  if (Result.isErr(current)) {
    return current;
  }

  const body = current.value;

  const named = parseMergesBefore(body);

  const waitedFor = new Set(parseMergeAfter(body));

  // Those named before and not this run, that it does not merge after, which
  // would state a cycle, and that still name it.
  const kept = new Set(
    await stillNaming(
      context,
      number,
      named.filter(
        (each) => !options.mergeBefore.includes(each) && !waitedFor.has(each),
      ),
    ),
  );

  // In the line's order, so that a run naming one it named already changes
  // nothing.
  const noted = withMergeBeforeNote(
    body,
    Arr.uniq([
      ...named.filter(
        (each) => kept.has(each) || options.mergeBefore.includes(each),
      ),
      ...options.mergeBefore,
    ]),
  );

  if (noted === body) {
    return Result.ok(undefined);
  }

  const updated = await writeDescription(context, number, noted);

  return Result.isErr(updated)
    ? Result.err(notWritten(updated.value))
    : Result.ok(undefined);
};

const act = async (run: Run, plan: Plan): Promise<Result<string, string>> => {
  const { world, branch } = run;

  const pushed = await world.git.push(branch);

  if (Result.isErr(pushed)) {
    return Result.err(`cannot push: ${pushed.value}`);
  }

  world.log(`pushed ${branch}`);

  const existing =
    plan.existing === undefined
      ? Result.ok(undefined)
      : await stillOpen(run, plan.existing);

  if (Result.isErr(existing)) {
    return existing;
  }

  const number =
    existing.value === undefined
      ? await open(run, plan)
      : Result.ok(existing.value.number);

  if (Result.isErr(number)) {
    return number;
  }

  // First, now that it exists: one without `skip-ci` runs its checks with
  // nothing holding the merge.
  const labelled = await addLabels(run, number.value);

  if (Result.isErr(labelled)) {
    return labelled;
  }

  const ready = await markReady(run, existing.value);

  if (Result.isErr(ready)) {
    return ready;
  }

  const carried = await carryOrder(run, number.value, plan.mergeAfter);

  if (Result.isErr(carried)) {
    return carried;
  }

  const declared = await declareBefore(run, number.value);

  if (Result.isErr(declared)) {
    return declared;
  }

  return Result.ok(
    [
      `#${number.value}: ${plan.existing === undefined ? 'opened' : 'open already'}, ${PullRequestLabel.skipCi} and ${PullRequestLabel.autoRebase} on, auto-merge left unarmed.`,
      `Once it is reviewed, add ${PullRequestLabel.mergeQueued}: unblock-prs arms auto-merge when it picks it${plan.parent === undefined ? '' : `, which is once #${plan.parent} has merged`}.`,
    ].join('\n'),
  );
};

const dryRun = async (
  { options, world, branch }: Run,
  { existing, base, parent, mergeAfter }: Plan,
): Promise<Result<string, string>> => {
  const title =
    existing !== undefined || options.title !== undefined
      ? Result.ok(options.title ?? '')
      : await world.git.lastSubject();

  const trailer = mergeAfterTrailer(mergeAfter);

  const steps = [
    `push ${branch} to origin`,
    existing === undefined
      ? `open a pull request against ${base} titled ${JSON.stringify(Result.isOk(title) ? title.value : '(unreadable)')}`
      : `#${existing.number} is open already against ${existing.base}; keep its title and body${options.title !== undefined || options.bodyFile !== undefined ? ' (--title and --body-file are not applied)' : ''}`,
    `add ${PullRequestLabel.skipCi}`,
    `add ${PullRequestLabel.autoRebase}`,
    existing?.isDraft === true
      ? `#${existing.number}: mark it ready for review`
      : undefined,
    parent === undefined
      ? 'leave auto-merge unarmed: unblock-prs arms it when it picks it'
      : `leave auto-merge unarmed: it is stacked on #${parent}, and unblock-prs arms it when it picks it, after #${parent} merges`,
    trailer === undefined
      ? undefined
      : existing === undefined
        ? `declare ${trailer}`
        : `add to its Merge-After whichever of ${trailer.replace('Merge-After: ', '')} it does not name yet`,
    'add to Merge-After the open pull requests the issues it closes start after, if the body does not name them',
    Arr.isNonEmpty(options.mergeBefore)
      ? `write ${existing === undefined ? 'its number' : `#${existing.number}`} into the Merge-After of ${options.mergeBefore.map((n) => `#${n}`).join(', ')}, then say so in its body unless it does`
      : undefined,
  ].filter((step) => step !== undefined);

  return Result.ok(
    Arr.toUnshifted('Would:')(steps.map((step) => `  - ${step}`)).join('\n'),
  );
};
