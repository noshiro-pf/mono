import * as fs from 'node:fs/promises';
import { SKIP_CI_LABEL } from 'pr-report-core';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { log } from '../unblock-prs/util.mjs';
import { type ApiContext } from './api.mjs';
import {
  addLabel,
  armAutoMerge,
  createPullRequest,
  findOpenPullRequest,
  lastCommitSubject,
  markReady,
  preflight,
  pushBranch,
  viewPullRequest,
} from './github.mjs';
import { HELP, parseOptions, type Options } from './options.mjs';
import { armBlockedBy, isArmed, mergeAfterTrailer } from './steps.mjs';

/**
 * Opens the pull request for the current branch the way this repository wants
 * one opened: push, create it ready for review, add `skip-ci`, then arm
 * auto-merge.
 *
 * **The order is the point, and it is why this is a script.** `skip-ci` is
 * the only thing holding the merge — the `main` ruleset asks for no
 * approvals, so outside the paths `.github/CODEOWNERS` lists a green branch
 * has nothing else to clear. Arming before the label is arming with nothing
 * holding it, and the window is only as short as whatever runs next. Written
 * down in prose the order is a thing to remember; here it is a thing that
 * happens, and `armBlockedBy` re-reads the pull request and refuses rather
 * than trusting that the label call earlier in this same run did what it said.
 *
 * Every step is skipped when it is already done, so a run that failed part
 * way through is finished by running it again rather than unpicked.
 */
export const openPullRequest = async (
  options: Options,
): Promise<Result<string, string>> => {
  const context = await preflight();

  if (Result.isErr(context)) return context;

  const { api, branch, defaultBranch } = context.value;

  const base = options.base ?? defaultBranch;

  if (options.dryRun) return dryRun(api, branch, base, options);

  const pushed = await pushBranch(branch);

  if (Result.isErr(pushed)) return Result.err(`cannot push: ${pushed.value}`);

  log(`pushed ${branch}`);

  const existing = await findOpenPullRequest(api, branch);

  if (Result.isErr(existing)) return existing;

  const prNumber =
    existing.value === undefined
      ? await open(api, branch, base, options)
      : Result.ok(existing.value.number);

  if (Result.isErr(prNumber)) return prNumber;

  // Re-read rather than reuse what the listing said: between then and now
  // this run has created it, and a draft cannot be armed.
  const created = await viewPullRequest(api, prNumber.value);

  if (Result.isErr(created)) return created;

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

  return arm(api, prNumber.value);
};

/**
 * The step the order exists for. What it acts on is a fresh read: the label
 * call above reported success, which is not the same as the label being on
 * now, and this is the one decision where the difference lands on `main`.
 */
const arm = async (
  api: ApiContext,
  prNumber: number,
): Promise<Result<string, string>> => {
  const current = await viewPullRequest(api, prNumber);

  if (Result.isErr(current)) return current;

  const blocked = armBlockedBy(current.value);

  if (blocked !== undefined) {
    return Result.err(`#${prNumber}: not arming auto-merge because ${blocked}`);
  }

  if (isArmed(current.value)) {
    return Result.ok(`#${prNumber}: auto-merge was already armed.`);
  }

  const armed = await armAutoMerge(api, current.value.nodeId);

  if (Result.isErr(armed)) {
    return Result.err(`cannot arm auto-merge: ${armed.value}`);
  }

  return Result.ok(
    [
      `#${prNumber}: opened, ${SKIP_CI_LABEL} on, auto-merge armed.`,
      `Take ${SKIP_CI_LABEL} off only through unblock-prs, by adding merge-queued once it has been reviewed.`,
    ].join('\n'),
  );
};

const open = async (
  api: ApiContext,
  branch: string,
  base: string,
  options: Options,
): Promise<Result<number, string>> => {
  const title = await resolveTitle(options);

  if (Result.isErr(title)) return title;

  const body = await resolveBody(options);

  if (Result.isErr(body)) return body;

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
): Promise<Result<string, string>> => {
  const trailer = mergeAfterTrailer(options.mergeAfter);

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
): Promise<Result<string, string>> => {
  const existing = await findOpenPullRequest(api, branch);

  if (Result.isErr(existing)) return existing;

  const title = await resolveTitle(options);

  const trailer = mergeAfterTrailer(options.mergeAfter);

  const steps: readonly string[] = [
    `push ${branch} to origin`,
    existing.value === undefined
      ? `open a pull request against ${base} titled ${JSON.stringify(Result.isOk(title) ? title.value : '(unreadable)')}`
      : `#${existing.value.number} is open already; leave it as it is`,
    existing.value?.isDraft === true
      ? `#${existing.value.number}: mark it ready for review`
      : undefined,
    `add ${SKIP_CI_LABEL}`,
    existing.value !== undefined && isArmed(existing.value)
      ? 'auto-merge is armed already'
      : `re-read it, and arm auto-merge only if ${SKIP_CI_LABEL} is on`,
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
