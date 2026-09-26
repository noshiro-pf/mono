import * as fs from 'node:fs/promises';
import { SKIP_CI_LABEL } from 'pr-report-core';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { log } from '../unblock-prs/util.mjs';
import { type ApiContext } from './api.mjs';
import {
  addLabel,
  containsBase,
  createPullRequest,
  findOpenPullRequest,
  findStackParent,
  lastCommitSubject,
  markReady,
  preflight,
  pushBranch,
  viewPullRequest,
} from './github.mjs';
import { HELP, parseOptions, type Options } from './options.mjs';
import { mergeAfterTrailer, withStackParent } from './steps.mjs';

/**
 * Opens the pull request for the current branch the way this repository wants
 * one opened: push, create it ready for review, and add `skip-ci`.
 *
 * **It never arms auto-merge.** `unblock-prs` does, when it picks the pull
 * request — once the author has queued it with `merge-queued`, and once it is
 * onto the default branch. Armed any earlier, it would merge the moment its
 * checks went green, reviewed or not; and a stacked one, onto a branch no
 * ruleset covers, the moment nothing held it, into the layer below. So
 * `skip-ci` holds the checks and nothing is armed until the queue says so.
 *
 * Every step is skipped when it is already done, so a run that failed part
 * way through is finished by running it again rather than unpicked.
 *
 * **A `--base` other than the default branch stacks it** on the open pull
 * request that branch is from, which has to exist and which the branch has to
 * contain, and declares that one with `Merge-After:` as well.
 */
export const openPullRequest = async (
  options: Options,
): Promise<Result<string, string>> => {
  const context = await preflight();

  if (Result.isErr(context)) {
    return context;
  }

  const { api, branch, defaultBranch } = context.value;

  const base = options.base ?? defaultBranch;

  const parent = base === defaultBranch ? undefined : await stackOn(api, base);

  if (parent !== undefined && Result.isErr(parent)) {
    return parent;
  }

  const mergeAfter = withStackParent(options.mergeAfter, parent?.value);

  if (options.dryRun) {
    return dryRun(api, branch, base, options, parent?.value, mergeAfter);
  }

  const pushed = await pushBranch(branch);

  if (Result.isErr(pushed)) {
    return Result.err(`cannot push: ${pushed.value}`);
  }

  log(`pushed ${branch}`);

  const existing = await findOpenPullRequest(api, branch);

  if (Result.isErr(existing)) {
    return existing;
  }

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

  const labelled = await addLabel(api, prNumber.value, SKIP_CI_LABEL);

  if (Result.isErr(labelled)) {
    return Result.err(`cannot add ${SKIP_CI_LABEL}: ${labelled.value}`);
  }

  log(`#${prNumber.value}: ${SKIP_CI_LABEL} is on`);

  return Result.ok(
    [
      `#${prNumber.value}: opened, ${SKIP_CI_LABEL} on, auto-merge left unarmed.`,
      `Once it is reviewed, add merge-queued: unblock-prs arms auto-merge when it picks it${parent === undefined ? '' : `, which is once #${parent.value} has merged`}.`,
    ].join('\n'),
  );
};

/**
 * The pull request a new one onto `base` is stacked on, having checked that
 * the branch is on its tip. Asked before anything is pushed, so that a base
 * nothing will recognize as a stack is refused rather than opened.
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

const resolveTitle = async (
  options: Options,
): Promise<Result<string, string>> =>
  options.title === undefined ? lastCommitSubject() : Result.ok(options.title);

const resolveBody = async (
  options: Options,
  mergeAfter: readonly number[],
): Promise<Result<string, string>> => {
  const trailer = mergeAfterTrailer(mergeAfter);

  if (options.bodyFile === undefined) {
    return Result.ok(trailer === undefined ? '' : `${trailer}\n`);
  }

  const read = await Result.fromPromise(
    // The path is one the operator typed; there is no literal to use here.
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(options.bodyFile, 'utf8'),
  );

  if (Result.isErr(read)) {
    return Result.err(
      `cannot read ${options.bodyFile}: ${unknownToString(read.value)}`,
    );
  }

  // The trailer goes first, where `unblock-prs` reads it and a reader sees it
  // before the prose.
  return Result.ok(
    trailer === undefined ? read.value : `${trailer}\n\n${read.value}`,
  );
};

const dryRun = async (
  api: ApiContext,
  branch: string,
  base: string,
  options: Options,
  parent: number | undefined,
  mergeAfter: readonly number[],
): Promise<Result<string, string>> => {
  const existing = await findOpenPullRequest(api, branch);

  if (Result.isErr(existing)) {
    return existing;
  }

  const title = await resolveTitle(options);

  const trailer = mergeAfterTrailer(mergeAfter);

  const steps: readonly string[] = [
    `push ${branch} to origin`,
    existing.value === undefined
      ? `open a pull request against ${base} titled ${JSON.stringify(Result.isOk(title) ? title.value : '(unreadable)')}`
      : `#${existing.value.number} is open already; leave it as it is`,
    existing.value?.isDraft === true
      ? `#${existing.value.number}: mark it ready for review`
      : undefined,
    `add ${SKIP_CI_LABEL}`,
    parent === undefined
      ? 'leave auto-merge unarmed: unblock-prs arms it when it picks it'
      : `leave auto-merge unarmed: it is stacked on #${parent}, and unblock-prs arms it when it picks it, after #${parent} merges`,
    trailer === undefined ? undefined : `declare ${trailer}`,
  ].filter((step) => step !== undefined);

  return Result.ok(
    Arr.toUnshifted('Would:')(steps.map((step) => `  - ${step}`)).join('\n'),
  );
};

if (isDirectlyExecuted(import.meta.url)) {
  const options = parseOptions(Arr.skip(process.argv, 2));

  if (Result.isErr(options)) {
    console.error(`${options.value}\n\n${HELP}`);

    process.exit(1);
  }

  if (options.value === 'help') {
    console.info(HELP);
  } else {
    const result = await openPullRequest(options.value).catch(
      (error: unknown) => Result.err(unknownToString(error)),
    );

    if (Result.isErr(result)) {
      console.error(result.value);

      process.exit(1);
    }

    console.info(result.value);
  }
}
