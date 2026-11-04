import * as fs from 'node:fs/promises';
import {
  AUTO_REBASE_LABEL,
  parseMergeAfter,
  SKIP_CI_LABEL,
} from 'pr-report-core';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { addLabel, log, type ApiContext } from '../lib/index.mjs';
import { descriptionProblems } from '../pr-description/index.mjs';
import { readConfig } from '../unblock-prs/index.mjs';
import {
  containsBase,
  createPullRequest,
  findOpenPullRequest,
  findStackParent,
  lastCommitSubject,
  listStackParents,
  markReady,
  missingInheritedOrder,
  preflight,
  pushBranch,
  readSuccessor,
  updateBody,
  viewPullRequest,
} from './github.mjs';
import type { Options } from './options.mjs';
import {
  existingConflict,
  mergeAfterTrailer,
  mergeBeforeNote,
  resolveBase,
  undeclared,
  withMergeAfter,
  withStackParent,
} from './steps.mjs';
import type { PullRequest } from './types.mjs';

/**
 * Opens the pull request for the current branch the way this repository wants
 * one opened: push, create it ready for review, add `skip-ci`, then
 * `auto-rebase`.
 *
 * **It never arms auto-merge.** `unblock-prs` does, when it picks the pull
 * request — once the author has queued it with `merge-queued`, and once it is
 * onto the default branch. Armed any earlier, it would merge the moment its
 * checks went green, reviewed or not; and a stacked one, onto a branch no
 * ruleset covers, the moment nothing held it, into the layer below. So
 * `skip-ci` holds the checks and nothing is armed until the queue says so.
 *
 * Every step is skipped when it is already done, so a run that failed part way
 * through is finished by running it again rather than unpicked.
 *
 * **`auto-rebase` goes on every layer, stacked or not.** `unblock-prs` keeps
 * only a pull request based on the default branch on its tip, so on a layer
 * above it does nothing until the layer below merges and GitHub moves this one
 * onto the default branch — the moment it is needed, and one at which nothing
 * would add it. It goes on after `skip-ci`, so that its own `labeled` run finds
 * the checks held.
 *
 * **A `--base` other than the default branch stacks it** on the open pull
 * request that branch is from, which has to exist and which the branch has to
 * contain, and declares that one with `Merge-After:` as well.
 *
 * **A pull request already open for the branch is taken as it is**: its title
 * and body are kept, what it should declare and does not yet is added to its
 * `Merge-After:`, and without `--base` its own base is the base, so a stacked
 * one stays stacked. One open against another base than a `--base` given, or
 * named by its own `--merge-after` or `--merge-before`, is refused before
 * anything is pushed (`existingConflict`).
 *
 * **What the issues it closes start after is declared too**: the open pull
 * requests their `Start-After:` comes to (`docs/issue-start-after.md`), written
 * into the body's `Merge-After:` once GitHub has read which issues the body
 * closes. The readers inherit it without, so the body is saying what they
 * already derive.
 *
 * **`--merge-before` declares the order from the other end**, for work found to
 * come first after the pull request that needs it was opened: this one's number
 * is written into the `Merge-After:` of each pull request named, and a line
 * saying so into this one's body. The declaration stays where every reader
 * looks for why a pull request waits — in the body of the one that waits — so
 * there is no second syntax to read. The pull requests named are checked to be
 * open before anything is pushed.
 *
 * **A `--body-file` written in two languages is checked** before anything is
 * pushed, when the repository names a translation heading
 * (`../pr-description/README.md`) and the pull request is to be opened: a body
 * whose halves do not mirror each other is refused, as `pr-description push`
 * refuses it later.
 */
export const openPullRequest = async (
  options: Options,
): Promise<Result<string, string>> => {
  const context = await preflight();

  if (Result.isErr(context)) {
    return context;
  }

  const { api, branch, defaultBranch } = context.value;

  // Read first, so that a conflict is refused with nothing done, and so that a
  // run without `--base` on a pull request opened stacked stays stacked. An
  // open pull request is still found after a push, which changes nothing about
  // it but its head.
  const existing = await findOpenPullRequest(api, branch);

  if (Result.isErr(existing)) {
    return existing;
  }

  if (existing.value === undefined) {
    const checked = await checkBodyFile(options.bodyFile);

    if (Result.isErr(checked)) {
      return checked;
    }
  } else {
    const conflict = existingConflict(existing.value, options);

    if (conflict !== undefined) {
      return Result.err(conflict);
    }

    if (
      !options.dryRun &&
      (options.title !== undefined || options.bodyFile !== undefined)
    ) {
      log(
        `#${existing.value.number}: open already; its title and body are kept, and --title and --body-file are not applied (edit the body with pr-description)`,
      );
    }
  }

  const base = resolveBase(options.base, existing.value, defaultBranch);

  const parent =
    base === defaultBranch
      ? undefined
      : options.base === undefined
        ? await layerBelow(api, base)
        : await stackOn(api, base);

  if (parent !== undefined && Result.isErr(parent)) {
    return parent;
  }

  const mergeAfter = withStackParent(options.mergeAfter, parent?.value);

  const successors = await checkSuccessors(
    api,
    options.mergeBefore,
    mergeAfter,
    defaultBranch,
  );

  if (Result.isErr(successors)) {
    return successors;
  }

  if (options.dryRun) {
    return dryRun(
      branch,
      base,
      options,
      existing.value,
      parent?.value,
      mergeAfter,
    );
  }

  const pushed = await pushBranch(branch);

  if (Result.isErr(pushed)) {
    return Result.err(`cannot push: ${pushed.value}`);
  }

  log(`pushed ${branch}`);

  const prNumber =
    existing.value === undefined
      ? await open(api, branch, base, options, mergeAfter)
      : Result.ok(existing.value.number);

  if (Result.isErr(prNumber)) {
    return prNumber;
  }

  // Re-read rather than reuse what the listing said: between then and now
  // this run has created it.
  const created = await viewPullRequest(api, prNumber.value);

  if (Result.isErr(created)) {
    return created;
  }

  if (created.value.isDraft) {
    const ready = await markReady(api, created.value.nodeId);

    if (Result.isErr(ready)) {
      return Result.err(`cannot mark it ready for review: ${ready.value}`);
    }

    log(`#${prNumber.value}: marked ready for review`);
  }

  const carried = await carryStartAfter(api, prNumber.value, mergeAfter);

  if (Result.isErr(carried)) {
    return carried;
  }

  const declared = await declareBefore(
    api,
    prNumber.value,
    options.mergeBefore,
    defaultBranch,
  );

  if (Result.isErr(declared)) {
    return declared;
  }

  const labelled = await addLabel(api, prNumber.value, SKIP_CI_LABEL);

  if (Result.isErr(labelled)) {
    return Result.err(`cannot add ${SKIP_CI_LABEL}: ${labelled.value}`);
  }

  log(`#${prNumber.value}: ${SKIP_CI_LABEL} is on`);

  const autoRebase = await addLabel(api, prNumber.value, AUTO_REBASE_LABEL);

  if (Result.isErr(autoRebase)) {
    return Result.err(`cannot add ${AUTO_REBASE_LABEL}: ${autoRebase.value}`);
  }

  log(`#${prNumber.value}: ${AUTO_REBASE_LABEL} is on`);

  return Result.ok(
    [
      `#${prNumber.value}: ${existing.value === undefined ? 'opened' : 'open already'}, ${SKIP_CI_LABEL} and ${AUTO_REBASE_LABEL} on, auto-merge left unarmed.`,
      `Once it is reviewed, add merge-queued: unblock-prs arms auto-merge when it picks it${parent === undefined ? '' : `, which is once #${parent.value} has merged`}.`,
    ].join('\n'),
  );
};

/**
 * Writes into the body, as `Merge-After:`, the open pull requests the issues it
 * closes start after (`docs/issue-start-after.md`), once the body exists for
 * GitHub to say which issues those are; and, into a pull request that was open
 * already, what this run declares (the layer below, `--merge-after`) and its
 * body does not, since only a body this run writes starts with it. A run on a
 * body that says them already writes nothing.
 */
const carryStartAfter = async (
  api: ApiContext,
  prNumber: number,
  declared: readonly number[],
): Promise<Result<undefined, string>> => {
  const order = await missingInheritedOrder(api, prNumber, declared);

  if (Result.isErr(order)) {
    return Result.err(`cannot read the issues it closes: ${order.value}`);
  }

  const { body, missing } = order.value;

  const notYet = undeclared(body, declared);

  const toWrite = [...notYet, ...missing] as const;

  if (!Arr.isNonEmpty(toWrite)) {
    return Result.ok(undefined);
  }

  const updated = await updateBody(
    api,
    prNumber,
    withMergeAfter(body, toWrite),
  );

  if (Result.isErr(updated)) {
    return Result.err(`cannot write the Merge-After: ${updated.value}`);
  }

  if (Arr.isNonEmpty(notYet)) {
    log(
      `#${prNumber}: ${mergeAfterTrailer(notYet) ?? ''}, as this run declares`,
    );
  }

  if (Arr.isNonEmpty(missing)) {
    log(
      `#${prNumber}: ${mergeAfterTrailer(missing) ?? ''}, from the Start-After of the issues it closes`,
    );
  }

  return Result.ok(undefined);
};

/**
 * Refuses a `--merge-before` that names what this one merges after — the layer
 * it is stacked on included, which `parseOptions` cannot see — or a pull
 * request that is not open, before anything is pushed.
 */
const checkSuccessors = async (
  api: ApiContext,
  mergeBefore: readonly number[],
  mergeAfter: readonly number[],
  defaultBranch: string,
): Promise<Result<undefined, string>> => {
  for (const number of mergeBefore) {
    if (mergeAfter.includes(number)) {
      return Result.err(
        `#${number} is what this one merges after, so --merge-before #${number} would be a cycle`,
      );
    }

    const read = await readSuccessor(api, number, defaultBranch);

    if (Result.isErr(read)) {
      return read;
    }
  }

  return Result.ok(undefined);
};

/**
 * Writes `prNumber` into the `Merge-After:` of each `--merge-before` pull
 * request, read again now rather than when it was checked, so that an edit made
 * in between is kept. One that names it already is left as it is.
 */
const declareBefore = async (
  api: ApiContext,
  prNumber: number,
  mergeBefore: readonly number[],
  defaultBranch: string,
): Promise<Result<undefined, string>> => {
  for (const number of mergeBefore) {
    if (number === prNumber) {
      return Result.err(
        `--merge-before #${number} names this pull request itself`,
      );
    }

    const body = await readSuccessor(api, number, defaultBranch);

    if (Result.isErr(body)) {
      return body;
    }

    // A set rather than `includes`, whose strict type guard would leave
    // `prNumber` as `never` past the `continue`.
    const named = new Set(parseMergeAfter(body.value));

    if (named.has(prNumber)) {
      continue;
    }

    const updated = await updateBody(
      api,
      number,
      withMergeAfter(body.value, [prNumber]),
    );

    if (Result.isErr(updated)) {
      return Result.err(
        `cannot write #${prNumber} into the Merge-After of #${number}: ${updated.value}`,
      );
    }

    log(`#${number}: Merge-After #${prNumber} written into its body`);
  }

  return Result.ok(undefined);
};

/**
 * The pull request a new one onto `base` is stacked on, having checked that the
 * branch is on its tip. Asked before anything is pushed, so that a base nothing
 * will recognize as a stack is refused rather than opened.
 */
const stackOn = async (
  api: ApiContext,
  base: string,
): Promise<Result<number, string>> => {
  const parent = await findStackParent(api, base);

  if (Result.isErr(parent)) {
    return parent;
  }

  const contained = await containsBase(base);

  if (Result.isErr(contained)) {
    return contained;
  }

  log(`stacking on #${parent.value} (${base})`);

  return parent;
};

/**
 * The layer below a pull request already open on `base`, found without `--base`
 * having asked for a stack: as {@link stackOn} finds it, except that no open
 * pull request on `base` is no stack rather than a refusal — the layer below
 * merged or closed and GitHub has not moved this one yet, and the run is
 * finishing what an earlier one opened.
 */
const layerBelow = async (
  api: ApiContext,
  base: string,
): Promise<Result<number, string> | undefined> => {
  const listed = await listStackParents(api, base);

  if (Result.isOk(listed) && !Arr.isNonEmpty(listed.value)) {
    log(
      `no open pull request has ${base} as its branch; not declaring a layer below`,
    );

    return undefined;
  }

  return stackOn(api, base);
};

const readBodyFile = async (
  bodyFile: string,
): Promise<Result<string, string>> => {
  const read = await Result.fromPromise(
    // The path is one the operator typed; there is no literal to use here.
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(bodyFile, 'utf8'),
  );

  return Result.isErr(read)
    ? Result.err(`cannot read ${bodyFile}: ${unknownToString(read.value)}`)
    : read;
};

/**
 * Refuses a `--body-file` whose original and translation do not mirror each
 * other, when the repository's configuration names a translation heading.
 */
const checkBodyFile = async (
  bodyFile: string | undefined,
): Promise<Result<undefined, string>> => {
  if (bodyFile === undefined) {
    return Result.ok(undefined);
  }

  const config = await readConfig();

  if (Result.isErr(config)) {
    return config;
  }

  const read = await readBodyFile(bodyFile);

  if (Result.isErr(read)) {
    return read;
  }

  const problems = descriptionProblems(read.value, config.value?.translation);

  return problems === undefined
    ? Result.ok(undefined)
    : Result.err(`${bodyFile}: ${problems}`);
};

const resolveTitle = async (
  options: Options,
): Promise<Result<string, string>> =>
  options.title === undefined ? lastCommitSubject() : Result.ok(options.title);

const resolveBody = async (
  options: Options,
  mergeAfter: readonly number[],
): Promise<Result<string, string>> => {
  const head = [
    mergeAfterTrailer(mergeAfter),
    mergeBeforeNote(options.mergeBefore),
  ].filter((line) => line !== undefined);

  const trailer = Arr.isNonEmpty(head) ? head.join('\n') : undefined;

  if (options.bodyFile === undefined) {
    return Result.ok(trailer === undefined ? '' : `${trailer}\n`);
  }

  const read = await readBodyFile(options.bodyFile);

  if (Result.isErr(read)) {
    return read;
  }

  // The trailer goes first, where `unblock-prs` reads it and a reader sees it
  // before the prose, and the `--merge-before` note with it.
  return Result.ok(
    trailer === undefined ? read.value : `${trailer}\n\n${read.value}`,
  );
};

const open = async (
  api: ApiContext,
  branch: string,
  base: string,
  options: Options,
  mergeAfter: readonly number[],
): Promise<Result<number, string>> => {
  const title = await resolveTitle(options);

  if (Result.isErr(title)) {
    return title;
  }

  const body = await resolveBody(options, mergeAfter);

  if (Result.isErr(body)) {
    return body;
  }

  const created = await createPullRequest({
    api,
    branch,
    base,
    title: title.value,
    body: body.value,
  });

  if (Result.isErr(created)) {
    return Result.err(`cannot create the pull request: ${created.value}`);
  }

  log(`#${created.value}: opened against ${base}`);

  return created;
};

const dryRun = async (
  branch: string,
  base: string,
  options: Options,
  existing: PullRequest | undefined,
  parent: number | undefined,
  mergeAfter: readonly number[],
): Promise<Result<string, string>> => {
  const title = await resolveTitle(options);

  const trailer = mergeAfterTrailer(mergeAfter);

  const steps: readonly string[] = [
    `push ${branch} to origin`,
    existing === undefined
      ? `open a pull request against ${base} titled ${JSON.stringify(Result.isOk(title) ? title.value : '(unreadable)')}`
      : `#${existing.number} is open already against ${existing.base}; keep its title and body${options.title !== undefined || options.bodyFile !== undefined ? ' (--title and --body-file are not applied)' : ''}`,
    existing?.isDraft === true
      ? `#${existing.number}: mark it ready for review`
      : undefined,
    `add ${SKIP_CI_LABEL}`,
    `add ${AUTO_REBASE_LABEL}`,
    parent === undefined
      ? 'leave auto-merge unarmed: unblock-prs arms it when it picks it'
      : `leave auto-merge unarmed: it is stacked on #${parent}, and unblock-prs arms it when it picks it, after #${parent} merges`,
    trailer === undefined
      ? undefined
      : existing === undefined
        ? `declare ${trailer}`
        : `add to its Merge-After whichever of ${trailer.replace('Merge-After: ', '')} it does not name yet`,
    Arr.isNonEmpty(options.mergeBefore)
      ? `write ${existing === undefined ? 'its number' : `#${existing.number}`} into the Merge-After of ${options.mergeBefore.map((n) => `#${n}`).join(', ')}${existing === undefined ? ', and say so in its body' : ''}`
      : undefined,
    'add to Merge-After the open pull requests the issues it closes start after, if the body does not name them',
  ].filter((step) => step !== undefined);

  return Result.ok(
    Arr.toUnshifted('Would:')(steps.map((step) => `  - ${step}`)).join('\n'),
  );
};
